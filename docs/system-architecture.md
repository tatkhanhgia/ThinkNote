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
   ├─ Header (with HeaderNav, SearchBar & LanguageSwitcher)
   │  ├─ HeaderNav (Client Component) - desktop/mobile nav with active state
   │  ├─ SearchBar (Client Component)
   │  └─ LanguageSwitcher (Client Component)
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
├─ HeaderNav (Client) - Desktop/mobile navigation with active link detection via usePathname
├─ SearchBar (Client) - Real-time full-text search
├─ LanguageSwitcher (Client) - Locale switching with path preservation
├─ PostContent (Client) - Renders markdown HTML with Mermaid support
├─ KnowledgeCard - Displays post metadata with smooth hover transitions
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
├─ Returns: PostData[] (sorted by date descending, no contentHtml)
├─ Used by: SearchBar component (client-side filtering)
└─ Example: GET /en/api/posts → [{ id, title, description, tags, categories, ... }, ...]

POST /api/markdown/import
├─ Route: src/app/api/markdown/import/route.ts
├─ Body: { base64: string, filename: string, locale: string, autoFormat?: boolean, autoTranslate?: boolean }
├─ Returns: { success: boolean, filePath: string, translatedFilePath?: string, formatChanges?: [], translationWarnings?: [] }
├─ Features:
│  ├─ 10MB limit, base64 encoding, validation
│  ├─ Auto-format markdown (fix frontmatter, headings, code blocks, lists, whitespace)
│  ├─ Auto-translate EN↔VI using google-translate-api with placeholder preservation
│  ├─ Save both locale files (en/file.md + vi/file.md)
│  ├─ Content sanitization
│  └─ Non-blocking translation (original saved first, translation async)
├─ Used by: MarkdownImporter component + markdown-import page (both with format/translate toggles)
└─ Errors: Bilingual error messages (EN/VI), translation failure returns warning not error

DELETE /api/markdown/undo
├─ Route: src/app/api/markdown/undo/route.ts
├─ Returns: { success: boolean, previousId: string, deletedPaths: string[] }
├─ Features:
│  ├─ Revert last import (removes both original + translated files if both were created)
│  ├─ 10 actions max, 5min expiry per action
│  └─ Supports locale paths (en/, vi/)
├─ Used by: Undo system after failed imports or user cancellation
└─ Limitation: Only reverts most recent import session

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

### Content Sanitization Pipeline
```
Markdown File (user upload or git)
    ↓
1. FileValidator
   ├─ Check MIME type (text/markdown, text/plain)
   ├─ Check file size (5MB, enforced)
   └─ Validate frontmatter (title, description, date, tags, categories required)
    ↓
2. MarkdownProcessor
   ├─ Parse YAML frontmatter
   ├─ Convert markdown to HTML (remark)
   └─ Apply GFM transformations
    ↓
3. StyleConverter
   ├─ Convert inline HTML styles to Tailwind classes
   └─ Map HTML tags to semantic elements
    ↓
4. ContentSanitizer (isomorphic-dompurify)
   ├─ Allowed elements: h1-h6, p, code, ul, ol, li, table, blockquote, a, img, strong, em, pre
   ├─ Allowed attributes: href (URL validated), src, alt, title, className
   ├─ URL validation: Scheme whitelist (http, https, /relative paths)
   └─ Remove all script tags, event handlers, dangerous attributes
    ↓
5. Storage
   ├─ Store sanitized markdown in src/data/[locale]/
   └─ Update via import API or git commits
```

### Security Controls
- **XSS Prevention:** All user-uploaded markdown sanitized via isomorphic-dompurify
- **File Upload Limits:** 10MB max size, MIME type validation, base64 encoding
- **Frontmatter Validation:** Required fields enforced, format validation
- **Safe HTML:** Only whitelisted elements/attributes allowed in final output
- **URL Validation:** href and src attributes checked against scheme whitelist

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

## Performance Optimization Strategy

