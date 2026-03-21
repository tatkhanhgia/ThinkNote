# Phase 1: Quick Wins — Bugs, Accessibility, Performance

**Priority:** Critical
**Effort:** ~3 hours
**Dependencies:** None

## Context

- [Audit Report](../reports/uiux-audit-260321-2350-thinknote-comprehensive-audit.md)

## Items (8)

### 1.1 Fix Duplicate Font Loading (30 min)
**Files:** `src/styles/globals.css:41`, `src/app/[locale]/layout.tsx:14`
**Issue:** Fonts loaded twice — CSS `@import` (render-blocking) + `next/font` (optimized). Vietnamese subset missing.

**Steps:**
1. Delete `@import url('https://fonts.googleapis.com/css2?family=Fira+Sans:...')` from `globals.css:41`
2. Update `layout.tsx` font config:
   ```tsx
   const firaSans = Fira_Sans({
     subsets: ['latin', 'vietnamese'],
     weight: ['400', '500', '600', '700'],
     variable: '--font-fira-sans',
   });
   ```
3. Add Fira Code via `next/font`:
   ```tsx
   import { Fira_Sans, Fira_Code } from 'next/font/google';
   const firaCode = Fira_Code({
     subsets: ['latin'],
     weight: ['400', '500'],
     variable: '--font-fira-code',
   });
   ```
4. Update `globals.css` body/code font-family to use CSS variables
5. Verify Vietnamese text renders correctly at `/vi`

### 1.2 Fix Non-Localized CTA Links (15 min)
**File:** `src/app/[locale]/categories/page.tsx:178-186`
**Issue:** `href="/topics"` and `href="/tags"` missing locale prefix → broken routing for Vietnamese.

**Steps:**
1. Change `href="/topics"` → `href={`/${locale}/topics`}`
2. Change `href="/tags"` → `href={`/${locale}/tags`}`
3. Verify both links work at `/en/categories` and `/vi/categories`

### 1.3 Dynamic Homepage Stats (45 min)
**File:** `src/app/[locale]/page.tsx:60-81`
**Issue:** Hardcoded "50+", "10+", "25+" don't match actual content (16 articles, 14 categories).

**Steps:**
1. Import `getSortedPostsData`, `getAllCategoriesWithSlug`, `getAllTags` from `@/lib/posts`
2. Compute counts at component level (server component, so this is sync):
   ```tsx
   const posts = getSortedPostsData(locale);
   const categories = getAllCategoriesWithSlug(locale);
   const tags = getAllTags(locale);
   ```
3. Replace hardcoded values:
   - "50+" → `{posts.length}` articles
   - "10+" → `{categories.length}` categories
   - "25+" → `{tags.length}` technologies
   - "24/7" → replace with `{new Set(posts.flatMap(p => p.categories || [])).size}+` or similar real metric (e.g., languages count)
4. Replace "24/7 Always Learning" with a real metric like unique tag count

### 1.4 Cap Animation Delays (15 min)
**Files:** `src/app/[locale]/topics/page.tsx`, `src/app/[locale]/categories/page.tsx`
**Issue:** `index * 100ms` scales linearly — card #50 waits 5 seconds.

**Steps:**
1. Find all `animationDelay: \`\${index * 100}ms\`` patterns
2. Replace with: `animationDelay: \`\${Math.min(index * 80, 400)}ms\``
3. Verify animation feels snappy with all 16 current cards

### 1.5 Add Skip-to-Content Link (15 min)
**File:** `src/app/[locale]/layout.tsx`
**Issue:** No skip-to-main-content link — accessibility gap.

**Steps:**
1. Add as first child inside `<body>` (before header):
   ```tsx
   <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
     Skip to main content
   </a>
   ```
2. Find the `<main>` element and add `id="main-content"`
3. Test: Tab key from page load should show skip link

### 1.6 Fix Blog Plural Grammar (15 min)
**File:** `src/app/[locale]/blog/page.tsx`
**Issue:** Shows "1 moods" instead of "1 mood".

**Steps:**
1. Find the mood count display string
2. Add singular/plural logic: `{uniqueMoods.length} {uniqueMoods.length === 1 ? 'mood' : 'moods'}`
3. Move hardcoded strings (`'Back to home'`, `'Về trang chủ'`) to `messages/en.json` and `messages/vi.json`

### 1.7 Compute Actual Reading Time (30 min)
**File:** `src/app/[locale]/topics/[topic]/page.tsx`
**Issue:** Reading time hardcoded to 5 minutes regardless of article length.

**Steps:**
1. Check if `ReadingTime.tsx` component already exists (it does in `src/components/ui/ReadingTime.tsx`)
2. After `getPostData()`, compute:
   ```tsx
   const wordCount = (postData.contentHtml || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
   const readingTime = Math.max(1, Math.ceil(wordCount / 200));
   ```
3. Replace hardcoded `5` with computed `readingTime`

### 1.8 Fix Color Contrast (30 min)
**Files:** `src/styles/globals.css`, various component files
**Issue:** `text-gray-300` on dark bg = 3.5:1 contrast (fails WCAG AA). `text-gray-400` on white bg = borderline.

**Steps:**
1. In article detail breadcrumb: `text-gray-300` → `text-gray-200`
2. In stat labels on white bg: ensure `text-gray-600` (already compliant)
3. Search for `text-gray-400` on white/light backgrounds and upgrade to `text-gray-500`
4. Verify with contrast checker tool

## Success Criteria

- [ ] No duplicate font requests in Network tab
- [ ] Vietnamese text renders with Fira Sans (no system font fallback)
- [ ] Categories CTA links work in both `/en` and `/vi`
- [ ] Homepage stats match actual content counts
- [ ] Animation delay capped at 400ms max
- [ ] Skip-to-content visible on Tab key press
- [ ] Blog shows "1 mood" not "1 moods"
- [ ] Reading time varies by article length
- [ ] No WCAG AA contrast failures on text elements
