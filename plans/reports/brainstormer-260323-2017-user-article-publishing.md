# Brainstorm Report: User Article Publishing Feature

**Date:** 2026-03-23
**Status:** Agreed
**Type:** Feature Development

---

## Problem Statement

ThinkNote hiện chỉ hỗ trợ admin tạo bài viết qua file markdown. Cần cho phép registered users đăng bài kiến thức trực tiếp trên web với:
- Chỉ registered users mới được đăng
- UI hỗ trợ chọn category/tag có sẵn
- Hiển thị tên tác giả + avatar
- Giao diện chuyên nghiệp, dễ sử dụng

## Quyết Định Đã Thống Nhất

| Quyết định | Lựa chọn | Lý do |
|---|---|---|
| Storage | PostgreSQL (Prisma) | Multi-user, dễ query/filter/paginate |
| Moderation | Draft + Pending + Published | Linh hoạt, kiểm soát chất lượng |
| Editor | TipTap (Rich Text WYSIWYG) | Mature, extensible, Next.js compatible |
| Permissions | Full CRUD own articles | User toàn quyền bài mình, admin toàn quyền tất cả |
| Image Upload | Local storage (public/uploads) | Đơn giản, không cần external service |
| Author Display | Tên + Avatar | Chuyên nghiệp nhưng không phức tạp |
| Article Display | Chung với KB, badge "Community" | Tăng visibility, dễ discover |

---

## Kiến Trúc Giải Pháp

### 1. Database Schema (Prisma)

```prisma
model Article {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  description  String
  content      String   @db.Text    // Markdown/HTML content
  locale       String   @default("en")

  // Metadata
  status       ArticleStatus @default(DRAFT)
  categories   String[]      // JSON array of category names
  tags         String[]      // JSON array of tag names
  gradientFrom String?
  gradientTo   String?
  coverImage   String?

  // Author
  authorId     String
  author       User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Moderation
  reviewNote   String?       // Admin feedback khi reject
  publishedAt  DateTime?

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([authorId])
  @@index([status])
  @@index([locale])
  @@index([slug])
}

enum ArticleStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}
```

**User model** cần thêm relation:
```prisma
model User {
  // ... existing fields
  articles  Article[]
}
```

### 2. Article Workflow

```
User tạo bài → DRAFT (lưu nháp, chỉ user thấy)
                  ↓ Submit
               PENDING (chờ admin duyệt)
                  ↓ Admin review
        PUBLISHED ← hoặc → REJECTED (kèm reviewNote)
                              ↓ User sửa & re-submit
                           PENDING (lại)
```

### 3. API Routes

| Method | Route | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/articles` | List articles (filter by status, author, category, tag) | Public (published only) |
| GET | `/api/articles/[id]` | Get single article | Public (published) or owner |
| POST | `/api/articles` | Create article | Authenticated |
| PUT | `/api/articles/[id]` | Update article | Owner or Admin |
| DELETE | `/api/articles/[id]` | Delete article | Owner or Admin |
| POST | `/api/articles/[id]/submit` | Submit for review (DRAFT→PENDING) | Owner |
| POST | `/api/articles/[id]/review` | Approve/Reject (admin) | Admin |
| GET | `/api/articles/categories` | Get all available categories | Public |
| GET | `/api/articles/tags` | Get all available tags | Public |
| POST | `/api/upload` | Upload image | Authenticated |

### 4. Frontend Pages

| Route | Mô tả | Access |
|---|---|---|
| `/[locale]/articles/create` | Tạo bài viết mới | Authenticated |
| `/[locale]/articles/[slug]/edit` | Chỉnh sửa bài viết | Owner or Admin |
| `/[locale]/articles/my` | Dashboard bài viết của tôi | Authenticated |
| `/[locale]/admin/articles` | Admin moderation panel | Admin |

**Trang chủ & categories/tags** hiển thị cả file-based KB + DB articles (merged, sorted by date).

### 5. Editor (TipTap)

**Packages cần cài:**
```
@tiptap/react @tiptap/pm @tiptap/starter-kit
@tiptap/extension-link @tiptap/extension-image
@tiptap/extension-placeholder @tiptap/extension-table
@tiptap/extension-table-row @tiptap/extension-table-cell
@tiptap/extension-table-header @tiptap/extension-code-block-lowlight
```

**Editor Features:**
- Toolbar: Heading (H1-H3), Bold, Italic, Code, Link, Image, Lists, Table, Blockquote, Code Block
- Markdown shortcuts (type `#` → heading, `**` → bold, etc.)
- Image upload: drag & drop / paste / button → POST `/api/upload` → insert URL
- Placeholder text hướng dẫn user
- Auto-save draft mỗi 30 giây

