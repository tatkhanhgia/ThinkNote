# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ThinkNote** is a personal knowledge base built with Next.js. It's a searchable, organized repository for technical notes and knowledge across multiple locales (English and Vietnamese). Content is authored in Markdown files with YAML frontmatter and organized by categories and tags.

## Development Commands

### Core Commands
- **`npm run dev`** - Start development server at `http://localhost:3000`
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run lint`** - Run ESLint

### Database Commands
- **`npm run db:up`** - Start PostgreSQL Docker container (docker-compose)
- **`npm run db:down`** - Stop PostgreSQL Docker container
- **`npm run db:push`** - Sync Prisma schema with database
- **`npm run db:studio`** - Open Prisma Studio web UI for database inspection
- **`npm run db:generate`** - Generate Prisma client

### Testing Commands
- **`npm run test`** - Run all tests (vitest watch mode)
- **`npm run test:run`** - Run tests once (CI mode)
- **`npm run test:ui`** - Open vitest UI dashboard

## Architecture Overview

### Technology Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Database:** PostgreSQL 16 + Prisma ORM 7.5+
- **Authentication:** better-auth 1.5.6 (email/password, email verification, admin plugin)
- **Styling:** Tailwind CSS 3.4+ with PostCSS
- **i18n:** `next-intl` 4.3.4 for English/Vietnamese localization
- **Markdown:** `remark`, `remark-gfm`, `remark-html`, `gray-matter`
- **Rich Text:** Tiptap 3.20.4 WYSIWYG editor
- **Email:** nodemailer 8.0.3 (SMTP)
- **Diagram Support:** Mermaid 11.9.0
- **Sanitization:** isomorphic-dompurify 2.36.0
- **Translation:** @vitalets/google-translate-api 9.2.1
- **Testing:** vitest 4.0.8, @testing-library/react 16+

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-specific pages (en, vi)
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Locale layout with header/footer
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # better-auth routes
│   │   │   ├── posts/            # GET posts data
│   │   │   ├── articles/         # CRUD articles endpoints
│   │   │   ├── upload/           # Image upload
│   │   │   └── markdown/         # Import/undo endpoints
│   │   ├── search/               # Full-text search pages
│   │   ├── categories/           # Category browsing pages
│   │   ├── tags/                 # Tag browsing pages
│   │   ├── blog/                 # Blog listing and detail pages
│   │   ├── topics/               # Knowledge base article detail
│   │   ├── articles/             # Community articles (create, edit, view, my)
│   │   └── admin/                # Admin moderation dashboard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect to default locale
│   └── not-found.tsx             # Custom 404 page
│
├── lib/
│   ├── posts.ts                  # File-based KB post loading (330 LOC)
│   ├── community-posts.ts        # Database articles, merged posts (87 LOC)
│   ├── auth.ts                   # better-auth config (55 LOC)
│   ├── auth-guard.ts             # requireAuth, requireAdmin helpers (57 LOC)
│   ├── markdown/                 # Markdown processing modules
│   │   ├── MarkdownProcessor.ts  # Parse, validate, convert
│   │   └── MarkdownErrorHandler.ts
│   ├── security/
│   │   └── ContentSanitizer.ts   # XSS prevention with DOMPurify (273 LOC)
│   ├── validation/
│   │   └── FileValidator.ts      # Upload validation (219 LOC)
│   ├── performance/
│   │   └── ChunkedProcessor.ts   # Non-blocking file processing (287 LOC)
│   ├── error-handling/
│   │   └── ErrorHandler.ts       # Error categorization (189 LOC)
│   └── translation/
│       └── TranslationService.ts # Google Translate API wrapper
│
├── components/
│   ├── ui/                       # 42 UI components (4,075 LOC)
│   │   ├── SearchBar.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── PostContent.tsx
│   │   ├── KnowledgeCard.tsx
│   │   ├── ArticleEditor.tsx     # TipTap WYSIWYG editor
│   │   ├── ArticleForm.tsx       # Article metadata form
│   │   ├── MyArticlesClient.tsx  # User dashboard
│   │   ├── AdminArticlesClient.tsx # Admin review dashboard
│   │   ├── BlogCard.tsx          # Blog post card
│   │   ├── MoodFilter.tsx        # Blog mood filtering
│   │   └── ... (more components)
│   └── markdown/
│       └── StyleConverter.tsx    # HTML to Tailwind mapping
│
├── data/                         # Markdown content files
│   ├── en/                       # English articles + blog
│   │   ├── *.md                  # KB articles
│   │   └── blog/*.md             # Blog posts
│   └── vi/                       # Vietnamese translations
│
├── messages/                     # i18n translation files
│   ├── en.json
│   └── vi.json
│
├── middleware.ts                 # Locale detection + auth protection
├── i18n.ts                       # i18n configuration
└── styles/globals.css            # Global Tailwind CSS + animations
```

### Key Data Flow

#### File-Based Knowledge Base
1. **Source:** Markdown files in `src/data/[locale]/` with YAML frontmatter
2. **Format:** Must include frontmatter with title, description, date, tags, categories
3. **Loading:** `src/lib/posts.ts` provides:
   - `getSortedPostsData(locale)` - Get all posts sorted by date
   - `getPostData(id, locale)` - Get single post with rendered HTML
   - `getAllPostIds(locales)` - For static generation
   - `getAllCategories(locale)` / `getPostsByCategory()` - Category filtering
   - `getAllTags(locale)` / `getPostsByTag()` - Tag filtering

