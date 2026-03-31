# Phase 4: Blog Frontend Update

## Context Links
- [blog-posts.ts](../../src/lib/blog-posts.ts) — Current file-based loader
- [Blog List Page](../../src/app/[locale]/blog/page.tsx)
- [Blog Detail Page](../../src/app/[locale]/blog/[slug]/page.tsx)
- [BlogListClient](../../src/app/[locale]/blog/BlogListClient.tsx)

## Overview
- **Priority:** P2
- **Status:** Complete
- **Effort:** 1h

Update blog frontend to read from database instead of file system. Keep existing UI components (BlogCard, MoodFilter, BlogListClient) unchanged — only change data source.

## Key Insights
- Current blog-posts.ts reads from `src/data/blog/{locale}/*.md`
- BlogPostData interface: `{ id, title, description, date, mood, tags, coverImage, readingTime, contentHtml }`
- Frontend uses: `getSortedBlogPosts(locale)`, `getBlogPostData(id, locale)`, `getBlogPostsByMood()`, `getAllBlogMoods()`
- New: query `Article WHERE type='BLOG_POST' AND status='PUBLISHED'`
- Interface stays same — only data source changes

## Requirements

### Functional
- Blog list shows published blog posts from DB
- Blog detail page loads post by slug from DB
- Mood filtering still works
- Reading time displayed correctly

### Non-functional
- Same or better performance (DB query vs file read)
- No UI changes needed (data interface unchanged)

## Related Code Files

### Modify
- `src/lib/blog-posts.ts` — Replace file reads with Prisma queries
- `src/app/[locale]/blog/[slug]/page.tsx` — Use slug-based lookup instead of file ID

### No Changes Needed
- `src/app/[locale]/blog/page.tsx` — Calls getSortedBlogPosts (same function name)
- `src/app/[locale]/blog/BlogListClient.tsx` — Receives BlogPostData (same interface)
- `src/lib/blog-moods.ts` — Static mood definitions unchanged

## Implementation Steps

### 1. Rewrite `src/lib/blog-posts.ts`

Replace file-system functions with Prisma queries. Keep exact same exports + interfaces:

```typescript
import { prisma } from '@/lib/prisma';

export async function getSortedBlogPosts(locale: string): Promise<BlogPostData[]> {
  const posts = await prisma.article.findMany({
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true, image: true } } }
  });
  return posts.map(toBlogPostData);
}

export async function getBlogPostData(slug: string, locale: string): Promise<BlogPostData | null> {
  const post = await prisma.article.findFirst({
    where: { slug, type: 'BLOG_POST', status: 'PUBLISHED', locale },
    include: { author: { select: { name: true, image: true } } }
  });
  return post ? toBlogPostData(post) : null;
}

export async function getBlogPostsByMood(mood: string, locale: string): Promise<BlogPostData[]> {
  const posts = await prisma.article.findMany({
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale, mood },
    orderBy: { publishedAt: 'desc' }
  });
  return posts.map(toBlogPostData);
}

export async function getAllBlogMoods(locale: string) {
  const posts = await getSortedBlogPosts(locale);
  // Group by mood, count
}
```

### 2. Update Blog Detail Page

`src/app/[locale]/blog/[slug]/page.tsx`:
- Change from file ID lookup to slug-based: `getBlogPostData(slug, locale)`
- Route param is already `[slug]` — should work as-is
- Handle null return (404)

### 3. Keep BlogPostData Interface

```typescript
export interface BlogPostData {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: string;
  tags: string[];
  coverImage?: string;
  readingTime: number;
  contentHtml?: string;
}
```

Map from Article model: `id → article.id`, `date → publishedAt || createdAt`

### 4. Remove file-based blog data (after verification)

- Delete `src/data/blog/en/welcome-to-my-blog.md`
- Delete `src/data/blog/vi/welcome-to-my-blog.md`
- (Only after Phase 1 migration script has imported them to DB)

## Todo List
- [x] Rewrite blog-posts.ts with Prisma queries
- [x] Update blog detail page for slug-based lookup
- [x] Verify blog list page works with new data source
- [x] Verify mood filtering works
- [x] Remove old file-based blog posts (after DB migration verified)

## Success Criteria
- `/blog` shows published blog posts from DB
- `/blog/[slug]` loads correct post
- Mood filter works correctly
- Reading time displays
- No UI regressions

## Risk Assessment
- **Low:** Interface mismatch between file data and DB data
  - **Mitigation:** toBlogPostData mapper handles conversion
- **Low:** Old file-based posts still loading (cache)
  - **Mitigation:** Delete files only after DB verification

## Security Considerations
- Only PUBLISHED posts visible on frontend
- No auth needed for public blog pages (same as before)

## Next Steps
- Phase 5: i18n keys and final testing
