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
│   │   │   └── posts/route.ts     # GET /[locale]/api/posts - returns all posts JSON
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
│   │   └── search/
│   │       ├── page.tsx           # Search results page
│   │       └── SearchResults.tsx  # Client component for search UI
│   ├── layout.tsx                 # Root layout (HTML, NextIntl provider)
│   ├── page.tsx                   # Root redirect to [locale]/page
│   └── not-found.tsx              # Custom 404 page
│
├── lib/
│   └── posts.ts                   # Core business logic (291 lines)
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
├── components/ui/                 # Reusable React components
│   ├── SearchBar.tsx              # Client component - full-text search
│   │   ├── Fetches /api/posts on mount
│   │   ├── Real-time search filtering
│   │   └── Dropdown results (6 max)
│   ├── LanguageSwitcher.tsx       # Client component - locale switcher
│   ├── PostContent.tsx            # Client component - renders markdown HTML
│   │   ├── Handles HTML injection (sanitize: false)
│   │   └── Mermaid diagram support
│   ├── KnowledgeCard.tsx          # Card component for article listing
│   ├── CustomButton.tsx           # Reusable button component
│   └── LogoIcon.tsx               # Logo SVG component
│
├── data/                          # Content files (Markdown + YAML)
│   ├── en/                        # English articles (12+ files)
│   │   ├── react-basics.md
│   │   ├── typescript-setup.md
│   │   ├── java-fundamentals.md
│   │   ├── database-design-principles.md
│   │   └── ... (more articles)
│   └── vi/                        # Vietnamese translations (12+ files)
│       ├── react-basics.md
│       └── ... (translated content)
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

## Key Modules & Responsibilities

### posts.ts (Core Business Logic - 291 LOC)

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

## File Organization Conventions

### Component Files
- **File name:** PascalCase (e.g., `SearchBar.tsx`)
- **Export:** Named component `export default`
- **Props:** Define interface above component
- **Directives:** `'use client'` for interactivity

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

## Known Limitations & Considerations

- **No Database:** Content is file-based (git-friendly but less scalable)
- **No Authentication:** Public knowledge base (privacy features in Phase 2)
- **Client-Side Search:** No backend index (works well for <1000 posts)
- **Static Generation:** Requires rebuild for new content
- **XSS Risk:** HTML sanitization disabled in remark-html config
- **Locale Prefix Required:** All routes must include locale parameter
