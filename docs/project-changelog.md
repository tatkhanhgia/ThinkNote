# ThinkNote - Project Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- User profile enhancements (avatar, bio, statistics)
- Article comments and discussions
- Email notifications for article review
- Advanced search with Elasticsearch backend
- Analytics dashboard for contributors

---

## [1.2.0] - 2026-03-23

### Added - Community Article Publishing System

**Major Feature:** Full-featured article publishing system enabling authenticated users to create, draft, submit, and manage community-contributed articles with admin review workflow.

#### Database & Models
- Added PostgreSQL integration via Prisma ORM
- `Article` model with fields: id, title, slug, description, content, locale, status, categories, tags, gradientFrom, gradientTo, coverImage, reviewNote, reviewedAt, reviewedBy, publishedAt, authorId, createdAt, updatedAt
- `ArticleStatus` enum: DRAFT, PENDING, PUBLISHED, REJECTED
- Relationship: Articles linked to Users via authorId
- Unique constraint: (slug, locale) pair
- Indexes: status, authorId, locale for efficient queries

#### API Endpoints
- `GET /api/articles` - List articles with filtering by status, locale, author
- `POST /api/articles` - Create new draft article (auth required)
- `GET /api/articles/[id]` - Fetch article detail (public for published, restricted for drafts)
- `PATCH /api/articles/[id]` - Update article (author/admin only)
- `DELETE /api/articles/[id]` - Delete article (author/admin only)
- `POST /api/articles/[id]/submit` - Submit article for review (author only)
- `POST /api/articles/[id]/publish` - Publish article (admin only)
- `POST /api/articles/[id]/reject` - Reject with feedback (admin only)
- `POST /api/upload` - Upload article images with magic bytes validation (auth required)

#### Components (UI)
- **ArticleEditor** - TipTap WYSIWYG editor with toolbar, auto-save (30s), image upload (drag/drop/paste/button)
- **ArticleEditorToolbar** - Formatting controls (bold, italic, headings, links, code, images)
- **ArticleForm** - Metadata form (title, slug, locale, categories, tags, gradients)
- **CategoryTagInput** - Multi-select dropdown with autocomplete for categories/tags
- **ArticleStatusBadge** - Color-coded status indicator (DRAFT gray, PENDING yellow, PUBLISHED green, REJECTED red)
- **ArticleRejectDialog** - Admin feedback dialog for rejections
- **MyArticlesClient** - User dashboard showing their articles with filters and actions
- **AdminArticlesClient** - Admin dashboard for pending articles with review controls

#### Pages
- `/articles/create` - Create new article page (auth required)
- `/articles/[slug]/edit` - Edit existing article (author/admin only)
- `/articles/my` - User's article management dashboard (auth required)
- `/admin/articles` - Admin review dashboard for pending articles (admin only)
- `/articles/[slug]` - Public article detail page (published articles public, drafts restricted)

#### Features
- Draft autosave every 30 seconds
- Slug auto-generation from title with URL-safe encoding
- Full WYSIWYG editor with TipTap (bold, italic, headings, links, code blocks, images)
- Image upload with validation (PNG, JPG, WebP; magic bytes check; 5MB limit)
- Bilingual article support (per-locale publishing)
- Category and tag assignment with autocomplete
- Gradient color customization for article cards
- Editorial workflow: DRAFT → PENDING → PUBLISHED (or REJECTED)
- Admin review interface with rejection feedback
- HTML content sanitization using DOMPurify (XSS prevention)
- Authentication guards on all mutation endpoints
- Ownership verification (authors can only edit/delete own articles)

#### Integration with Existing Features
- Community articles merged into knowledge base display
- Search results include published community articles alongside KB articles
- Topics/categories pages display both KB and community articles
- KnowledgeCard component shows "Community" badge for user-published articles
- Author information displayed on article cards and detail pages
- Unified category/tag system (shared with KB articles)

#### Security
- DOMPurify sanitization on save and render
- Image magic bytes validation prevents file type spoofing
- Authentication checks on protected routes
- Ownership verification prevents unauthorized edits
- Slug + locale uniqueness prevents collisions
- CUID-based IDs prevent enumeration attacks

#### Database Changes
- New `Article` model in Prisma schema
- New `ArticleStatus` enum
- Foreign key relationship User → Article
- Cascading delete on user removal

---

## [1.1.0] - 2026-03-17

### Added - Personal Blog Feature

**Feature:** Separated personal blog section from knowledge base with mood-based filtering and cozy aesthetic.

#### Pages
- `/blog` - Blog post listing with mood filtering
- `/blog/[slug]` - Individual blog post with reading time
- Blog navigation link in header

#### Components
- **BlogCard** - Blog post card with mood indicator
- **MoodFilter** - Filter blog posts by 8 mood tags
- **ReadingTime** - Calculate and display estimated reading time

#### Features
- 8 mood tags: reflective, joyful, thoughtful, inspired, grateful, contemplative, energetic, peaceful
- Bilingual blog support (English & Vietnamese)
- Reading time estimation
- Warm color palette and serif fonts
- Max-width prose layout for readability

#### Testing
- 31 new tests (13 library + 18 component tests)
- Coverage for blog utilities, filtering, and rendering

---

## [1.0.0] - 2026-03-01

### Initial Release - MVP & Core Features

#### Core Features Implemented
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS with glass-morphism design
- Bilingual support (English & Vietnamese via next-intl)
- File-based markdown content system with YAML frontmatter
- Full-text search with client-side filtering
- Category and tag system with bilingual translations
- Article detail pages with Mermaid diagram support
- Responsive mobile-first design
- Custom 404 page

#### Content Management
- 50+ knowledge articles organized in 14+ categories
- 86+ tags for cross-cutting concerns
- Bilingual article system (English primary, Vietnamese translations)

#### Infrastructure
- Docker & Docker Compose setup
- ESLint configuration and linting
- Comprehensive test suite (50+ test files)
- Content sanitization pipeline (isomorphic-dompurify)
- Markdown import API with auto-format and auto-translate
- Undo system for import rollback

#### Documentation
- Project overview and PDR
- System architecture guide
- Code standards and conventions
- Deployment guide (Vercel, Docker, self-hosted)
- Design guidelines

#### Technical Stack
- Next.js 14.2, React 18.3, TypeScript 5
- Tailwind CSS 3.4, PostCSS
- next-intl 4.3.4 for i18n
- remark 15.0.1 + remark-gfm for markdown
- gray-matter 4.0.3 for YAML parsing
- Mermaid 11.9.0 for diagrams
- Vitest 4.0.8 for testing
- @testing-library/react 16 for component tests

---

## Version Format

Versions follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes or architectural shifts
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes and improvements

## Release Cadence

- **Phase 1** (Current): Bi-weekly releases (~Sprint-based)
- **Phase 2** (Q2-Q3 2026): Monthly releases with larger features
- **Phase 3+** (2027+): Quarterly releases with community input

## How to Report Issues

See CONTRIBUTING.md for bug report guidelines and templates.

---

**Last Updated:** 2026-03-23
**Maintained By:** Project Team
