# Code Review: Admin Blog CRUD Feature

**Reviewer:** code-reviewer | **Date:** 2026-03-30
**Scope:** 14 files | ~1,330 LOC | Feature: Admin Blog CRUD
**Branch:** master (uncommitted changes)

---

## Overall Assessment

Solid implementation that correctly extends the existing Article model with a ContentType discriminator to support blog posts alongside community articles. The code is consistent with existing patterns in the codebase (`/api/articles/` routes). Auth guards, content sanitization, and pagination are all present. There are **no critical security vulnerabilities**, but several medium-priority issues warrant attention before merging.

---

## Critical Issues

**None found.** Auth, sanitization, and data isolation are correctly implemented.

---

## High Priority

### H1. `generateUniqueSlug` duplicated in 3 files (DRY violation)

The exact same `generateUniqueSlug` function is copy-pasted in:
- `src/app/api/blog/route.ts` (lines 17-30)
- `src/app/api/blog/[id]/route.ts` (lines 17-30)
- `src/app/api/blog/import/route.ts` (lines 15-28)
- Already exists in `src/app/api/articles/route.ts` and `src/app/api/articles/[id]/route.ts`

**Impact:** If the slug generation logic needs fixing (e.g., collision handling), it must be updated in 5+ places. Bug-prone.

**Fix:** Extract to a shared utility, e.g., `src/lib/slug-utils.ts`:
```typescript
export async function generateUniqueSlug(
  title: string, locale: string,
  fallback: string = 'article', excludeId?: string
): Promise<string> { ... }
```

### H2. No locale validation on API inputs

All three blog API routes accept `locale` as an arbitrary string from user input without validation. A request with `locale: "xx"` or `locale: "../../../etc"` would be stored in the database.

**Affected files:**
- `src/app/api/blog/route.ts` line 94
- `src/app/api/blog/[id]/route.ts` line 73
- `src/app/api/blog/import/route.ts` line 41

**Fix:**
```typescript
const VALID_LOCALES = ['en', 'vi'];
const locale = VALID_LOCALES.includes(body.locale as string) ? body.locale as string : 'en';
```

Note: This is also missing in the existing `/api/articles/` routes -- a pre-existing gap, but should be addressed here.

### H3. Blog content served unsanitized to public readers

In `src/lib/blog-posts.ts` line 65, `getBlogPostData()` returns `post.content` directly as `contentHtml`. The content was sanitized at write time via `sanitizeArticleHtml()`, which is good. However, if sanitization rules change in the future (new XSS vectors), stored content remains untreated.

**Impact:** Low-risk currently since DOMPurify is applied on write. But a defense-in-depth approach would sanitize on read as well. This matches the existing pattern in `PostContent.tsx` which relies on pre-sanitized content.

**Recommendation:** Document the "sanitize-on-write" contract explicitly. Alternatively, add a lightweight sanitize-on-read pass for DB-sourced content.

### H4. `getAllBlogMoods` makes redundant full query

`src/lib/blog-posts.ts` lines 91-99: `getAllBlogMoods()` calls `getSortedBlogPosts()` which fetches all published blog posts, then counts moods in JS. For small datasets this is fine, but it should use a `GROUP BY` query as blog posts scale.

**Fix:** Use Prisma `groupBy`:
```typescript
export async function getAllBlogMoods(locale: string = 'en') {
  const results = await prisma.article.groupBy({
    by: ['mood'],
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale },
    _count: { mood: true },
    orderBy: { _count: { mood: 'desc' } },
  });
  return results
    .filter(r => r.mood !== null)
    .map(r => ({ mood: r.mood!, count: r._count.mood }));
}
```

---

## Medium Priority

### M1. Blog GET list endpoint requires admin auth -- no public API for blog listing

`src/app/api/blog/route.ts` line 33: The GET endpoint calls `requireAdmin()`, meaning the blog listing page (`/blog`) cannot use this API. Currently the blog page uses `getSortedBlogPosts()` via server components, which is fine. But this inconsistency with the articles API (which allows public GET) may cause confusion later.

