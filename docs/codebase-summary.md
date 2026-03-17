# ThinkNote - Codebase Summary

## Technology Stack Overview

### Core Framework & Language
- **Framework:** Next.js 14 with App Router (Server Components by default)
- **Language:** TypeScript 5 with strict mode enabled
- **Runtime:** Node.js (server-side), ES2020+ (client-side)
- **Package Manager:** npm

### Frontend & Styling
- **UI Library:** React 18 with TypeScript support
- **Styling:** Tailwind CSS 3.4 with PostCSS and autoprefixer
- **Design Pattern:** Glass-morphism with gradient backgrounds
- **Responsive:** Mobile-first approach (breakpoints: md, lg, xl)

### Content & Markdown Processing
- **Markdown Parser:** remark v15 with plugins
  - **remark-gfm:** GitHub Flavored Markdown support
  - **remark-html:** Convert markdown to HTML (sanitize: false for trusted content)
- **Frontmatter:** gray-matter v4 for YAML metadata extraction
- **Diagrams:** Mermaid v11.9.0 for diagram rendering

### Internationalization
- **Library:** next-intl v4.3.4
- **Locales:** English (en), Vietnamese (vi)
- **Default:** English
- **Translation Files:** JSON-based messages in `src/messages/{locale}.json`

### Development & Quality
- **Linting:** ESLint 8 with next/eslint config
- **Type Checking:** TypeScript compiler
- **Build Tools:** Next.js built-in build system
- **Dev Server:** next dev on http://localhost:3000

## Directory Structure & Purpose

