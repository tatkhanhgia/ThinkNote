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

### Article Publishing API (Community Articles)

```
GET /api/articles
├─ Route: src/app/api/articles/route.ts
├─ Query: status (DRAFT|PENDING|PUBLISHED|REJECTED), locale, authorId, limit, offset
├─ Auth: Required (checks user authentication)
├─ Returns: { articles: Article[], total: number, page: number }
└─ Features: Filters by status, locale, author; excludes BLOG_POST type; pagination support

POST /api/articles
├─ Route: src/app/api/articles/route.ts
├─ Auth: Required (user must be authenticated)
├─ Body: { title, slug, description, content, locale, categories, tags, gradientFrom?, gradientTo? }
├─ Returns: { id, createdAt, status: DRAFT }
├─ Features: Creates draft article for authenticated user (type: ARTICLE)
└─ Validation: Title + slug + locale uniqueness enforced

GET /api/articles/[id]
├─ Route: src/app/api/articles/[id]/route.ts
├─ Auth: Optional (public articles visible without auth)
├─ Returns: Article object with author info
└─ Features: Fetch single article (published articles public, drafts require ownership)

PATCH /api/articles/[id]
├─ Route: src/app/api/articles/[id]/route.ts
├─ Auth: Required (author or admin only)
├─ Body: { title?, description?, content?, categories?, tags?, ... }
├─ Returns: Updated Article object
└─ Features: Update draft/pending articles only

DELETE /api/articles/[id]
├─ Route: src/app/api/articles/[id]/route.ts
├─ Auth: Required (author or admin only)
├─ Returns: { success: boolean, id: string }
└─ Features: Delete article (author can delete own, admin can delete any)

POST /api/articles/[id]/submit
├─ Route: src/app/api/articles/[id]/submit/route.ts
├─ Auth: Required (author only)
├─ Returns: { status: PENDING, submittedAt: DateTime }
└─ Features: Move draft to pending review

POST /api/articles/[id]/review
├─ Route: src/app/api/articles/[id]/review/route.ts
├─ Auth: Required (admin only)
├─ Body: { action: 'publish'|'reject', reason?: string }
├─ Returns: { status: PUBLISHED|REJECTED, publishedAt?: DateTime, reviewNote?: string }
└─ Features: Admin approval/rejection with optional feedback

POST /api/upload
├─ Route: src/app/api/upload/route.ts
├─ Auth: Required
├─ Body: FormData with image file
├─ Returns: { url: string, filename: string, size: number }
├─ Features: Upload image for article (magic bytes validation, size limit)
└─ Validation: PNG, JPG, WebP supported; max 5MB

### Blog Management API (Admin Only)

```
GET /api/blog
├─ Route: src/app/api/blog/route.ts
├─ Query: status (DRAFT|PENDING|PUBLISHED|REJECTED), locale, mood, page, limit
├─ Auth: Required (admin only)
├─ Returns: { success: boolean, posts: Article[], pagination: { page, limit, total, pages } }
├─ Features: Lists admin blog posts with filtering by status, locale, mood; pagination
└─ Note: All blog posts have type: BLOG_POST, excluded from community articles

POST /api/blog
├─ Route: src/app/api/blog/route.ts
├─ Auth: Required (admin only)
├─ Body: { title, slug?, content, locale, mood?, status?, categories?, tags?, description?, gradientFrom?, gradientTo? }
├─ Returns: { success: boolean, post: Article }
├─ Features: Create new blog post with auto-slug generation
└─ Validation: slug + locale uniqueness enforced

GET /api/blog/[id]
├─ Route: src/app/api/blog/[id]/route.ts
├─ Auth: Required (admin only)
├─ Returns: { success: boolean, post: Article }
└─ Features: Fetch single blog post

PUT /api/blog/[id]
├─ Route: src/app/api/blog/[id]/route.ts
├─ Auth: Required (admin only)
├─ Body: { title?, slug?, content?, locale?, mood?, status?, categories?, tags?, ... }
├─ Returns: { success: boolean, post: Article }
└─ Features: Update existing blog post with auto-slug regeneration if title changed

DELETE /api/blog/[id]
├─ Route: src/app/api/blog/[id]/route.ts
├─ Auth: Required (admin only)
├─ Returns: { success: boolean, message: string }
└─ Features: Delete blog post and cascade delete all related data

POST /api/blog/import
├─ Route: src/app/api/blog/import/route.ts
├─ Auth: Required (admin only)
├─ Body: { title, slug?, content (base64 or text), locale, mood?, status?, categories?, tags?, description? }
├─ Returns: { success: boolean, post: Article }
└─ Features: Import markdown file as blog post with HTML sanitization and reading time calculation
```

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

### Database Models (PostgreSQL + Prisma)

```prisma
model User {
  id: String @id @default(cuid())
  name: String?
  email: String @unique
  emailVerified: DateTime?
  image: String?
  role: String @default("user")  // "user" or "admin"
  banned: Boolean @default(false)
  banReason: String?
  banExpires: DateTime?
  accounts: Account[]
  sessions: Session[]
  articles: Article[]
  createdAt: DateTime @default(now())
}

