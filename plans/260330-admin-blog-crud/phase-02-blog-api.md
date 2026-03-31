# Phase 2: Blog API Endpoints

## Context Links
- [Article CRUD Route](../../src/app/api/articles/route.ts) — Pattern to follow
- [Article ID Route](../../src/app/api/articles/[id]/route.ts) — Update/Delete pattern
- [Markdown Import](../../src/app/api/markdown/import/route.ts) — Import pattern
- [Auth Guard](../../src/lib/auth-guard.ts) — requireAdmin helper
- [Content Sanitizer](../../src/lib/security/ContentSanitizer.ts)

## Overview
- **Priority:** P1 (blocks Phase 3 & 4)
- **Status:** Complete
- **Effort:** 2.5h

Create `/api/blog` CRUD endpoints for admin blog management. Adapt from existing article API patterns. All endpoints admin-only.

## Key Insights
- Article API uses `generateUniqueSlug()` for collision-safe slugs — reuse
- Article API has pagination, filtering — blog needs similar but simpler
- Blog workflow: no PENDING/review states. Admin creates as DRAFT or PUBLISHED directly
- Content stored as HTML (from Tiptap) — same as articles
- Markdown import: parse .md → extract frontmatter → convert to HTML → save as Article with type=BLOG_POST

## Requirements

### Functional
- GET /api/blog — List blog posts (filter: locale, status, mood)
- POST /api/blog — Create blog post (admin only)
- GET /api/blog/[id] — Get single blog post
- PUT /api/blog/[id] — Update blog post (admin only)
- DELETE /api/blog/[id] — Delete blog post (admin only)
- POST /api/blog/import — Import from markdown file (admin only)

### Non-functional
- All endpoints require admin auth
- Response format consistent with article API
- Sanitize HTML content
- Auto-calculate readingTime on create/update

## Architecture

```
/api/blog/
├── route.ts          (GET list + POST create)
├── [id]/
│   └── route.ts      (GET single + PUT update + DELETE)
└── import/
    └── route.ts      (POST markdown import)
```

## Related Code Files

### Create
- `src/app/api/blog/route.ts` — List + Create
- `src/app/api/blog/[id]/route.ts` — Get + Update + Delete
- `src/app/api/blog/import/route.ts` — Markdown import

### Reuse (no modification)
- `src/lib/auth-guard.ts` — requireAdmin()
- `src/lib/security/ContentSanitizer.ts` — sanitizeHtml()
- `src/lib/markdown/MarkdownProcessor.ts` — for import

## Implementation Steps

### 1. Create `src/app/api/blog/route.ts`

**GET handler:**
- `requireAdmin()` auth check
- Query: `prisma.article.findMany({ where: { type: 'BLOG_POST', locale, status?, mood? } })`
- Include author relation
- Sort by date DESC
- Pagination: skip, take params

**POST handler:**
- `requireAdmin()` auth check
- Body: `{ title, description, content, locale, mood, tags, coverImage, status, date }`
- Generate unique slug from title + locale
- Calculate readingTime from content text
- Sanitize content HTML
- Create with `type: 'BLOG_POST'`
- If status=PUBLISHED, set publishedAt=now()

### 2. Create `src/app/api/blog/[id]/route.ts`

**GET handler:**
- `requireAdmin()` auth check
- Query: `prisma.article.findUnique({ where: { id, type: 'BLOG_POST' } })`

**PUT handler:**
- `requireAdmin()` auth check
- Body: same fields as POST (partial update)
- Regenerate slug if title changed
- Recalculate readingTime if content changed
- Sanitize content
- If status changed to PUBLISHED → set publishedAt

**DELETE handler:**
- `requireAdmin()` auth check
- `prisma.article.delete({ where: { id } })`

### 3. Create `src/app/api/blog/import/route.ts`

**POST handler:**
- `requireAdmin()` auth check
- Accept multipart form with .md file + locale
- Parse markdown with gray-matter (extract frontmatter: title, description, mood, tags, date)
- Convert markdown body to HTML via remark pipeline
- Calculate readingTime
- Sanitize HTML
- Create Article with type=BLOG_POST
- Return created blog post

### 4. Utility: readingTime calculation

```typescript
function calculateReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
```

Reuse from existing `blog-posts.ts` which already has this logic.

## Todo List
- [x] Create /api/blog/route.ts (GET list + POST create)
- [x] Create /api/blog/[id]/route.ts (GET + PUT + DELETE)
- [x] Create /api/blog/import/route.ts (markdown import)
- [x] Add readingTime calculation utility
- [x] Test all endpoints with Postman/curl
- [x] Verify admin-only access (non-admin gets 403)

## Success Criteria
- All 6 endpoints return correct responses
- Non-admin requests return 403
- Blog posts have type=BLOG_POST in DB
- Slug uniqueness enforced per locale
- ReadingTime auto-calculated
- Markdown import correctly parses frontmatter + converts to HTML
- Existing article endpoints unaffected

## Risk Assessment
- **Medium:** Slug collision between articles and blog posts (same table)
  - **Mitigation:** `generateUniqueSlug` already handles collisions
- **Low:** Content sanitization bypass
  - **Mitigation:** Reuse existing ContentSanitizer

## Security Considerations
- All endpoints behind `requireAdmin()` — no public access
- HTML sanitized via DOMPurify before storage
- File upload validation for markdown import (check .md extension, size limit)

## Next Steps
- Phase 3: Admin UI consumes these endpoints
- Phase 4: Blog frontend reads published posts via direct Prisma query