```
src/
├── app/                           # Next.js App Router - Server Components
│   ├── [locale]/                  # Locale parameter for all routes
│   │   ├── page.tsx               # Home page (shows hero, categories, stats)
│   │   ├── layout.tsx             # Locale layout (header, footer, nav)
│   │   ├── api/
│   │   │   ├── posts/route.ts     # GET /[locale]/api/posts - returns sorted posts JSON
│   │   │   ├── markdown/import/route.ts  # POST /api/markdown/import - file upload (10MB limit)
│   │   │   └── markdown/undo/route.ts    # DELETE /api/markdown/undo - revert last import
│   │   ├── topics/
│   │   │   ├── page.tsx           # All articles page with pagination
│   │   │   └── [topic]/
│   │   │       └── page.tsx       # Individual article detail page
│   │   ├── categories/
│   │   │   ├── page.tsx           # All categories listing
│   │   │   └── [category]/
│   │   │       └── page.tsx       # Category detail - shows posts in category
│   │   ├── tags/
│   │   │   ├── page.tsx           # All tags listing with counts
│   │   │   └── [tag]/
│   │   │       └── page.tsx       # Tag detail - shows posts with tag
│   │   ├── blog/
│   │   │   ├── page.tsx           # Blog listing page with mood filtering
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Individual blog post detail page
│   │   └── search/
│   │       ├── page.tsx           # Search results page
│   │       └── SearchResults.tsx  # Client component for search UI
│   ├── layout.tsx                 # Root layout (HTML, NextIntl provider)
│   ├── page.tsx                   # Root redirect to [locale]/page
│   └── not-found.tsx              # Custom 404 page
│
├── lib/
│   ├── posts.ts                   # Core post CRUD & filtering (292 LOC)
│   ├── blog-moods.ts              # NEW - Blog mood definitions & utilities
│   ├── blog-posts.ts              # NEW - Blog post data loading & filtering
│   ├── markdown/
│   │   ├── MarkdownProcessor.ts   # Parse, validate, convert markdown
│   │   └── MarkdownErrorHandler.ts # Bilingual error codes (EN/VI)
│   ├── translation/               # NEW - Markdown translation module
│   │   ├── TranslationService.ts  # Google Translate API wrapper with retry logic
│   │   ├── MarkdownTranslator.ts  # Markdown-aware translation with placeholder system
│   │   ├── __tests__/             # Unit tests for translation (8+ test suites)
│   │   └── index.ts               # Barrel export
│   ├── formatting/                # NEW - Markdown auto-formatting module
│   │   ├── MarkdownFormatter.ts   # Heading/link/list/whitespace normalization
│   │   ├── __tests__/             # Unit tests for formatting (12+ test suites)
│   │   └── index.ts               # Barrel export
│   ├── security/
│   │   └── ContentSanitizer.ts    # XSS prevention, allowed elements/attributes
│   ├── performance/
│   │   ├── ChunkedProcessor.ts    # Non-blocking 10KB chunks for large files
│   │   ├── LazyLoader.ts          # Lazy load components
│   │   └── PerformanceMonitor.ts  # Track performance metrics
│   ├── validation/
│   │   └── FileValidator.ts       # Type, size (5MB), MIME, frontmatter validation
│   ├── undo/
│   │   └── UndoManager.ts         # 10 actions max, 5min expiry
│   ├── error-handling/
│   │   └── ErrorHandler.ts        # Categorize, backoff retry (exponential)
│   └── accessibility/
│       └── AccessibilityHelpers.ts # ARIA, focus, keyboard navigation
│       ├── getSortedPostsData()   # Get all posts sorted by date (desc)
│       ├── getPostData()          # Get single post with rendered HTML
│       ├── getAllPostIds()        # For static generation
│       ├── getAllTags()           # Get tag map with counts
│       ├── getPostsByTag()        # Filter posts by tag
│       ├── getAllCategories()     # Get category map with counts
│       ├── getPostsByCategory()   # Filter posts by category
│       ├── getAllCategoriesWithSlug()  # With slug generation
│       ├── getPostsByCategorySlug()    # Filter by slug
│       ├── getCategoryNameBySlug()     # Resolve slug to name
│       ├── slugify()              # Normalize to URL-safe slug
│       └── categoryTranslationMap # Bilingual category translations
│
├── components/ui/                 # Reusable React components (16 components)
│   ├── SearchBar.tsx              # Client component - full-text search (216 LOC)
│   ├── MarkdownImporter.tsx       # Multi-step markdown import wizard
│   ├── MarkdownPreview.tsx        # Preview imported markdown
│   ├── FileUploadZone.tsx         # Drag-drop file upload zone
│   ├── NotificationSystem.tsx      # Toast notifications (success, error, warning, info)
│   ├── ImportMarkdownButton.tsx    # Button to trigger import
│   ├── ErrorDisplay.tsx           # Bilingual error message display
│   ├── PostContent.tsx            # Client component - renders markdown HTML with Mermaid
│   ├── LanguageSwitcher.tsx       # Client component - locale switcher
│   ├── KnowledgeCard.tsx          # Card component for article listing
│   ├── CustomButton.tsx           # Reusable button component
│   ├── LogoIcon.tsx               # Logo SVG component
│   ├── AccessibilityHelpers.tsx   # ARIA & keyboard navigation helpers
│   ├── BlogCard.tsx               # Blog post card for listing (warm styling)
│   ├── MoodFilter.tsx             # Mood tag filter chips for blog
│   └── ReadingTime.tsx            # Reading time display for blog posts
│
├── components/markdown/
│   └── StyleConverter.tsx         # HTML to Tailwind class mapping
│
├── data/                          # Content files (Markdown + YAML)
│   ├── en/                        # English articles (12+ files)
│   │   ├── react-basics.md
│   │   ├── typescript-setup.md
│   │   ├── java-fundamentals.md
│   │   ├── database-design-principles.md
│   │   └── ... (more articles)
│   ├── vi/                        # Vietnamese translations (12+ files)
│   │   ├── react-basics.md
│   │   └── ... (translated content)
│   └── blog/                      # Blog posts (personal content)
│       ├── en/                    # English blog posts
│       │   ├── welcome-to-my-blog.md
│       │   └── ... (more blog posts)
│       └── vi/                    # Vietnamese blog posts
│           ├── welcome-to-my-blog.md
│           └── ... (translated blog posts)
│
├── messages/                      # i18n translation files
│   ├── en.json                    # English UI strings
│   │   ├── Layout.navigation.home
│   │   ├── Layout.footer.copyright
│   │   ├── HomePage.hero.title
│   │   └── ... (UI translations)
│   └── vi.json                    # Vietnamese UI strings
│
├── styles/
│   └── globals.css                # Global Tailwind CSS
│       ├── Glass-morphism styles
│       ├── Custom heading classes (heading-xl, heading-lg, heading-md)
│       ├── Button classes (btn-primary, btn-secondary)
│       └── Container & spacing utilities
│
├── middleware.ts                  # next-intl locale detection middleware
├── i18n.ts                        # i18n configuration & locale setup
└── not-found.tsx                  # Global 404 fallback (App Router)

public/                            # Static assets
└── (favicon, images, etc.)

.claude/
├── rules/                         # Development rules and standards
│   ├── development-rules.md
│   ├── documentation-management.md
│   ├── orchestration-protocol.md
│   ├── primary-workflow.md
│   └── team-coordination-rules.md
└── skills/                        # AI assistant skill configurations

docker/                            # Docker configuration
docker-compose.yml                 # Docker Compose setup
.repomixignore                     # Files to exclude from codebase analysis

Configuration Files:
├── next.config.mjs               # Next.js config with next-intl plugin
├── tailwind.config.ts            # Tailwind CSS theme and content paths
├── tsconfig.json                 # TypeScript compiler options
├── package.json                  # Dependencies and scripts
└── .eslintrc.json                # ESLint configuration
```

