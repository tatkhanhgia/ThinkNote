# Phase 6: Integration & Polish

## Context Links
- [Posts Library](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/posts.ts)
- [TopicsClient](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/topics/TopicsClient.tsx)
- [Topic Detail Page](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/topics/[topic]/page.tsx)
- [KnowledgeCard](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/KnowledgeCard.tsx)
- [Search Results](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/search/SearchResults.tsx)
- [Posts API](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/api/posts/route.ts)
- [HeaderNav](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/HeaderNav.tsx)
- [Auth Button](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/auth-button.tsx)
- [Plan Overview](./plan.md)

## Overview
- **Priority**: P2
- **Status**: completed
- **Effort**: 2.5h
- **Depends on**: Phase 4, Phase 5
- Merge community articles into existing knowledge base display. Add author info, badges, "Write" button

## Key Insights
- `getSortedPostsData()` reads from filesystem. Need to also fetch PUBLISHED articles from DB
- PostData interface needs `source` and `author` fields
- KnowledgeCard needs optional "Community" badge
- Topic detail page needs author info section for DB articles
- Search (client-side via `/api/posts`) must include DB articles
- Categories/tags aggregation must include DB article categories/tags
- "Write Article" button in header for authenticated users (not admin-only)

## Requirements

### Functional
- Merge PUBLISHED DB articles with file-based articles in all listing functions
- Add `source: 'system' | 'community'` to PostData interface
- Add optional `author?: { name: string; image?: string }` to PostData
- Display "Community" badge on KnowledgeCard for `source === 'community'`
- Show author name + avatar on article detail page (community articles)
- `/api/posts` returns merged results (file + DB published)
- Categories/tags pages aggregate both sources
- Search includes DB articles
- "Write Article" button in auth button dropdown (for logged-in users)
- "Write Article" nav link or CTA on topics page

### Non-Functional
- DB queries cached per-request (Prisma query dedup handles this in server components)
- File-based posts remain the primary source, DB articles appended
- No breaking changes to existing pages

## Architecture

```
Data Merge Strategy:
  getSortedPostsData(locale) -> file-based posts (source: 'system')
  getPublishedArticles(locale) -> DB published articles (source: 'community')
  getMergedPosts(locale) -> [...filePosts, ...dbPosts].sort(by date)

PostData Extended:
  + source: 'system' | 'community'
  + author?: { name: string; image?: string }
  + articleId?: string (DB article ID, for edit links)

Topic Detail for DB articles:
  /[locale]/topics/article-[id] or /[locale]/articles/[slug]
  -> fetch from DB instead of filesystem

KnowledgeCard:
  + optional "Community" badge overlay
```

## Related Code Files

### Files to Modify
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/posts.ts` - Add DB article fetching + merge functions
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/KnowledgeCard.tsx` - Add Community badge + author
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/topics/page.tsx` - Use merged posts
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/topics/TopicsClient.tsx` - Support source field
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/topics/[topic]/page.tsx` - Handle DB articles
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/api/posts/route.ts` - Include DB articles
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/categories/[category]/page.tsx` - Merge sources
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/tags/[tag]/page.tsx` - Merge sources
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/search/SearchResults.tsx` - Merge in search
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/HeaderNav.tsx` - Potential "Write" link
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/auth-button.tsx` - Add "Write Article" link
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/en.json` - i18n strings
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/vi.json` - i18n strings

### Files to Create
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/articles/[slug]/page.tsx` - Community article detail page

## Implementation Steps

### Step 1: Extend PostData interface in posts.ts
```typescript
export interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  gradientFrom?: string;
  gradientTo?: string;
  contentHtml?: string;
  source?: 'system' | 'community';
  author?: { name: string; image?: string };
  articleId?: string; // DB article ID for community articles
  [key: string]: any;
}
```