**Recommendation:** Either document this deliberate difference or align with the articles pattern (allow public access for `PUBLISHED` posts, admin access for all statuses).

### M2. Admin edit page has no server-side auth check

`src/app/[locale]/admin/blog/edit/[id]/page.tsx` lines 7-9: This page directly queries Prisma without checking admin session. It relies on the parent `admin/layout.tsx` for protection, which is correct for the layout hierarchy. However, if the page is ever accessed via a direct server action or if the layout guard is bypassed, the raw post data would be returned.

**Current protection chain:** middleware cookie check -> layout session+role check -> page. This is adequate but relies on layout always being rendered.

**Recommendation:** Consider adding `requireAdmin()` call directly in the page, matching the API route pattern for defense-in-depth.

### M3. Delete lacks error handling on client side

`src/components/ui/admin-blog-client.tsx` lines 56-61: `handleDelete` does not check the response status after `fetch`. If the delete fails (network error, 403, etc.), the user gets no feedback, and `fetchPosts()` is still called.

**Fix:**
```typescript
const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
if (!res.ok) {
  const data = await res.json().catch(() => ({}));
  alert(data.error || 'Failed to delete');
}
setDeleting(null);
fetchPosts();
```

### M4. `coverImage` field accepts arbitrary URLs without validation

`src/app/api/blog/route.ts` line 113 and `src/app/api/blog/[id]/route.ts` line 89: The `coverImage` field accepts any string. A malicious admin could store `javascript:` URLs or extremely long strings.

**Impact:** Low since this is admin-only, but still worth validating:
```typescript
if (coverImage && !coverImage.startsWith('https://') && !coverImage.startsWith('/')) {
  return NextResponse.json({ success: false, error: 'Invalid cover image URL' }, { status: 400 });
}
```

### M5. Import endpoint creates posts as PUBLISHED by default

`src/app/api/blog/import/route.ts` line 89: Imported posts are immediately published. This skips any review step. For admin-only operations this is acceptable, but it differs from the article workflow (which defaults to DRAFT).

**Recommendation:** Document this deliberate choice or default to DRAFT for consistency.

### M6. Auto-save in BlogForm triggers on published posts edit

`src/components/ui/blog-form.tsx` line 99: The auto-save guard checks `initialData?.status === 'PUBLISHED'` to skip auto-save. This works on initial load but if the status changes during editing (e.g., user saves as draft first), the guard won't prevent auto-save since `initialData` is never updated.

**Impact:** Low -- the auto-save saves as DRAFT, so it would change a published post back to draft on auto-save. But the guard prevents this for the initial case.

### M7. `mood` field stored as free-text string

The `Article.mood` field is `String?` in the schema. The API routes accept any string value for mood, not just the 8 defined in `BLOG_MOODS`. Invalid moods would be stored but render with fallback display.

**Fix:** Validate against known mood keys in the API:
```typescript
const VALID_MOODS = Object.keys(BLOG_MOODS);
const mood = VALID_MOODS.includes(body.mood as string) ? body.mood as string : null;
```

---

## Low Priority

### L1. `MAX_CONTENT_BYTES` duplicated across routes

100KB limit is defined in `src/app/api/blog/route.ts`, `src/app/api/blog/[id]/route.ts`, and the existing articles routes. Could be a shared constant.

### L2. `toDateStr` helper could handle invalid dates more safely

`src/lib/blog-posts.ts` lines 22-25: If a corrupt date string is stored in DB, `new Date(d).toISOString()` would throw for `Invalid Date`. Consider wrapping in try-catch with fallback.

### L3. Import modal UX -- no file upload, text-only

`src/components/ui/admin-blog-client.tsx`: The import modal only supports pasting markdown text. Supporting `.md` file upload via drag-and-drop or file picker would improve UX. This is a feature request, not a bug.

### L4. Hardcoded locale options in BlogForm

`src/components/ui/blog-form.tsx` lines 136-139: Locale options are hardcoded as "en" and "vi". Should reference a shared locale constant for maintainability.

---

## Edge Cases Found by Scout