## Core Data Flow

```
User Request
    ↓
[Middleware] (src/middleware.ts)
    ├─ Detect/validate locale from URL
    ├─ Route to [locale] parameter
    └─ Load locale-specific messages
    ↓
[App Router] (src/app/[locale]/...)
    ├─ Server Component (page.tsx)
    ├─ Render Layout (header, nav, footer)
    └─ Execute data fetching
    ↓
[Business Logic] (src/lib/posts.ts)
    ├─ File System Read (src/data/[locale]/*.md)
    ├─ Parse YAML frontmatter (gray-matter)
    ├─ Apply filtering (category, tag, search)
    └─ Return PostData[] or PostData
    ↓
[Markdown Processing] (remark + plugins)
    ├─ Parse markdown content
    ├─ Apply GFM transformations
    └─ Render to HTML (no sanitization)
    ↓
[Client Components] (React interactive UI)
    ├─ SearchBar (real-time filtering)
    ├─ LanguageSwitcher (locale switching)
    ├─ PostContent (render HTML + Mermaid)
    └─ KnowledgeCard (display metadata)
    ↓
Browser Output (HTML + CSS + Tailwind styles)
```

## Architecture Patterns

### Server Components (Default)
- Page components (*.tsx in app/)
- Layout components
- Data fetching directly in components
- No client hydration overhead

### Client Components
- Interactive UI: `SearchBar.tsx`, `LanguageSwitcher.tsx`
- Event handlers: onClick, onChange
- Browser APIs: localStorage (if needed)
- Marked with `'use client'` directive

### Data Flow Pattern
1. **Loading:** `getSortedPostsData(locale)` → file system read
2. **Filtering:** Category/tag/search logic in posts.ts
3. **Rendering:** Pass PostData to components
4. **Transformation:** remark → HTML → React render

### API Routes
- **GET /[locale]/api/posts** → Returns all posts for locale as JSON
- Used by SearchBar component for client-side filtering

### i18n Pattern
- Locale detection via middleware
- Messages loaded dynamically in i18n.ts
- `useTranslations()` hook in client components
- Bilingual category mapping in posts.ts

## Code Organization & Testing

### Test Coverage
- **37 test files** (vitest 4.0.8 + @testing-library/react 16)
- **Categories:** Integration tests, security tests, validation tests, i18n tests, error-handling tests
- **Framework:** vitest 4.0.8, @testing-library/react 16, @testing-library/jest-dom
- **Coverage Target:** Phase 1 goal is 95%+

## Key Modules & Responsibilities

### posts.ts (Core Business Logic - 292 LOC)

| Function | Purpose |
|----------|---------|
| `getSortedPostsData(locale)` | Load all posts, parse metadata, sort by date descending |
| `getPostData(id, locale)` | Load single post + render markdown to HTML |
| `getAllPostIds(locales)` | Static generation support (paths for all posts) |
| `getAllTags(locale)` | Get all unique tags with occurrence counts |
| `getPostsByTag(tag, locale)` | Filter posts by tag name |
| `getAllCategories(locale)` | Get all unique categories with counts |
| `getPostsByCategory(category, locale)` | Filter posts by category |
| `getAllCategoriesWithSlug(locale)` | Categories with URL slugs + bilingual names |
| `getPostsByCategorySlug(slug, locale)` | Filter posts by URL slug |
| `getCategoryNameBySlug(slug, locale)` | Resolve slug to translated category name |
| `slugify(text)` | Normalize text to URL-safe slug (removes diacritics) |

### blog-moods.ts (Blog Mood Definitions - NEW)

| Function | Purpose |
|----------|---------|
| `BLOG_MOODS` | Constant defining 8 mood types: reflective, joyful, thoughtful, inspired, grateful, contemplative, energetic, peaceful |
| `getMoodIcon(moodKey)` | Get emoji icon for mood type |
| `getMoodLabel(moodKey, locale)` | Get translated label for mood |

### blog-posts.ts (Blog Post Data Loading - NEW)

