# Phase 4: Blog Pages & SEO

## Overview
- **Priority:** P1
- **Status:** Completed ✓
- **Effort:** 1.5h
- Create blog listing page and blog detail page with SEO metadata

## Related Code Files

### Create
- `src/app/[locale]/blog/page.tsx` — blog listing page
- `src/app/[locale]/blog/[slug]/page.tsx` — blog detail page

### Reference
- `src/app/[locale]/topics/page.tsx` — listing page pattern
- `src/app/[locale]/topics/[topic]/page.tsx` — detail page pattern

## Page Specifications

### Blog Listing Page (`/[locale]/blog`)

**Server component** with client MoodFilter child.

**Structure:**
1. Hero section: "My Blog" title + subtitle (warm gradient, not dark like KB)
2. MoodFilter chips (client component)
3. Blog post grid (responsive: 1 col mobile → 2 col tablet → 3 col desktop)
4. Empty state if no posts

**Data flow:**
```
page.tsx (server) → getSortedBlogPosts(locale)
                  → getAllBlogMoods(locale)
                  → pass to BlogListClient (client wrapper for mood filtering)
```

**SEO:**
```typescript
export async function generateMetadata({ params: { locale } }) {
  return {
    title: `Blog - ThinkNote`,
    description: 'Personal thoughts, life experiences, and reflections',
  };
}
```

### Blog Detail Page (`/[locale]/blog/[slug]`)

**Server component.**

**Structure:**
1. Breadcrumb: Home > Blog > Post Title
2. Article header: title, date, reading time, mood chip
3. Content area wrapped in `.blog-layout .blog-prose`
4. Tags at bottom

**Data flow:**
```
page.tsx (server) → getBlogPostData(slug, locale)
                  → render PostContent with blog-prose wrapper
```

**SEO:**
```typescript
export async function generateMetadata({ params: { locale, slug } }) {
  const post = await getBlogPostData(slug, locale);
  return {
    title: `${post.title} - ThinkNote Blog`,
    description: post.description,
  };
}
```

**Key detail:** Reuse `PostContent` component for Mermaid support, but wrap in `.blog-prose` for warm styling.

## Implementation Steps

1. Create `src/app/[locale]/blog/page.tsx`:
   - Server component fetching blog posts + moods
   - Hero section with warm styling
   - Client wrapper for mood filtering state
   - Grid of BlogCard components
2. Create `src/app/[locale]/blog/[slug]/page.tsx`:
   - Server component fetching single blog post
   - Breadcrumb navigation
   - Article header with metadata
   - Content area with `.blog-prose` wrapper
   - Tags section
3. Add `generateMetadata` for both pages

## Todo List
- [ ] Create blog listing page `src/app/[locale]/blog/page.tsx`
- [ ] Create blog listing client wrapper for mood filtering
- [ ] Create blog detail page `src/app/[locale]/blog/[slug]/page.tsx`
- [ ] Add SEO metadata generation
- [ ] Test with sample posts (both locales)
- [ ] Verify responsive layout

## Success Criteria
- `/en/blog` shows blog listing with mood filter
- `/en/blog/welcome-to-my-blog` shows blog detail
- `/vi/blog` shows Vietnamese posts
- Mood filter updates displayed posts
- SEO metadata renders correctly
- `.blog-layout` wrapper applied, warm styling visible
- Mobile responsive

## Risk Assessment
- **Client/server boundary**: MoodFilter needs client state; listing page is server. Solution: thin client wrapper component that receives all posts server-side, filters client-side.
