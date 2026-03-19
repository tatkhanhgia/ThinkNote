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
| **Full-Text Search** | Fast, client-side search across all articles (title, description, tags, categories) |
| **Category Organization** | 14+ categories with bilingual support and automatic slug generation |
| **Tag System** | 86+ tags for fine-grained article classification |
| **Markdown Content** | Support for GitHub Flavored Markdown, code blocks, tables, and Mermaid diagrams |
| **Responsive Design** | Mobile-first design with glass-morphism effects and gradient styling |
| **Content Metadata** | YAML frontmatter for rich metadata (date, tags, categories, gradients) |
| **Article Browsing** | Browse by category, tags, or view all articles in one place |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.2.4 (App Router, SSR) |
| **Language** | TypeScript | 5.x (strict mode) |
| **Styling** | Tailwind CSS | 3.4.4 with PostCSS |
| **Internationalization** | next-intl | 4.3.4 |
| **Markdown Processing** | remark, remark-gfm, gray-matter | 15.0.1, 4.0.3 |
| **Security** | isomorphic-dompurify | 2.32.0 |
| **Diagrams** | Mermaid | 11.9.0 |
| **Testing** | vitest, @testing-library/react | 4.0.8, 16 |
| **Linting** | ESLint | 8.x |

## Current Status

**Phase:** Active Development (Phase 1 - ~75% Complete)

- **Content:** 50+ knowledge articles (12+ English, 12+ Vietnamese translations)
- **Categories:** 14 active categories with bilingual translations
- **Tags:** 86+ tags for content classification
- **Architecture:** Fully functional with SSR, markdown import, sanitization, undo system
- **Testing:** 37 test files with vitest covering unit, integration, security, i18n, error handling
- **Features:** Search, import, notifications, accessibility helpers
- **Deployment:** Ready for production (Vercel recommended)

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

- **Content Security:** All user-uploaded markdown sanitized via isomorphic-dompurify (XSS prevention)
- **File Upload Limit:** 10MB max, base64 encoding, MIME validation
- **Client-Side Search:** No backend index; scales to ~1000 articles
- **File-Based Content:** Markdown files + YAML frontmatter (git-friendly, scalable to ~1000 articles)
- **Locale Routing:** All routes require locale prefix (e.g., `/en/topics`, `/vi/topics`)
- **Build Frequency:** Static content requires rebuild for new articles (or API import)
- **Browser Compatibility:** Modern browsers with ES2020+ support
- **Import API:** Non-git users can import markdown via UI

## Unique Value Propositions

1. **Zero Database:** File-system based content management with git-friendly markdown
2. **Bilingual by Default:** Native support for multiple languages with automatic translation mapping
3. **Developer-Friendly:** Written in TypeScript with clear patterns for contributors
4. **Lightweight:** No backend required; can run as static site with minimal resources
5. **Open Architecture:** Modular components and clear data flow for easy customization

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
