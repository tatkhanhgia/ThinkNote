# Phase 1: Data Layer & Sample Content

## Overview
- **Priority:** P1
- **Status:** Completed ✓
- **Effort:** 1.5h
- Create blog data loading utility + sample blog posts with extended frontmatter

## Key Insights
- Reuse same pattern as `src/lib/posts.ts` but for `src/data/blog/[locale]/`
- Blog posts have extra frontmatter: `mood` field (predefined set of 8)
- Reading time calculated from word count (~200 words/min)

## Requirements

### Functional
- Load blog posts from `src/data/blog/[locale]/`
- Parse extended frontmatter (mood, coverImage)
- Calculate reading time from content
- Sort by date descending
- Get single blog post with rendered HTML
- Filter by mood tag
- Get all available moods with counts

### Non-Functional
- Keep file under 200 LOC
- Reuse remark pipeline from posts.ts

## Architecture

### BlogPostData Interface
```typescript
export interface BlogPostData {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: string;              // predefined mood tag
  tags: string[];
  coverImage?: string;
  readingTime: number;       // calculated minutes
  contentHtml?: string;
}
```

### Predefined Moods
```typescript
export const BLOG_MOODS = {
  reflective: { icon: '🌸', en: 'Reflective', vi: 'Suy ngẫm' },
  joyful: { icon: '☀️', en: 'Joyful', vi: 'Vui vẻ' },
  thoughtful: { icon: '🌙', en: 'Thoughtful', vi: 'Trăn trở' },
  nostalgic: { icon: '🌿', en: 'Nostalgic', vi: 'Hoài niệm' },
  grateful: { icon: '🌻', en: 'Grateful', vi: 'Biết ơn' },
  inspired: { icon: '✨', en: 'Inspired', vi: 'Cảm hứng' },
  melancholic: { icon: '🌧️', en: 'Melancholic', vi: 'Trầm lắng' },
  excited: { icon: '🚀', en: 'Excited', vi: 'Hào hứng' },
} as const;
```

### Blog Frontmatter Schema
```yaml
---
title: "Post Title"
description: "Brief description"
date: "2026-03-18"
mood: "reflective"
tags: ["life", "career"]
coverImage: "/images/blog/cover.jpg"  # optional
---
```

## Related Code Files

### Create
- `src/lib/blog-posts.ts` — blog data loading utility
- `src/data/blog/en/welcome-to-my-blog.md` — sample EN post
- `src/data/blog/vi/welcome-to-my-blog.md` — sample VI post

### Reference (read only)
- `src/lib/posts.ts` — pattern to follow

## Implementation Steps

1. Create directories: `src/data/blog/en/`, `src/data/blog/vi/`
2. Create `src/lib/blog-posts.ts`:
   - Define `BlogPostData` interface
   - Define `BLOG_MOODS` constant with icons + translations
   - `calculateReadingTime(content: string): number` — word count / 200, min 1
   - `getSortedBlogPosts(locale: string): BlogPostData[]` — read from `src/data/blog/[locale]/`
   - `getBlogPostData(id: string, locale: string): Promise<BlogPostData>` — single post with HTML
   - `getBlogPostsByMood(mood: string, locale: string): BlogPostData[]` — filter by mood
   - `getAllBlogMoods(locale: string): { mood: string; count: number }[]` — mood aggregation
3. Create sample EN blog post with all frontmatter fields
4. Create sample VI blog post (translated version)

## Todo List
- [ ] Create `src/data/blog/en/` and `src/data/blog/vi/` directories
- [ ] Create `src/lib/blog-posts.ts` with all functions
- [ ] Create sample EN blog post
- [ ] Create sample VI blog post
- [ ] Verify compilation with `npm run build`

## Success Criteria
- `getSortedBlogPosts('en')` returns sample post with correct fields
- `getBlogPostData('welcome-to-my-blog', 'en')` returns post with contentHtml
- Reading time calculated correctly
- Mood filtering works
- No TypeScript errors

## Risk Assessment
- **Risk:** Blog data folder doesn't exist at build time → empty array (handled by try/catch, same as posts.ts)