| Function | Purpose |
|----------|---------|
| `getSortedBlogPosts(locale)` | Load all blog posts, parse metadata, sort by date descending |
| `getBlogPostData(id, locale)` | Load single blog post + render markdown to HTML |
| `getAllBlogPostIds(locales)` | Static generation support (paths for all blog posts) |
| `getAllBlogMoods(locale)` | Get all unique moods with occurrence counts |
| `getBlogPostsByMood(mood, locale)` | Filter blog posts by mood |
| `calculateReadingTime(contentHtml)` | Calculate reading time in minutes (200 words/min) |

### Markdown Import Feature

| Component | Purpose |
|-----------|---------|
| MarkdownImporter.tsx | Multi-step wizard (select file → preview → confirm) with autoFormat/autoTranslate toggles |
| FileUploadZone.tsx | Drag-drop or click to upload (10MB limit, base64 encoding) |
| StyleConverter.tsx | Convert HTML to Tailwind CSS classes |
| MarkdownProcessor.ts | Parse frontmatter, validate structure, convert styles |
| ContentSanitizer.ts | XSS prevention (allowed elements: h1-h6, p, code, ul, ol, li, table, blockquote, a, img, strong, em, code) |
| MarkdownErrorHandler.ts | Bilingual error messages (EN/VI) |
| UndoManager.ts | Revert last import (10 actions, 5min expiry) — now handles both original + translated files |
| ChunkedProcessor.ts | Process large files in 10KB non-blocking chunks |
| FileValidator.ts | Validate MIME type, size (5MB), required frontmatter fields |

### NEW: Markdown Translation Feature

| Component | Purpose |
|-----------|---------|
| TranslationService.ts | Google Translate API wrapper with chunking (>14KB splits) and retry logic |
| MarkdownTranslator.ts | Markdown-aware translator using placeholder system to preserve code/links/images |
| Translation Tests | 8+ test suites covering EN↔VI translation, placeholder handling, frontmatter translation |

### NEW: Markdown Formatting Feature

| Component | Purpose |
|-----------|---------|
| MarkdownFormatter.ts | Auto-formatter normalizing frontmatter, headings, code blocks, links, lists, whitespace |
| Formatting Tests | 12+ test suites covering each formatting rule individually and in combination |

### Notification System

| Aspect | Implementation |
|--------|----------------|
| Context | NotificationContext (showSuccess, showError, showWarning, showInfo) |
| Features | Auto-dismiss, manual dismiss, clearAll |
| Types | 4 types: success, error, warning, info |
| Use Cases | File upload feedback, import status, validation errors |

### SearchBar.tsx (Client Search - 216 LOC)

| Feature | Implementation |
|---------|----------------|
| Data Loading | Fetch `/[locale]/api/posts` on mount |
| Search Logic | Real-time filtering by title, description, tags, categories |
| Results Display | Dropdown with max 6 results, full search page link |
| UX | Click-outside detection, focus handling, no-results state |

### PostContent.tsx (Markdown Rendering)

- Receives `contentHtml` (pre-rendered from posts.ts)
- Renders HTML with Tailwind styles
- No HTML sanitization (XSS risk if user-generated)
- Supports Mermaid diagrams

## Security Architecture

### Content Sanitization
- **Library:** isomorphic-dompurify 2.32.0
- **Allowed Elements:** h1-h6, p, code, ul, ol, li, table, blockquote, a, img, strong, em, pre
- **Allowed Attributes:** href (URLs validated), src, alt, title, className
- **URL Validation:** Scheme-based whitelist (http, https, /relative)
- **Usage:** All imported markdown sanitized before storage/display

### File Upload Security
- **Max Size:** 10MB (enforced on client & server)
- **Allowed MIME:** text/markdown, text/plain, application/octet-stream
- **Base64 Encoding:** Files encoded for safe transport
- **Frontmatter Required:** title, description, date, tags, categories

## File Organization Conventions

### Component Files
- **File name:** PascalCase (e.g., `SearchBar.tsx`)
- **Export:** Named component `export default`
- **Props:** Define interface above component
- **Directives:** `'use client'` for interactivity
- **Size Limit:** Keep components under 200 LOC

### Page Files
- **Pattern:** Dynamic routes use `[param]` notation
- **Type safety:** `params` typed in Props
- **Metadata:** Can use metadata export for SEO (optional)

### Utility Files
- **File name:** camelCase or kebab-case (e.g., `posts.ts`)
- **Export:** Named exports for functions
- **Types:** Define interfaces at top of file

### Content Files
- **Format:** Markdown with YAML frontmatter
- **Naming:** kebab-case (e.g., `react-basics.md`)
- **Frontmatter:** `title`, `description`, `date`, `tags[]`, `categories[]`
- **Optional:** `gradientFrom`, `gradientTo` (hex colors)

