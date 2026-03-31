# Phase 3: Admin Blog UI

## Context Links
- [ArticleForm](../../src/components/ui/article-form.tsx) — Base form pattern
- [ArticleEditor](../../src/components/ui/article-editor.tsx) — Tiptap editor
- [AdminArticlesClient](../../src/components/ui/admin-articles-client.tsx) — Admin list pattern
- [Admin Layout](../../src/app/[locale]/admin/layout.tsx) — Navigation
- [Article Create Page](../../src/app/[locale]/articles/create/page.tsx) — Create page pattern
- [Blog Moods](../../src/lib/blog-moods.ts) — Mood definitions

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 2.5h

Create admin blog management pages: list, create, edit. Reuse ArticleEditor (Tiptap) and adapt ArticleForm pattern with blog-specific fields (mood selector, no categories, direct publish).

## Key Insights
- ArticleForm has auto-save (30s debounce) — reuse for blog
- ArticleEditor is generic (no article-specific code) — 100% reuse
- Admin layout already has nav structure — just add "Blog" link
- Blog moods: 8 predefined moods with icons + bilingual labels
- Blog workflow simpler: Save Draft / Publish (no "Submit for Review")
- Blog-specific fields: mood (required), date (optional, defaults to now)
- Blog does NOT need: categories, gradientFrom, gradientTo

## Requirements

### Functional
- Admin blog dashboard: list all blog posts with status/mood filters
- Create blog post: Tiptap editor + mood selector + cover image + tags
- Edit blog post: load existing, save changes
- Delete blog post: confirmation dialog
- Import markdown: upload .md file
- Direct publish: no moderation workflow

### Non-functional
- Responsive design (mobile-friendly admin)
- Auto-save drafts every 30 seconds
- Loading states for all async operations
- Match existing admin UI style

## Architecture

```
/admin/blog/                    → Blog management dashboard (list)
/admin/blog/create/             → Create new blog post
/admin/blog/edit/[id]/          → Edit existing blog post

Components:
├── AdminBlogClient.tsx         → Blog list with filters (reuse AdminArticlesClient pattern)
├── BlogForm.tsx                → Blog form with mood selector (adapt ArticleForm)
└── (ArticleEditor.tsx)         → Reuse as-is
```

## Related Code Files

### Create
- `src/app/[locale]/admin/blog/page.tsx` — Blog management page
- `src/app/[locale]/admin/blog/create/page.tsx` — Create blog page
- `src/app/[locale]/admin/blog/edit/[id]/page.tsx` — Edit blog page
- `src/components/ui/admin-blog-client.tsx` — Blog list component
- `src/components/ui/blog-form.tsx` — Blog form component

### Modify
- `src/app/[locale]/admin/layout.tsx` — Add "Blog" to admin nav
- `src/messages/en.json` — Add blog admin translation keys
- `src/messages/vi.json` — Add blog admin translation keys (Vietnamese)

### Reuse (no modification)
- `src/components/ui/article-editor.tsx`
- `src/components/ui/article-editor-toolbar.tsx`

## Implementation Steps

### 1. Update Admin Layout Navigation

In `src/app/[locale]/admin/layout.tsx`, add blog link to nav:
```tsx
{ name: t('Admin.navigation.blog'), href: `/${locale}/admin/blog`, icon: PenSquare }
```

### 2. Create BlogForm Component (`src/components/ui/blog-form.tsx`)

Adapt from ArticleForm pattern:
- **Fields:** title, description, content (Tiptap), mood (dropdown), tags (input), coverImage (upload), locale, date
- **Mood dropdown:** Use BLOG_MOODS from blog-moods.ts with icons
- **Actions:** "Save Draft" (status=DRAFT) and "Publish" (status=PUBLISHED)
- **Auto-save:** 30s debounce when title exists (save as DRAFT)
- **No categories/gradients** (not needed for blog)
- **Dynamic import** ArticleEditor with `ssr: false`

### 3. Create AdminBlogClient Component (`src/components/ui/admin-blog-client.tsx`)

Adapt from AdminArticlesClient:
- Fetch blog posts from `/api/blog`
- Table columns: Title, Mood (icon), Date, Status, Actions
- Filter tabs: All, Draft, Published
- Actions per row: Edit, Delete
- Import button: triggers markdown import dialog
- Create button: links to /admin/blog/create

### 4. Create Admin Blog Dashboard Page

`src/app/[locale]/admin/blog/page.tsx`:
- Server component, minimal wrapper
- Import AdminBlogClient
- Pass locale prop

### 5. Create Blog Create Page

`src/app/[locale]/admin/blog/create/page.tsx`:
- Server component wrapper
- Import BlogForm in create mode
- Breadcrumb: Admin > Blog > Create

### 6. Create Blog Edit Page

`src/app/[locale]/admin/blog/edit/[id]/page.tsx`:
- Server component, fetch blog post by ID
- Pass existing data to BlogForm in edit mode
- Breadcrumb: Admin > Blog > Edit > {title}
- Handle 404 if post not found

### 7. Markdown Import Dialog

In AdminBlogClient:
- "Import Markdown" button opens modal/dialog
- File input (.md files only)
- Locale selector
- Submit → POST /api/blog/import
- On success: refresh list, show toast

## Todo List
- [x] Add "Blog" link to admin layout navigation
- [x] Create BlogForm component (mood selector, auto-save, publish)
- [x] Create AdminBlogClient component (list, filter, delete, import)
- [x] Create /admin/blog page (dashboard)
- [x] Create /admin/blog/create page
- [x] Create /admin/blog/edit/[id] page
- [x] Add translation keys to en.json and vi.json
- [x] Test create, edit, delete, import flows

## Success Criteria
- Admin can see blog list in /admin/blog
- Admin can create blog post with Tiptap editor + mood
- Admin can edit existing blog post
- Admin can delete blog post
- Admin can import .md file as blog post
- Auto-save works (30s debounce)
- Mood selector shows all 8 moods with icons
- Navigation shows Blog link in admin sidebar

## Risk Assessment
- **Low:** Component size > 200 lines
  - **Mitigation:** Split form into BlogForm + MoodSelector sub-components if needed
- **Low:** Dynamic import SSR issues with Tiptap
  - **Mitigation:** Use same `ssr: false` pattern as ArticleForm

## Security Considerations
- All pages behind admin layout guard (server-side role check)
- API calls use admin-only endpoints
- File upload validated (markdown only, size limit)

## Next Steps
- Phase 4: Blog frontend reads published posts from DB
- Phase 5: Final i18n keys and testing