1. **Slug collision between blog posts and articles:** Since both use the same `Article` table with `@@unique([slug, locale])`, a blog post slug cannot collide with an article slug. This is correct behavior -- the unique constraint protects data integrity. However, it means a blog post titled "React Guide" and an article titled "React Guide" in the same locale will get different slugs (`react-guide` vs `react-guide-1`). This could be confusing for users.

2. **Empty title slugification:** If `slugify(title)` returns empty string (e.g., title is all special characters like "!!!"), the fallback is `'blog-post'`. Multiple such posts would get `blog-post`, `blog-post-1`, etc. This works correctly due to the slug collision loop.

3. **Status transition edge case in PUT:** The PUT route allows setting any status directly (line 91-97). An admin could set status to `PENDING` or `REJECTED` which are article-workflow statuses not meaningful for blog posts. No validation constrains blog post statuses to `DRAFT`/`PUBLISHED`.

4. **Race condition in generateUniqueSlug:** If two concurrent requests try to create posts with the same title, both could check the same slug, find it available, and then one insert would fail on the unique constraint. The existing articles code has the same issue. Low probability for admin-only operations.

5. **community-posts.ts filter correctness:** The `type: 'ARTICLE'` filter was correctly added to all three query functions in `community-posts.ts`, preventing blog posts from appearing in the KB listings. Verified all three: `getPublishedArticles`, `getCommunityPostsByCategorySlug`, `getCommunityPostsByTag`.

---

## Positive Observations

1. **Consistent architecture:** Blog API routes mirror the existing articles API pattern closely -- same auth guards, same error handling structure, same content sanitization pipeline.

2. **Content sanitization:** All user-submitted HTML goes through `sanitizeArticleHtml()` (DOMPurify with strict allowlists). The import endpoint also sanitizes after markdown-to-HTML conversion.

3. **Data isolation:** The `type: 'ARTICLE'` filter in `community-posts.ts` correctly prevents blog posts from leaking into KB search results. The blog queries correctly filter `type: 'BLOG_POST'`.

4. **Schema design:** Using a discriminator column (`ContentType` enum) on the existing `Article` table is the right approach -- avoids table proliferation while maintaining clean separation. The `@@index([type])` supports efficient queries.

5. **Auto-save with guards:** The blog form implements 30-second auto-save with proper cleanup via `useEffect` return and guard against saving published posts.

6. **Pagination:** Blog list API supports proper cursor-free pagination with configurable page size and max limits.

7. **Tests:** Blog-posts tests were rewritten for the DB-backed implementation with proper Prisma mocking. All 13 tests pass.

---

## Recommended Actions (Priority Order)

1. **[H1]** Extract `generateUniqueSlug` to shared `src/lib/slug-utils.ts` -- eliminates 5-way duplication
2. **[H2]** Add locale validation to all blog API routes (and existing article routes)
3. **[H4]** Replace `getAllBlogMoods` with Prisma `groupBy` query
4. **[M3]** Add error feedback to delete operation in `admin-blog-client.tsx`
5. **[M7]** Validate mood values against `BLOG_MOODS` keys in API routes
6. **[M4]** Validate `coverImage` URL format
7. **[M2]** Consider adding direct auth check in edit page for defense-in-depth

---

## Metrics

| Metric | Value |
|--------|-------|
| Files changed/created | 14 |
| Total LOC | ~1,330 |
| Type Coverage | Good -- TypeScript strict mode, interfaces defined |
| Test Coverage | blog-posts.ts fully covered (13/13 pass), API routes untested |
| Linting Issues | 0 new (pre-existing TS errors in unrelated test files) |
| Security | Auth guards on all API routes, DOMPurify sanitization, content size limits |
| DRY Violations | 1 major (generateUniqueSlug x5) |

---

## Unresolved Questions

1. Should blog posts support `PENDING`/`REJECTED` statuses or be constrained to `DRAFT`/`PUBLISHED` only?
2. Is the "sanitize-on-write only" strategy an explicit project decision or an oversight?
3. Should the blog GET API endpoint allow unauthenticated access for PUBLISHED posts (consistent with articles API)?
4. Should imported blog posts default to DRAFT or PUBLISHED?