### Step 2: Add DB article fetching functions to posts.ts
```typescript
import { prisma } from './prisma';

export async function getPublishedArticles(locale: string): Promise<PostData[]> {
  const articles = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED' },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { publishedAt: 'desc' },
  });
  return articles.map(a => ({
    id: a.slug,
    title: a.title,
    description: a.description,
    date: (a.publishedAt ?? a.createdAt).toISOString().split('T')[0],
    tags: a.tags,
    categories: a.categories,
    gradientFrom: a.gradientFrom ?? undefined,
    gradientTo: a.gradientTo ?? undefined,
    source: 'community' as const,
    author: { name: a.author.name, image: a.author.image ?? undefined },
    articleId: a.id,
  }));
}

export async function getMergedPosts(locale: string): Promise<PostData[]> {
  const filePosts = getSortedPostsData(locale).map(p => ({ ...p, source: 'system' as const }));
  const dbPosts = await getPublishedArticles(locale);
  return [...filePosts, ...dbPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

### Step 3: Create community article detail page
`/articles/[slug]/page.tsx`:
- Server component: fetch article from DB by slug + locale
- If not found or not PUBLISHED: return 404
- Render like topic detail but with author info section (name + avatar + date)
- "Community" badge in header

### Step 4: Update KnowledgeCard
- Add optional `source` prop
- Add optional `author` prop
- If `source === 'community'`, render small badge: "Community" with people icon
- If `author`, show small avatar + name below description

```tsx
{source === 'community' && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
    <svg .../>Community
  </span>
)}
```

### Step 5: Update /api/posts route
Change `getSortedPostsData()` to async `getMergedPosts()`:
```typescript
export async function GET(request, { params }) {
  const posts = await getMergedPosts(params.locale);
  return NextResponse.json(posts);
}
```

### Step 6: Update topics page + categories + tags pages
Replace `getSortedPostsData()` calls with `getMergedPosts()` where listing all articles. Update `getAllCategories()` and `getAllTags()` to also count DB article categories/tags.

### Step 7: Update topic detail page
Handle case where `id` matches a DB article slug:
- Try filesystem first (existing behavior)
- If file not found, try DB lookup by slug
- Render appropriate content

### Step 8: Add "Write Article" to auth button dropdown
In auth-button.tsx, add between Profile and Admin links:
```tsx
<Link href={`/${locale}/articles/create`} ...>
  {t('writeArticle')}
</Link>
```

### Step 9: Add i18n strings
```json
{
  "Auth": {
    "button": {
      "writeArticle": "Write Article",
      "myArticles": "My Articles"
    }
  },
  "Common": {
    "community": "Community",
    "writtenBy": "Written by"
  }
}
```

## Todo List
- [x] Extend PostData interface with source/author/articleId
- [x] Add getPublishedArticles() and getMergedPosts() to posts.ts
- [x] Create /articles/[slug]/page.tsx for community article detail
- [x] Update KnowledgeCard with Community badge + author display
- [x] Update /api/posts to return merged results
- [x] Update topics page to use merged posts
- [x] Update categories page to aggregate both sources
- [x] Update tags page to aggregate both sources
- [x] Update topic detail to handle DB articles
- [x] Update search results to include DB articles
- [x] Add "Write Article" + "My Articles" to auth button dropdown
- [x] Add i18n translations
- [x] Test merged display renders correctly
- [x] Test search includes community articles

## Success Criteria
- Home page / topics page shows both file-based and community articles mixed by date
- Community articles display "Community" badge
- Community article detail page shows author name + avatar
- Categories/tags counts include community articles
- Search finds community articles
- "Write Article" link visible in user dropdown when logged in
- No regression in existing file-based article display
- Performance: merged page load <500ms additional vs file-only

## Risk Assessment
- **Medium**: `getMergedPosts()` is async (DB call) but `getSortedPostsData()` is sync — pages using sync version need to become async or use separate path
  - Mitigation: keep sync file-based function for SSG; use async merge only in dynamic/API contexts
- **Low**: Slug collision between file IDs and DB article slugs
  - Mitigation: on topic detail, try file first then DB. Community articles have their own route `/articles/[slug]`
- **Low**: DB articles without proper categories may not match translation maps
  - Mitigation: categories stored as-is from user input, no translation mapping for community articles

## Security Considerations
- Only PUBLISHED articles returned in merged queries
- No auth bypass — community article detail checks publication status
- Author info is public (name + avatar only, no email)
- Content already sanitized in Phase 2 before DB storage

## Next Steps
- Feature complete. Consider future enhancements:
  - Full-text search via PostgreSQL `tsvector`
  - Article commenting system
  - View counts / likes
  - RSS feed for community articles
  - Image CDN / optimization with sharp