## Import Paths & Aliases

```typescript
// Defined in tsconfig.json
import { getSortedPostsData } from '@/lib/posts';      // src/lib/posts
import SearchBar from '@/components/ui/SearchBar';     // src/components/ui/SearchBar
import { useTranslations } from 'next-intl';           // External
```

## TypeScript Interfaces

### PostData
```typescript
interface PostData {
  id: string;                  // Filename without .md
  title: string;               // Article title
  description: string;         // Brief description
  date: string;                // YYYY-MM-DD format
  tags: string[];              // Tag array
  categories: string[];        // Category array
  gradientFrom?: string;       // Optional hex color
  gradientTo?: string;         // Optional hex color
  contentHtml?: string;        // Rendered HTML (when loaded via getPostData)
  [key: string]: any;          // For additional frontmatter
}
```

## Performance Characteristics

| Metric | Implementation |
|--------|----------------|
| **Build Time** | ~30-60s (depending on article count) |
| **Page Load** | Server-rendered HTML + minimal JS |
| **Search** | Client-side filtering (instant, <100ms) |
| **Image Optimization** | Next.js Image component (when used) |
| **Code Splitting** | Automatic per-route |
| **Bundle Size** | ~200KB (gzip), optimized by Next.js |

## Content Organization

### Categories (14+ Examples)
- Programming Languages
- Development Core
- AI
- Tool
- Database
- Security
- Design Patterns
- Framework
- Java
- Frontend
- Backend
- IDE

### Bilingual Translation Map
Located in `src/lib/posts.ts` (categoryTranslationMap):
- Maps English category names to Vietnamese equivalents
- Used by `getTranslatedCategory()` function
- Automatically applied in category listings

### Tags (86+ Examples)
Tags are dynamically extracted from article frontmatter:
- React, Node.js, Java, Python, TypeScript, etc.
- Redis, PostgreSQL, MongoDB, etc.
- Design patterns, Best practices, Security concepts, etc.

## Build & Deployment Configuration

### Next.js Config (next.config.mjs)
- Uses next-intl plugin via `withNextIntl()`
- Points to `src/i18n.ts` for configuration

### Tailwind Config (tailwind.config.ts)
- Content paths: `src/pages/**`, `src/components/**`, `src/app/**`
- Theme extensions: gradient utilities
- Plugins: None (vanilla Tailwind)

### TypeScript Config (tsconfig.json)
- Strict mode enabled
- Path aliases: `@/*` → `src/`
- Target: ES2020
- Module: ESNext

## Development Workflow

### Adding a New Article
1. Create `.md` file in `src/data/en/` (or `src/data/vi/`)
2. Add YAML frontmatter (title, description, date, tags, categories)
3. Write content in Markdown with GFM support
4. Run `npm run build` to trigger ISR/regeneration
5. Optional: Add `gradientFrom`/`gradientTo` for custom styling

### Adding a New Category
1. Use category name in article frontmatter
2. Optionally add translation to `categoryTranslationMap` in posts.ts
3. Category auto-appears in categories listing

### Internationalization
1. Edit `src/messages/en.json` or `src/messages/vi.json`
2. Use keys like `Layout.navigation.home`
3. Reference in components via `useTranslations()` hook

## Codebase Metrics

- **Total Lines:** ~18,500+ LOC across 100+ TypeScript/TSX files
- **Pages:** 14+ pages/routes with locale prefixes (added: /blog, /blog/[slug])
- **API Endpoints:** 3 endpoints (posts, markdown/import, markdown/undo)
- **Components:** 16 UI components, 1 markdown component
- **Test Files:** 50+ files (vitest 4.0.8 + @testing-library/react 16)
  - 37 existing test files
  - 13 new blog test suites (31 tests total)
- **Utility Modules:** 22+ modules including:
  - posts, blog-posts, blog-moods, markdown, translation, formatting
  - security, performance, validation, undo, error-handling, accessibility
- **Dependencies:** 36+ production dependencies (React, Next.js, TypeScript, Tailwind, remark, Mermaid, @vitalets/google-translate-api, etc.)

## Known Limitations & Considerations

- **No Database:** Content is file-based (git-friendly but scales to ~1000 articles)
- **No Authentication:** Public knowledge base (Phase 2 feature)
- **Client-Side Search:** No backend index (works well for <1000 posts)
- **Import via UI:** New in current version (vs. git-only before)
- **Sanitization:** All markdown automatically sanitized via ContentSanitizer
- **Locale Prefix Required:** All routes must include locale parameter
