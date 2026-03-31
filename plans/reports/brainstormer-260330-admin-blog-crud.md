# Brainstorm Report: Admin Blog CRUD Feature

**Date:** 2026-03-30
**Status:** Agreed — Ready for Planning

---

## Problem Statement

Blog hiện tại chỉ dùng file markdown (src/data/blog/{locale}/*.md), không có UI quản lý.
Admin cần tạo, edit, import blog trực tiếp trên web.

## Requirements

- Admin tạo blog trực tiếp bằng Tiptap WYSIWYG editor
- Import blog từ file markdown (.md)
- Edit/chỉnh sửa blog posts đã tạo
- Mood selector cho blog
- Cover image upload
- Hỗ trợ đa ngôn ngữ (en/vi)

## Agreed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Storage | PostgreSQL (DB only) | Dễ CRUD, search, filter từ web |
| Data Model | Mở rộng Article model | Thêm `type` enum + `mood` field. DRY, tái sử dụng CRUD |
| Workflow | Admin direct publish | Draft ↔ Published. Không cần moderation (admin là người viết) |
| API Design | `/api/blog` riêng | Tách biệt logic blog vs community articles |
| Admin UI | `/admin/blog` riêng | Trang riêng trong admin dashboard |

## Evaluated Approaches

### Approach A: Mở rộng Article model + API riêng ✅ CHOSEN
- **Pros:** DRY schema, tái sử dụng editor/form/upload, API tách biệt sạch
- **Cons:** Article model thêm fields, cần filter theo type
- **Reuse:** ~75% existing code

### Approach B: Tạo model Blog riêng
- **Pros:** Schema tách biệt hoàn toàn
- **Cons:** Duplicate CRUD logic, editor, form patterns. Vi phạm DRY
- **Rejected:** Quá nhiều code duplicate

### Approach C: Mở rộng cả Article model + API
- **Pros:** Ít endpoint nhất
- **Cons:** Mix blog logic với community article moderation
- **Rejected:** Workflow khác nhau, nên tách API

## Architecture

### Schema Changes (Prisma)
```prisma
enum ContentType {
  ARTICLE
  BLOG_POST
}

model Article {
  // existing fields...
  type        ContentType @default(ARTICLE)
  mood        String?     // Blog-specific: inspired, reflective, joyful...
  readingTime Int?        // Auto-calculated from content
}
```

### API Endpoints (`/api/blog/`)
- `GET /api/blog` — List blog posts (filter by locale, status)
- `POST /api/blog` — Create blog post (admin only)
- `PUT /api/blog/[id]` — Update blog post
- `DELETE /api/blog/[id]` — Delete blog post
- `POST /api/blog/import` — Import from markdown file

### Admin Pages (`/admin/blog/`)
- `/admin/blog` — Blog dashboard (list, status filter)
- `/admin/blog/create` — Create new blog (Tiptap editor + mood + cover image)
- `/admin/blog/edit/[id]` — Edit existing blog

### Frontend Updates
- `blog-posts.ts` → query DB thay vì read files
- `BlogListClient`, `BlogCard`, `MoodFilter` → giữ nguyên UI, đổi data source

## Reusable Components (không cần viết lại)
- `ArticleEditor` + `ArticleEditorToolbar` (Tiptap) — 100%
- `/api/upload` (image upload) — 100%
- `auth-guard.ts` (requireAdmin) — 100%
- `ContentSanitizer` (DOMPurify) — 100%
- `ArticleForm` pattern — ~80% (thêm mood, bỏ submit workflow)
- `MarkdownProcessor` — 100% (cho import)

## Risks & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Article model phình to | Medium | `type` enum phân biệt rõ, index theo type |
| Blog search trộn với KB | Medium | Query luôn filter `type = BLOG_POST` |
| Migration blog cũ lỗi | Low | Chỉ 2 files, test kỹ trước |
| Breaking existing article API | Low | API riêng, không sửa existing endpoints |

## Success Criteria
- [ ] Admin tạo blog bằng Tiptap editor trên web
- [ ] Admin import blog từ file .md
- [ ] Admin edit/delete blog posts
- [ ] Mood selector hoạt động
- [ ] Cover image upload hoạt động
- [ ] Blog hiển thị đúng trên frontend (cả en/vi)
- [ ] Existing community article system không bị ảnh hưởng
- [ ] Blog cũ từ file được migrate vào DB

## Next Steps
→ Tạo implementation plan chi tiết với phases và tasks