#### Database Articles (Community Publishing)
1. **Source:** PostgreSQL Article model via Prisma
2. **Workflow:** Draft → Submit → Pending → Approved → Published (or Rejected)
3. **Loading:** `src/lib/community-posts.ts` provides:
   - `getArticles(filters)` - Get articles by status, locale, author
   - `getArticleBySlug(slug, locale)` - Get single article
   - `getMergedPosts(locale)` - Merge KB + DB articles

#### Merged Search & Display
- `getMergedPosts()` combines file-based KB and database articles
- Search, categories, and tags include both sources
- Community articles marked with "Community" badge

### Internationalization (i18n)

- **Locales:** English (`en`) and Vietnamese (`vi`)
- **Default Locale:** English
- **Implementation:** `next-intl` middleware in `src/middleware.ts`
- **Translations:** `src/messages/{locale}.json` for UI strings (Layout, navigation, footer)
- **Category Translation:** `src/lib/posts.ts` includes a `categoryTranslationMap` for category names
- **Routing:** All routes are prefixed with `[locale]` (e.g., `/en/categories`, `/vi/categories`)
- **Language Switching:** `LanguageSwitcher` component preserves current page path when switching locales

### Page Generation

Pages use **dynamic parameters** for flexibility:
- **Static (with ISR):** Home, categories, tags pages
- **Dynamic:** Individual posts, category detail pages, tag detail pages
- Path patterns use `[locale]` for all pages, enabling locale-specific content

### Component Patterns

- **PostContent.tsx** - Renders markdown HTML; sanitization set to `false` (allow HTML injection)
- **SearchBar.tsx** - Full-text search across all posts in current locale
- **LanguageSwitcher.tsx** - Locale switcher maintaining current page context
- **KnowledgeCard.tsx** - Card component for post display

### Styling

- Tailwind CSS with custom classes
- Glass-morphism design in header (`glass` class)
- Gradient backgrounds for cards
- Responsive design (mobile-first with `md:`, `lg:` breakpoints)

## Common Tasks

### Adding a New Article
1. Create a `.md` file in `src/data/en/` (or `src/data/vi/` for Vietnamese)
2. Include required YAML frontmatter (title, description, date, tags, categories)
3. Write content in Markdown with GitHub Flavored Markdown support
4. Optional: Add `gradientFrom` and `gradientTo` for card styling

### Adding a New Category
1. Add category name to an article's frontmatter `categories` array
2. Optionally add translation to `categoryTranslationMap` in `src/lib/posts.ts`
3. The category automatically appears in the categories page

### Changing UI Translations
1. Edit `src/messages/en.json` or `src/messages/vi.json`
2. Use keys like `Layout.navigation.home`, `Layout.footer.copyright`
3. Keys are used with `useTranslations()` hook in components

### Styling the Site
- Global CSS: `src/styles/globals.css`
- Component classes: Edit component `.tsx` files directly
- Tailwind config: Check `tailwind.config.js` (not shown but implied)

## Database & Authentication

### PostgreSQL + Prisma ORM
- **Schema Location:** `prisma/schema.prisma`
- **Models:** User, Account, Session, Verification, Article
- **Migrations:** `prisma migrate` auto-generates and applies schema changes
- **Connection:** PostgreSQL 16 via Docker (docker-compose.yml)
- **Access:** Prisma Client for type-safe database queries

### User & Article Models
```prisma
model User {
  id: String @id @default(cuid())
  name: String?
  email: String @unique
  emailVerified: DateTime?
  image: String?
  role: String @default("user")  // "user" or "admin"
  banned: Boolean @default(false)
  articles: Article[]
}

model Article {
  id: String @id @default(cuid())
  title: String
  slug: String
  content: String
  status: ArticleStatus  // DRAFT, PENDING, PUBLISHED, REJECTED
  authorId: String
  author: User @relation(fields: [authorId])
  locale: String
  categories: String[]
  tags: String[]
  reviewNote: String?
  publishedAt: DateTime?
}

enum ArticleStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}
```

### Authentication (better-auth 1.5.6)
- **Provider:** Email/password with email verification
- **Session:** 7-day expiry, 1-day refresh, 5-min cookie cache
- **Email:** nodemailer SMTP for verification emails
- **Admin Plugin:** Role-based access control (user, admin)
- **Guards:** `requireAuth()`, `requireAdmin()` in middleware/API routes

### Community Article Publishing Workflow
1. User creates draft article (status: DRAFT)
2. User submits for review (status: PENDING)
3. Admin reviews and approves (status: PUBLISHED) or rejects with feedback
4. Published articles appear in KB and search results
5. Authors can edit/delete their own drafts and pending articles

## Security Architecture (5-Layer)

1. **Input Validation:** FileValidator checks MIME, size, frontmatter fields
2. **Content Sanitization:** DOMPurify removes XSS vectors (script tags, event handlers)
3. **Path Security:** Traversal prevention in file operations
4. **Threat Detection:** Pattern matching for suspicious content
5. **Auth & Authorization:** better-auth + role-based guards (requireAuth, requireAdmin)

## Important Notes

- **Markdown Processing:** `remark-html` configured with `sanitize: false`; XSS handled by DOMPurify layer instead
- **Category Slugs:** Generated via `slugify()` function; diacritics removed (e.g., "Lập trình" → "lap-trinh")
- **Content Organization:**
  - File-based KB: `src/data/[locale]/*.md` (static, git-tracked)
  - Database articles: PostgreSQL (dynamic, user-generated)
  - Merged in search/listings via `getMergedPosts()`
- **Hybrid Model:** File-based for admin content, database for community contributions
- **Email Service:** SMTP required for email verification (configured via environment variables)
- **Search:** Client-side merging of KB + DB articles; efficient to ~2000 total articles