model Article {
  id: String @id @default(cuid())
  title: String
  slug: String
  description: String @default("")
  content: String @default("")  // HTML content (sanitized)
  locale: String @default("en")   // "en" or "vi"
  status: ArticleStatus @default(DRAFT)  // DRAFT, PENDING, PUBLISHED, REJECTED
  type: ContentType @default(ARTICLE)  // ARTICLE (community) or BLOG_POST (admin)
  categories: String[]   // Array of category names
  tags: String[]         // Array of tags
  gradientFrom: String?  // Hex color
  gradientTo: String?    // Hex color
  coverImage: String?    // Image URL
  mood: String?          // Blog mood tag (reflective, joyful, etc.)
  readingTime: Int?      // Estimated reading time in minutes (blog posts only)
  authorId: String       // User who created (community user or admin)
  author: User @relation(fields: [authorId], onDelete: Cascade)
  reviewNote: String?    // Admin feedback for rejections
  reviewedBy: String?    // Admin user ID
  reviewedAt: DateTime?  // When admin reviewed
  publishedAt: DateTime?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt

  @@unique([slug, locale])
  @@index([status])
  @@index([authorId])
  @@index([locale])
  @@index([type])
}

enum ContentType {
  ARTICLE      // Community article submitted by users
  BLOG_POST    // Personal blog post (admin-only)
}

enum ArticleStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}

model Session {
  id: String @id @default(cuid())
  userId: String
  token: String @unique
  expiresAt: DateTime
  ipAddress: String?
  userAgent: String?
  impersonatedBy: String?
}

model Account {
  id: String @id @default(cuid())
  userId: String
  accountId: String
  providerId: String
  accessToken: String?
  refreshToken: String?
  password: String?
}

model Verification {
  id: String @id @default(cuid())
  identifier: String
  value: String
  expiresAt: DateTime
}
```

### PostData Interface (File-Based KB)

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

### Merged Post Interface
```typescript
interface MergedPost extends PostData {
  source: 'kb' | 'community';      // KB article or community article
  authorId?: string;               // For community articles
  badge?: 'Community';             // Badge for community articles
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

## Community Article Publishing System

**See `/docs/community-publishing.md` for comprehensive documentation of the article publishing system, including architecture, API endpoints, components, pages, and integration details.**

### Quick Summary
- PostgreSQL Article model with `type: ARTICLE` and status workflow (DRAFT → PENDING → PUBLISHED/REJECTED)
- TipTap WYSIWYG editor with auto-save, image upload, and toolbar
- Full CRUD API endpoints with auth guards and ownership verification
- Admin review dashboard at `/admin/articles`
- User article management at `/articles/my`
- Integration with existing KB: shared search, categories, tags
- DOMPurify HTML sanitization and magic bytes image validation

## Admin Blog Management System (NEW)

**Blog posts are managed separately from community articles using the Article model with `type: BLOG_POST`.**

### Quick Summary
- PostgreSQL Article model with `type: BLOG_POST` for admin-only blog posts
- Additional fields: `mood` (reflective, joyful, etc.), `readingTime` (minutes)
- Full CRUD API endpoints at `/api/blog/*` - admin-only access
- Markdown import endpoint for bulk blog post creation
- Admin blog management at `/admin/blog` (list, create, edit, delete)
- Published blog posts displayed at `/blog` and `/blog/[slug]`
- Status workflow: DRAFT → PENDING → PUBLISHED/REJECTED
- Content type filtering: Community articles automatically exclude BLOG_POST type
- Auto-calculated reading time estimation from content length

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
- More KB content: just add markdown files
- Backend search if client-side becomes slow (>1000 articles)
- Database already handles community articles at scale

## Performance Optimization

- **Chunked processing:** ChunkedProcessor.ts splits large files into 10KB chunks, non-blocking
- **Lazy loading:** LazyLoader for expensive components, dynamic imports for code splitting
- **Caching:** SearchBar caches posts on first mount
- **Monitoring:** PerformanceMonitor.ts tracks import/sanitization/rendering time

## Markdown Import Pipeline

Import flow: Upload → Validate/Decode (base64→UTF-8) → Format (normalize structure) → Sanitize → Save to `src/data/{locale}/` → Translate (async, placeholder-safe) → Save translated copy to other locale

Formatting: MarkdownFormatter normalizes frontmatter, headings, code blocks, links, lists, whitespace

### Translation Architecture

- **TranslationService**: Wraps google-translate-api with chunking, retry, language detection
- **MarkdownTranslator**: Extracts placeholders (code, links, images, HTML) → translates text-only → restores placeholders. Handles frontmatter (title, description) separately. Chunks >14KB content.

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 14 | SSR, static gen, built-in optimization |
| PostgreSQL + Prisma | Type-safe ORM, migrations, community articles |
| better-auth | Email/password auth, session management, admin roles |
| Markdown files | Git-friendly KB, version control, ~1000 articles |
| Client-side search | Fast for <1000 articles, merges KB + DB |
| Tailwind CSS | Utility-first, minimal custom CSS |
| next-intl | Automatic i18n, EN↔VI bilingual |
| DOMPurify | XSS prevention for user-generated content |
| Chunked processing | Large file imports remain responsive |
| google-translate-api | Free translation with placeholder preservation |