### Chunked Processing
- **Implementation:** ChunkedProcessor.ts breaks large files into 10KB chunks
- **Benefit:** Non-blocking processing prevents UI freezes
- **Use Case:** Large markdown imports (>5MB)
- **Pattern:** Process chunks, yield to event loop, continue

### Lazy Loading
- **Components:** LazyLoader for expensive components
- **Routes:** Dynamic imports for code splitting
- **Data:** SearchBar caches posts on first mount

### Performance Monitoring
- **PerformanceMonitor.ts:** Track import time, sanitization time, rendering time
- **Metrics:** Logged to console in development, captured by analytics in production

## Markdown Translation & Formatting Pipeline

### Translation Flow (NEW)

```
User imports markdown (EN)
    ↓
API receives: POST /api/markdown/import with autoTranslate=true
    ↓
1. Validate & Decode (base64 → UTF-8)
    ↓
2. Format (if autoFormat=true)
   ├─ TranslationService.translate() checks length
   └─ MarkdownFormatter.format() normalizes structure
    ↓
3. Sanitize & Save to src/data/{locale}/file.md
    ↓
4. Translate (if autoTranslate=true, async after original save)
   ├─ MarkdownTranslator.translateMarkdown()
   ├─ Extract placeholders (code blocks, links, images)
   ├─ Translate text via TranslationService.translate()
   ├─ Restore placeholders
   └─ Handle >14KB chunks with splitting
    ↓
5. Save translated copy to src/data/{otherLocale}/file.md
    ↓
Response: { filePath, translatedFilePath, formatChanges, translationWarnings }
```

### Markdown Formatting Pipeline

```
Input markdown (possibly malformed)
    ↓
MarkdownFormatter.format(content, options)
    ├─ formatFrontmatter()      → Auto-generate missing fields
    ├─ formatHeadings()         → Promote levels, ensure h1 first
    ├─ formatCodeBlocks()       → Balance fences, normalize language tags
    ├─ formatLinks()            → Fix spacing, detect broken patterns
    ├─ formatLists()            → Normalize markers, fix numbering
    ├─ formatWhitespace()       → Trim, collapse excess blank lines
    └─ Returns: { content, changes[], warnings[] }
    ↓
Output: Clean, project-standard markdown ready for translation
```

### Translation Architecture

```
TranslationService (thin wrapper)
├─ translate(text, from, to)      → Calls google-translate-api, handles chunking
├─ detectLanguage(text)            → Auto-detect source language
└─ Retry with backoff on rate limit

MarkdownTranslator (markdown-aware)
├─ extractPlaceholders()           → Replace non-translatable segments
├─ restorePlaceholders()           → Restore after translation
└─ translateMarkdown()             → Full pipeline with preservation
    ├─ Extract: code blocks, inline code, links, images, HTML
    ├─ Translate: body text only
    ├─ Translate: frontmatter (title, description only)
    └─ Restore: all non-translatable segments
```

## Technology Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Next.js 14** | SSR, static generation, built-in optimization |
| **Server Components** | Reduced client JS, direct file system access |
| **Markdown Files** | Git-friendly, version control, scalable to ~1000 articles |
| **Client-Side Search** | Fast for <1000 articles, no backend infrastructure |
| **Tailwind CSS** | Utility-first, minimal custom CSS, fast styling |
| **next-intl** | Automatic i18n with minimal configuration |
| **Markdown Import API** | Enable non-technical content creation, UI-based editing |
| **ContentSanitizer** | Safe user-generated markdown support without XSS risk |
| **Chunked Processing** | Large file imports remain responsive |
| **UndoManager** | User error recovery, safe import workflow |
| **@vitalets/google-translate-api** | Free, unofficial Google Translate — fallback returns original + warning |
| **Markdown Formatter** | Auto-normalize structure before translation for better quality |
| **Placeholder System** | Preserve code/links/images during translation via token replacement |
| **Bi-directional i18n** | EN↔VI translation enables bilingual content with single import |