**UI Layout của trang Create/Edit:**
```
┌─────────────────────────────────────────────────┐
│ ← Back to My Articles                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Title: [____________________________________]  │
│                                                 │
│  Description: [______________________________]  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ B I U  H1 H2 H3  • ─  "" </>  🔗 🖼 📊│   │
│  ├─────────────────────────────────────────┤   │
│  │                                         │   │
│  │  Start writing your article...          │   │
│  │                                         │   │
│  │                                         │   │
│  │                                         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌── Sidebar ──────────────────────────────┐   │
│  │ Categories: [Select or create ▾]        │   │
│  │   ☑ DevOps  ☑ Database  ☐ Security     │   │
│  │                                         │   │
│  │ Tags: [Type to search/add ▾]            │   │
│  │   🏷 docker  🏷 kubernetes  + Add new   │   │
│  │                                         │   │
│  │ Cover Image: [Upload or URL]            │   │
│  │ Locale: [EN ▾]                          │   │
│  │ Card Colors: [From ▾] [To ▾]            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Save Draft]  [Preview]  [Submit for Review]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6. My Articles Dashboard

```
┌─────────────────────────────────────────────────┐
│ My Articles                    [+ New Article]  │
├─────────────────────────────────────────────────┤
│ Filter: [All ▾]  [Draft | Pending | Published]  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 📝 "Docker Best Practices"                 │ │
│ │ Status: 🟢 Published  │  📅 2026-03-20     │ │
│ │ Categories: DevOps  │  Tags: docker, ci/cd  │ │
│ │                        [Edit] [Delete]      │ │
│ ├─────────────────────────────────────────────┤ │
│ │ 📝 "Redis Caching Patterns"                │ │
│ │ Status: 🟡 Pending Review                  │ │
│ │ Categories: Database  │  Tags: redis, cache │ │
│ │                        [Edit] [Withdraw]    │ │
│ ├─────────────────────────────────────────────┤ │
│ │ 📝 "Kubernetes Security"                   │ │
│ │ Status: 🔴 Rejected                        │ │
│ │ Reason: "Thiếu phần kết luận"              │ │
│ │                        [Edit] [Re-submit]   │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 7. Admin Moderation Panel

```
┌─────────────────────────────────────────────────┐
│ Article Moderation              [Pending: 5]    │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ "Docker Best Practices" by Nguyen Van A     │ │
│ │ Submitted: 2026-03-22  │  Categories: DevOps│ │
│ │              [Preview] [Approve] [Reject ▾] │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 8. Image Upload

**Endpoint:** `POST /api/upload`
- Accept: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Save to: `public/uploads/articles/{year}/{month}/{filename}`
- Return: `{ url: "/uploads/articles/2026/03/image-abc123.jpg" }`
- Security: Auth required, file type validation, size limit

### 9. Tích Hợp Với Hệ Thống Hiện Tại

**Merge file-based + DB articles:**
- Sửa `getSortedPostsData()` trong `src/lib/posts.ts` để merge kết quả từ cả file system và database
- DB articles có thêm field `source: 'community'` để phân biệt
- Hiển thị badge "Community" trên KnowledgeCard cho bài từ DB
- Categories/tags page aggregate cả 2 nguồn

**Author display trên bài viết:**
- Thêm author section dưới title: avatar (32px circle) + tên + ngày đăng
- Fetch author info từ User table qua relation

---

## Implementation Phases (Đề xuất)

| Phase | Nội dung | Ước lượng |
|---|---|---|
| 1 | DB schema (Article model) + API routes CRUD | Core |
| 2 | TipTap editor + Create/Edit pages | Core |
| 3 | Image upload API + editor integration | Core |
| 4 | My Articles dashboard | Core |
| 5 | Admin moderation panel | Core |
| 6 | Merge display (KB + DB articles) + Author info | Core |
| 7 | Category/Tag selector components | Core |
| 8 | Auto-save draft + Preview | Enhancement |
| 9 | i18n (VI translations) | Enhancement |

---

## Risk Assessment

| Risk | Mức độ | Mitigation |
|---|---|---|
| XSS từ user content | Cao | Sanitize HTML output với DOMPurify trước khi render |
| Large image uploads | Trung bình | Size limit 5MB, image compression |
| Spam articles | Trung bình | Moderation workflow + rate limit |
| TipTap SSR hydration | Thấp | `'use client'` + `immediatelyRender: false` |
| DB migration conflicts | Thấp | Prisma migration versioning |

## Security Considerations

- **Content Sanitization**: Dùng DOMPurify server-side trước khi lưu DB
- **File Upload**: Validate MIME type + extension, random filename, no path traversal
- **Authorization**: Server-side check owner/admin trên mọi mutation
- **Rate Limiting**: Giới hạn tạo article (10/ngày/user) và upload (50/ngày/user)
- **CSRF**: Better Auth đã handle qua session tokens

## Tech Stack Additions

| Package | Purpose |
|---|---|
| `@tiptap/react` + extensions | Rich text editor |
| `dompurify` + `jsdom` | Server-side HTML sanitization |
| `multer` hoặc native `formData` | File upload handling |
| `sharp` (optional) | Image resize/optimize |

---

## Unresolved Questions

1. Có cần hỗ trợ co-authoring (nhiều tác giả 1 bài) không? → Giả sử KHÔNG
2. Có cần version history cho bài viết không? → Giả sử KHÔNG, thêm sau nếu cần
3. Bài viết file-based hiện tại có cần hiển thị author "Admin/System" không?
