# System Architecture

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components (Client-side Interactive UI)       │  │
│  │  ├─ SearchBar (real-time search dropdown)            │  │
│  │  ├─ LanguageSwitcher (locale switching)              │  │
│  │  ├─ PostContent (markdown HTML rendering)            │  │
│  │  └─ KnowledgeCard (article listing cards)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server (SSR)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware (src/middleware.ts)                       │  │
│  │  ├─ Locale detection from URL                         │  │
│  │  ├─ Redirect to [locale] if missing                  │  │
│  │  └─ Load locale configuration                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router Pages (Server Components)                 │  │
│  │  ├─ src/app/[locale]/page.tsx (home)                 │  │
│  │  ├─ src/app/[locale]/topics/page.tsx (all articles)  │  │
│  │  ├─ src/app/[locale]/topics/[topic]/page.tsx (detail)│  │
│  │  ├─ src/app/[locale]/categories/page.tsx             │  │
│  │  ├─ src/app/[locale]/tags/page.tsx                   │  │
│  │  └─ src/app/[locale]/search/page.tsx (search results)│  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic (src/lib/posts.ts)                    │  │
│  │  ├─ getSortedPostsData(locale)                        │  │
│  │  ├─ getPostData(id, locale)                           │  │
│  │  ├─ getAllTags(locale) / getPostsByTag()              │  │
│  │  ├─ getAllCategories(locale) / getPostsByCategory()   │  │
│  │  ├─ Bilingual category translation mapping            │  │
│  │  └─ slugify() - URL-safe slug generation              │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Content Processing (remark + plugins)               │  │
│  │  ├─ Parse YAML frontmatter (gray-matter)              │  │
│  │  ├─ Markdown → HTML (remark-html)                     │  │
│  │  ├─ GFM support (code blocks, tables, etc.)           │  │
│  │  └─ Mermaid diagram support                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   File System (Content)                      │
│  ├─ src/data/en/*.md (English articles + metadata)          │
│  └─ src/data/vi/*.md (Vietnamese articles + metadata)       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Request Processing Flow

```
User Request (Browser)
    ↓
Middleware
├─ Check URL locale parameter [locale]
├─ If missing, redirect to /{defaultLocale}/path
├─ Load locale-specific i18n messages
└─ Pass locale to page component
    ↓
Page Component (Server Component)
├─ Receive locale from params
├─ Fetch data via getSortedPostsData(locale)
├─ Apply filters (category, tag, search)
└─ Render HTML with Server Component
    ↓
Client Hydration
├─ React hydrates interactive components
├─ SearchBar component loads data via API
├─ LanguageSwitcher initializes event handlers
└─ PostContent renders markdown HTML
    ↓
Browser Output
└─ Fully rendered HTML page with CSS + JS
```

### Content Loading Pipeline

```
Markdown File (src/data/[locale]/article.md)
│
├─ YAML Frontmatter
│  ├─ title
│  ├─ description
│  ├─ date
│  ├─ tags[]
│  ├─ categories[]
│  ├─ gradientFrom (optional)
│  └─ gradientTo (optional)
│
├─ Parse (gray-matter)
│  ├─ Extract frontmatter → PostData metadata
│  └─ Extract body → markdown content
│
├─ Process (remark)
│  ├─ Parse markdown AST
│  ├─ Apply remark-gfm transformations
│  ├─ Render to HTML (sanitize: false)
│  └─ Generate contentHtml
│
└─ Return PostData
   ├─ id: filename without .md
   ├─ ...metadata from frontmatter
   └─ contentHtml: rendered HTML (when requested)
```

### Search Flow (Client-Side)

```
SearchBar Component Mounts
    ↓
Fetch GET /[locale]/api/posts
    ├─ Backend: getSortedPostsData(locale)
    └─ Returns: PostData[] as JSON
    ↓
Cache all posts in React state
    ↓
User Types in Search Input
    ↓
Filter in Real-Time
├─ Search by title (contains query)
├─ Search by description (contains query)
├─ Search by tags (array includes query)
├─ Search by categories (array includes query)
└─ Limit to 6 results
    ↓
Display Dropdown Results
└─ Show "View all results" link to /search?q={query}
```

## Component Architecture

### Component Hierarchy

```
RootLayout (src/app/layout.tsx)
└─ LocaleLayout (src/app/[locale]/layout.tsx)
   │
   ├─ Header (with LanguageSwitcher & SearchBar)
   │  ├─ LanguageSwitcher (Client Component)
   │  └─ SearchBar (Client Component)
   │
   ├─ Main Page (Server Component)
   │  ├─ HomePage
   │  │  ├─ HeroSection
   │  │  ├─ StatsSection
   │  │  ├─ FeaturedCategoriesSection
   │  │  └─ CTASection
   │  │
   │  ├─ TopicsPage
   │  │  └─ KnowledgeCard (repeated)
   │  │
   │  ├─ CategoryPage
   │  │  └─ KnowledgeCard (filtered by category)
   │  │
   │  ├─ TagPage
   │  │  └─ KnowledgeCard (filtered by tag)
   │  │
   │  ├─ TopicDetailPage
   │  │  └─ PostContent (Client Component)
   │  │
   │  └─ SearchPage
   │     └─ SearchResults (Client Component)
   │
   └─ Footer

Key Components:
├─ SearchBar (Client) - Real-time full-text search
├─ LanguageSwitcher (Client) - Locale switching with path preservation
├─ PostContent (Client) - Renders markdown HTML with Mermaid support
├─ KnowledgeCard - Displays post metadata (reusable)
└─ CustomButton - Reusable button component
```

## Internationalization (i18n) Architecture

```
Request with Locale
    ↓
Middleware (src/middleware.ts)
├─ Detect locale from URL [locale]
├─ Validate against supported locales: ['en', 'vi']
└─ Fallback to defaultLocale: 'en'
    ↓
i18n Config (src/i18n.ts)
├─ getRequestConfig() loads locale async
├─ Dynamically import messages from src/messages/{locale}.json
└─ Return to page via context
    ↓
Page Components
├─ useTranslations() hook gets locale messages
├─ useLocale() hook gets current locale string
└─ Reference UI strings via translation keys
    ↓
Content Translation (Bilingual Articles)
├─ English articles: src/data/en/*.md
├─ Vietnamese articles: src/data/vi/*.md (separate files)
├─ categoryTranslationMap in posts.ts for category names
└─ Articles loaded based on locale parameter
    ↓
Rendered Output
└─ Locale-aware HTML with translated UI + content
```

### Bilingual Category Mapping

```
categoryTranslationMap (in posts.ts):
{
  "Programming Languages": { "vi": "Ngôn ngữ lập trình" },
  "Development Core": { "vi": "Lõi phát triển" },
  "AI": { "vi": "Trí tuệ nhân tạo" },
  ...
}

Function: getTranslatedCategory(englishCategory, locale)
├─ If locale === 'en' → return englishCategory
└─ Else → return categoryTranslationMap[englishCategory][locale]
```

## API Endpoints

### Public REST Endpoints

```
GET /{locale}/api/posts
├─ Route: src/app/[locale]/api/posts/route.ts
├─ Params: locale (en | vi)
├─ Returns: PostData[] (all posts without contentHtml)
├─ Used by: SearchBar component (client-side filtering)
└─ Example: GET /en/api/posts → [{ id, title, description, tags, categories, ... }, ...]

GET /{locale}/topics (Page)
├─ Route: src/app/[locale]/topics/page.tsx
├─ Displays: All articles paginated
└─ Data: getSortedPostsData(locale)

GET /{locale}/topics/{topic} (Page)
├─ Route: src/app/[locale]/topics/[topic]/page.tsx
├─ Displays: Individual article detail
└─ Data: getPostData(topic, locale) - includes contentHtml

GET /{locale}/categories (Page)
├─ Route: src/app/[locale]/categories/page.tsx
├─ Displays: All categories with article counts
└─ Data: getAllCategoriesWithSlug(locale)

GET /{locale}/categories/{slug} (Page)
├─ Route: src/app/[locale]/categories/[category]/page.tsx
├─ Displays: Posts in specific category
└─ Data: getPostsByCategorySlug(slug, locale)

GET /{locale}/tags (Page)
├─ Route: src/app/[locale]/tags/page.tsx
├─ Displays: All tags with occurrence counts
└─ Data: getAllTags(locale)

GET /{locale}/tags/{tag} (Page)
├─ Route: src/app/[locale]/tags/[tag]/page.tsx
├─ Displays: Posts with specific tag
└─ Data: getPostsByTag(tag, locale)

GET /{locale}/search?q={query} (Page)
├─ Route: src/app/[locale]/search/page.tsx
├─ Displays: Search results for query
└─ Implementation: Client-side search with SearchResults component
```

## Data Structure

### PostData Interface

```typescript
interface PostData {
  id: string;                      // Filename without .md
  title: string;                   // Article title
  description: string;             // Brief summary
  date: string;                    // ISO 8601 date (YYYY-MM-DD)
  tags: string[];                  // Tag array
  categories: string[];            // Category array
  gradientFrom?: string;           // Optional hex color (#xxxxxx)
  gradientTo?: string;             // Optional hex color (#xxxxxx)
  contentHtml?: string;            // Rendered HTML (when loaded via getPostData)
  [key: string]: any;              // Additional frontmatter fields
}
```

### Example PostData Instance

```json
{
  "id": "react-basics",
  "title": "React Basics Guide",
  "description": "Learn the fundamentals of React library",
  "date": "2024-03-15",
  "tags": ["React", "JavaScript", "Frontend", "Tutorial"],
  "categories": ["Frontend", "Programming Languages"],
  "gradientFrom": "#3b82f6",
  "gradientTo": "#8b5cf6",
  "contentHtml": "<h1>React Basics</h1><p>React is a...</p>"
}
```

## Caching Strategy

### Build-Time Caching (ISR - Incremental Static Regeneration)

```
Static Pages Generated at Build:
├─ Home page: /[locale]/
├─ All topics: /[locale]/topics
├─ All categories: /[locale]/categories
├─ All tags: /[locale]/tags
│
├─ Regenerated on:
│  ├─ Scheduled revalidation (if configured)
│  └─ Manual rebuild (after content changes)
│
└─ Benefits:
   ├─ Fast serving from CDN
   ├─ Automatic JSON caching
   └─ Zero database load
```

### Client-Side Caching

```
SearchBar API Call:
├─ Caches all posts in React state
├─ Fetched once per component mount
├─ Locale-specific (re-fetches on locale change)
└─ No additional API calls for filtering (client-side search)
```

## Performance Characteristics

### Page Load Timeline

```
User visits /en/topics/react-basics
    ↓
1. DNS Lookup: <100ms
    ↓
2. TCP Connection: <100ms
    ↓
3. Server Rendering: 100-300ms
   ├─ Load markdown file from disk
   ├─ Parse YAML frontmatter
   ├─ Render markdown to HTML
   └─ Generate React components
    ↓
4. Send HTML: <100ms
    ↓
5. Browser Parsing & Rendering: 200-400ms
   ├─ Parse HTML
   ├─ Load CSS (Tailwind)
   ├─ Load minimal JS
   └─ Render page
    ↓
6. React Hydration: 50-100ms
   ├─ Hydrate SearchBar component
   ├─ Hydrate LanguageSwitcher
   └─ Attach event listeners
    ↓
Total Time to Interactive: ~700-1100ms (< 2 seconds)
```

### Bundle Size Breakdown

```
Main Bundle:
├─ React + Next.js: ~40KB (gzipped)
├─ Tailwind CSS: ~30KB (gzipped)
├─ Application Code: ~20KB (gzipped)
├─ Dependencies: ~20KB (gzipped)
└─ Total: ~110KB (gzipped)

Per-Route Code Splitting:
├─ Automatic route-based splitting
├─ Common modules shared across routes
└─ Dynamic imports for optional features
```

## Deployment Architecture

### Recommended Deployment: Vercel

```
GitHub Repository
    ↓ (git push)
Vercel CI/CD Pipeline
    ├─ Trigger on: push to main
    ├─ Run: npm run lint
    ├─ Build: npm run build
    ├─ Test: npm run test (if configured)
    └─ Deploy: To Vercel Edge Network
    ↓
Production Environment
├─ Vercel Serverless Functions (API routes)
├─ Edge Network CDN (static assets)
├─ Auto HTTPS & HTTP/2
├─ Preview URLs for PRs
└─ Automatic rollbacks on failure
```

### Alternative Deployment Options

```
Option 1: Docker Container
├─ Build Docker image with Dockerfile
├─ Push to Docker Hub / private registry
├─ Run on: AWS ECS, Google Cloud Run, etc.
├─ Reverse proxy: Nginx / Caddy
└─ Database: Not required (file-based)

Option 2: Self-Hosted Node.js
├─ npm run build → creates .next directory
├─ npm run start → runs production server
├─ Process manager: PM2 or systemd
├─ Reverse proxy: Nginx
└─ Port: 3000 (default, configurable)

Option 3: Static Export (SPA)
├─ Configure next.config.mjs: output: 'export'
├─ npm run build → creates out/ directory
├─ Deploy to: S3, GitHub Pages, Netlify
├─ Limitation: No SSR, requires client-side routing
└─ Benefit: Zero server cost
```

## Error Handling Architecture

### File System Errors

```
getSortedPostsData(locale)
├─ Try to read locale directory
├─ Catch fs error:
│  ├─ Log error with context
│  └─ Return empty array []
└─ Result: Page loads with 0 articles instead of 500 error
```

### API Errors

```
GET /[locale]/api/posts
├─ Try to fetch posts
├─ Catch error:
│  ├─ Log error
│  ├─ Return 500 status
│  └─ Return JSON error message
└─ Client: Shows error message in UI
```

### 404 Handling

```
Route not found:
├─ Next.js default: notFound()
├─ Renders: src/app/not-found.tsx
└─ Custom 404 page with navigation links
```

## Monitoring & Debugging

### Development Debugging

```
npm run dev
├─ Enables source maps
├─ Hot module replacement (HMR)
├─ Error overlays in browser
└─ Console logging visible in terminal
```

### Production Logging

```
Console logs in API routes:
├─ Captured by Vercel/hosting platform
├─ Accessible via dashboard
├─ Viewable in real-time
└─ Helpful for diagnosing production issues
```

## Security Architecture

### Content Security
- **Trusted Content Only:** All markdown from git repository
- **HTML Injection:** remark-html `sanitize: false` (intentional for trusted content)
- **No User Input:** No user-generated content accepted

### Environment Variables
- **Sensitive Data:** None currently required in this public app
- **Pattern:** Use .env.local for local secrets (not committed)
- **Production:** Use platform's secret management (Vercel Environment Variables)

### API Security
- **Public API:** GET /[locale]/api/posts is public (no auth required)
- **HTTPS:** All production deployments use HTTPS
- **CORS:** Not restricted (content is public)

## Scalability Considerations

### Current Limits
- **Articles:** Tested with 50+, supports 1000+ efficiently
- **Categories:** 14+, can support 100+
- **Tags:** 86+, can support 1000+
- **Build Time:** ~30-60 seconds for 50 articles

### Scaling Strategies
1. **More Content:** Add more markdown files (no architectural changes needed)
2. **Larger Search Index:** Backend search (Phase 2) if client-side becomes slow
3. **User Accounts:** Add authentication (Phase 2) for private knowledge bases
4. **Dynamic Content:** Replace file-based system with database (future phase)

## Technology Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Next.js 14** | SSR, static generation, built-in optimization |
| **Server Components** | Reduced client JS, direct file system access |
| **Markdown Files** | Git-friendly, version control, no database |
| **Client-Side Search** | Fast for <1000 articles, no backend needed |
| **Tailwind CSS** | Utility-first, minimal custom CSS, fast styling |
| **next-intl** | Automatic i18n with minimal configuration |
| **File System** | Zero infrastructure, local development simple |
