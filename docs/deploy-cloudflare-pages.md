# Hướng dẫn Deploy lên Cloudflare Pages

> **Project:** ThinkNote (Next.js 14 + next-intl + Markdown)
> **Ngày:** 2026-03-17
> **Phương pháp:** Static Export → Cloudflare Pages

---

## Tổng quan

Project này dùng `fs` để đọc file Markdown tại **build time** → phù hợp với **Static Export**.
Không cần Cloudflare Workers runtime, deploy đơn giản hơn và miễn phí hoàn toàn.

### Tại sao Static Export?

| | Static Export | next-on-pages (Workers) |
|---|---|---|
| Độ phức tạp | Thấp | Cao |
| `fs` support | Build-time ✅ | Runtime ❌ |
| `next-intl` middleware | Cần bypass | Có thể hoạt động |
| Phù hợp Knowledge Base | ✅ | Overkill |
| Free tier | Unlimited | Giới hạn |

---

## Bước 1 — Cài Cloudflare Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

> Sau lệnh `wrangler login`, trình duyệt mở ra → đăng nhập Cloudflare account.

---

## Bước 2 — Cấu hình Static Export trong Next.js

Mở `next.config.mjs`, thêm `output: 'export'`:

```js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  output: 'export',        // ← thêm dòng này
  trailingSlash: true,     // ← cần cho Cloudflare Pages routing
  images: {
    unoptimized: true,     // ← Next.js Image optimization không hỗ trợ static export
  },
};

export default withNextIntl(nextConfig);
```

---

## Bước 3 — Xử lý next-intl với Static Export

`next-intl` middleware không chạy trong static export. Cần thêm `generateStaticParams` cho tất cả các `[locale]` pages.

### 3a. Tạo file helper locales

Tạo `src/lib/locales.ts`:

```ts
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
```

### 3b. Thêm `generateStaticParams` vào các page chưa có

Mở từng file page trong `src/app/[locale]/` và thêm:

**`src/app/[locale]/page.tsx`** — Home page:
```ts
import { locales } from '@/lib/locales';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**`src/app/[locale]/search/page.tsx`**:
```ts
import { locales } from '@/lib/locales';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**`src/app/[locale]/categories/page.tsx`**:
```ts
import { locales } from '@/lib/locales';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**`src/app/[locale]/tags/page.tsx`**:
```ts
import { locales } from '@/lib/locales';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**`src/app/[locale]/topics/page.tsx`** (trang danh sách topics):
```ts
import { locales } from '@/lib/locales';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**`src/app/[locale]/categories/[category]/page.tsx`**:
```ts
import { locales } from '@/lib/locales';
import { getAllCategories, slugify } from '@/lib/posts';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    const categories = getAllCategories(locale);
    for (const category of categories) {
      params.push({ locale, category: slugify(category) });
    }
  }
  return params;
}
```

**`src/app/[locale]/tags/[tag]/page.tsx`**:
```ts
import { locales } from '@/lib/locales';
import { getAllTags, slugify } from '@/lib/posts';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    const tags = getAllTags(locale);
    for (const tag of tags) {
      params.push({ locale, tag: slugify(tag) });
    }
  }
  return params;
}
```

> **`[locale]/topics/[topic]/page.tsx`** đã có `generateStaticParams` rồi ✅

---

## Bước 4 — Tắt middleware cho static export

`src/middleware.ts` với next-intl sẽ không chạy trong static export. Cần đảm bảo locale detection hoạt động client-side.

Mở `src/middleware.ts`, thêm điều kiện:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Với static export, middleware không được gọi
// Redirect root / → /en được xử lý bởi src/app/page.tsx
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [] // disable middleware hoàn toàn
};
```

Đảm bảo `src/app/page.tsx` (root) redirect sang locale mặc định:

```ts
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
```

---

## Bước 5 — Test build local

```bash
npm run build
```

Nếu build thành công, thư mục `out/` được tạo ra với toàn bộ HTML tĩnh.

```bash
# Preview local với static server
npx serve out
```

Kiểm tra tại `http://localhost:3000` (hoặc port npx serve chỉ định).

---

## Bước 6 — Tạo Cloudflare Pages Project

### Cách A: Qua Dashboard (Khuyến nghị lần đầu)

1. Truy cập [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sidebar → **Workers & Pages** → **Create** → **Pages**
3. Chọn **Connect to Git**
4. Authorize GitHub → chọn repo `my-knowledge-base`
5. Cấu hình build settings:

| Setting | Giá trị |
|---|---|
| Framework preset | `Next.js (Static HTML Export)` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node.js version | `20.x` |

6. Click **Save and Deploy**

### Cách B: Qua CLI (wrangler)

```bash
# Build trước
npm run build

# Deploy thư mục out lên Cloudflare Pages
wrangler pages deploy out --project-name=my-knowledge-base
```

Lần đầu tiên chạy sẽ hỏi tên project và tạo mới.

---

## Bước 7 — Cấu hình Custom Domain (Tùy chọn)

1. Dashboard → **Workers & Pages** → chọn project
2. Tab **Custom domains** → **Set up a custom domain**
3. Nhập domain → Cloudflare tự cấu hình DNS + SSL

---

## Bước 8 — Auto Deploy khi push code (CI/CD)

Cloudflare Pages tự động build và deploy mỗi khi push lên branch được cấu hình.

Mặc định:
- `main`/`master` branch → Production URL
- Các branch khác → Preview URL (ví dụ: `feat-xyz.my-knowledge-base.pages.dev`)

---

## Kiểm tra sau deploy

- [ ] Trang home `/en` load đúng
- [ ] Trang `/vi` load đúng
- [ ] Chuyển ngôn ngữ hoạt động
- [ ] Các bài viết đọc được
- [ ] Search hoạt động (client-side)
- [ ] Categories/Tags đúng

---

## Xử lý lỗi thường gặp

### Lỗi: `fs` module not found
**Nguyên nhân:** Một page đọc file tại request time (không phải build time).
**Fix:** Đảm bảo tất cả `fs` calls nằm trong `generateStaticParams` hoặc component server được gọi khi build.

### Lỗi: Dynamic route không export hết pages
**Nguyên nhân:** `generateStaticParams` thiếu locale hoặc thiếu slug.
**Fix:** Kiểm tra log build, thêm params còn thiếu.

### Lỗi: 404 khi refresh trang (SPA routing)
**Nguyên nhân:** Cloudflare Pages cần biết rewrite 404 → index.
**Fix:** Tạo file `public/_redirects`:
```
/*  /index.html  200
```

### Lỗi: `next-intl` không detect locale
**Nguyên nhân:** Middleware bị disable.
**Fix:** Dùng `LanguageSwitcher` component để chuyển ngôn ngữ thủ công; URL prefix `/en/` và `/vi/` vẫn hoạt động đúng.

---

## Tóm tắt lệnh

```bash
# 1. Cài wrangler
npm install -g wrangler

# 2. Login Cloudflare
wrangler login

# 3. Build project
npm run build

# 4. Deploy lần đầu
wrangler pages deploy out --project-name=my-knowledge-base

# 5. Deploy các lần sau (sau khi push git → auto deploy)
# Hoặc deploy thủ công:
npm run build && wrangler pages deploy out --project-name=my-knowledge-base
```

---

## Tài nguyên

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export Docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [next-intl Static Export](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)
