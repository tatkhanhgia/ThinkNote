# ThinkNote - Project Overview & PDR

## Vision

ThinkNote is a personal knowledge base web application designed to help developers organize, discover, and reference technical knowledge across multiple programming languages, frameworks, and concepts. It provides a fast, searchable, and beautifully designed interface for managing a collection of technical articles and notes.

## Project Description

**ThinkNote** is a modern knowledge base platform built for developers, by developers. It serves as a centralized repository for technical documentation, learning resources, and reference materials with support for multiple languages and comprehensive search capabilities.

## Target Users

- Software developers seeking a personal knowledge management system
- Technical leads maintaining team documentation
- Students and learners building technical reference materials
- Organizations with distributed technical knowledge

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-language Support** | Full support for English and Vietnamese with locale-aware routing |
| **Full-Text Search** | Client-side search across knowledge base + community articles (title, description, tags, categories) |
| **Category Organization** | 14+ categories with bilingual support and automatic slug generation |
| **Tag System** | 86+ tags for fine-grained article classification |
| **Markdown Content** | Support for GitHub Flavored Markdown, code blocks, tables, and Mermaid diagrams |
| **Community Publishing** | Authenticated users can create, draft, and submit articles with admin review workflow |
| **Rich Text Editor** | TipTap WYSIWYG editor with formatting toolbar, image upload, auto-save for articles |
| **User Authentication** | Email/password auth with email verification, session management, admin roles |
| **Personal Blog** | Admin-managed blog section with mood-based filtering (8 mood types); CRUD management UI with markdown import |
| **Admin Blog CRUD** | Complete blog post management system (create, read, update, delete, import) with status workflows and mood tagging |
| **Responsive Design** | Mobile-first design with glass-morphism effects and gradient styling |
| **Content Metadata** | YAML frontmatter for rich metadata (date, tags, categories, gradients) |
| **Article Browsing** | Browse by category, tags, or view all articles (KB + community articles unified) |
| **Image Management** | Upload, validate, and serve article cover images with magic bytes protection |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.2+ (App Router, SSR) |
| **Language** | TypeScript | 5.x (strict mode) |
| **Database** | PostgreSQL + Prisma ORM | 16, 7.5+ |
| **Authentication** | better-auth | 1.5.6 (email/password, email verification, admin plugin) |
| **Styling** | Tailwind CSS | 3.4+ with PostCSS |
| **Internationalization** | next-intl | 4.3.4 |
| **Markdown Processing** | remark, remark-gfm, gray-matter | 15.0.1+, 4.0.3+ |
| **Rich Text Editor** | Tiptap | 3.20.4 |
| **Email** | nodemailer | 8.0.3 (SMTP, verification emails) |
| **Security** | isomorphic-dompurify | 2.36.0 (XSS prevention) |
| **Diagrams** | Mermaid | 11.9.0 |
| **Translation** | @vitalets/google-translate-api | 9.2.1 |
| **Testing** | vitest, @testing-library/react | 4.0.8+, 16+ |
| **Linting** | ESLint | 8.x |
| **Toast Notifications** | sonner | 2.0.7 |

## Current Status

**Phase:** Active Development (Phase 1 - ~85% Complete)

- **Content:** 50+ knowledge articles (12+ English, 12+ Vietnamese translations)
- **Categories:** 14+ active categories with bilingual translations
- **Tags:** 86+ tags for content classification
- **Database:** PostgreSQL + Prisma ORM for community articles
- **Authentication:** better-auth with email verification, role-based access (user, admin)
- **Community Publishing:** Full article submission/review workflow (DRAFT → PENDING → PUBLISHED/REJECTED)
- **Blog:** Personal blog feature with 8 mood-based filtering, reading time, and admin CRUD management
- **Admin Blog Management:** Complete blog post CRUD API, markdown import, status workflows, mood tagging
- **Architecture:** Hybrid content (file-based KB + database articles + admin blog posts), SSR, markdown import, sanitization
- **Testing:** 50+ test files with vitest covering unit, integration, security, i18n, error handling
- **Features:** Search (unified KB + DB), import, notifications, WYSIWYG editor, image upload, moderation
- **Deployment:** Docker & Vercel ready, self-hosted support via PM2

## Success Metrics (Phase 1)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Article Count | 100+ | 50+ | In Progress |
| Category Coverage | 20+ | 14+ | In Progress |
| Test Coverage | 95%+ | 60%+ | In Progress |
| Search Performance | <100ms | Achieved | ✓ |
| Mobile Responsiveness | 100% | Achieved | ✓ |
| i18n Completeness | 100% (en, vi) | 90%+ | In Progress |
| Page Load Time | <2s | Achieved | ✓ |
| Security (XSS Prevention) | 100% | Achieved | ✓ |
| Accessibility (WCAG AA) | 100% | 80%+ | In Progress |

## Key Constraints & Considerations

- **Content Security:** All user-generated content sanitized via DOMPurify (XSS prevention)
- **File Upload Limit:** Images: 5MB max with magic bytes validation; Markdown: 10MB max
- **Hybrid Content:** File-based KB (~1000 articles) + PostgreSQL community articles (unlimited)
- **Client-Side Search:** Searches both KB + DB articles; works efficiently to ~2000 articles
- **Locale Routing:** All routes require locale prefix (e.g., `/en/topics`, `/vi/topics`)
- **Build Frequency:** File-based articles need rebuild; database articles update dynamically
- **Browser Compatibility:** Modern browsers with ES2020+ support
- **Email Service:** Requires SMTP for email verification (nodemailer)
- **Database:** PostgreSQL required for community publishing feature
- **Authentication:** Session-based with 7-day expiry, 1-day refresh, 5-min cookie cache

## Unique Value Propositions

1. **Hybrid Content Model:** File-based KB + database community articles + admin-managed blog posts
2. **Bilingual by Default:** Native support for English/Vietnamese with automatic translation mapping
3. **Community-Driven:** Users can contribute articles with moderation workflow and admin review
4. **Admin Blog Management:** Complete blog CRUD system with markdown import and mood-based organization
5. **Developer-Friendly:** TypeScript + clear patterns; comprehensive documentation and code standards
6. **Production-Ready:** Authentication, authorization, XSS protection, and email verification included
7. **Full WYSIWYG Editing:** TipTap editor with image upload for rich article authoring

## Primary Use Cases

1. **Personal Knowledge Base:** Individual developers maintaining personal documentation
2. **Team Reference:** Small teams sharing technical knowledge internally
3. **Learning Resource:** Educational institutions creating technical curriculum
4. **API Documentation:** Technical documentation for libraries and frameworks

## Future Roadmap

### Phase 2 (Q2-Q3 2026)
- Add authentication for private/team knowledge bases
- Implement user profiles and contribution tracking
- Add comment/discussion features on articles
- Create content editing UI (vs. git-based)

### Phase 3 (Q4 2026+)
- Full-text search backend (Elasticsearch/Meilisearch)
- Advanced filtering and faceted search
- Content versioning and history tracking
- Analytics and usage tracking
- Social features (sharing, recommendations)

## Maintenance & Support

- **Code Maintenance:** Quarterly dependency updates and security patches
- **Content Management:** Continuous addition of articles and knowledge updates
- **Community:** Open to contributions via git pull requests
- **Documentation:** Comprehensive developer guides and API documentation

## Contact & Governance

- **Repository:** GitHub (check project repository for link)
- **License:** Check LICENSE file in repository
- **Contributors:** Open source community contributions welcome
- **Issues:** Use GitHub Issues for bug reports and feature requests
