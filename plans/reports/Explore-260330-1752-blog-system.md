# Blog System Architecture Exploration

**Report Date:** 2026-03-30 | **Project:** my-knowledge-base (Next.js)

## SYSTEMS IDENTIFIED

### System 1: File-Based Blog
- Location: src/data/blog/{locale}/*.md
- Language: Markdown with YAML frontmatter
- Key Fields: title, description, date, mood, tags, coverImage
- Library: src/lib/blog-posts.ts (110 lines)
- Utilities: getSortedBlogPosts, getBlogPostData, getAllBlogMoods, calculateReadingTime
- Moods: 8 predefined moods (reflective, joyful, thoughtful, nostalgic, grateful, inspired, melancholic, excited)

### System 2: Database Articles
- Database: PostgreSQL via Prisma
- Schema: Article model with status (DRAFT, PENDING, PUBLISHED, REJECTED)
- Fields: title, slug, description, content (HTML), locale, categories, tags, gradientFrom/To, coverImage
- Relationships: Article -> User (author)
- Workflow: Author creates DRAFT -> submits (PENDING) -> Admin reviews -> PUBLISHED or REJECTED

## PAGES & ROUTES

### Blog Pages
- src/app/[locale]/blog/page.tsx (72 lines) - Blog listing
- src/app/[locale]/blog/BlogListClient.tsx (80 lines) - Client component with mood filter
- src/app/[locale]/blog/[slug]/page.tsx (120 lines) - Blog post detail

### Article Pages
- src/app/[locale]/articles/create/page.tsx - Create article
- src/app/[locale]/articles/[slug]/page.tsx - View article
- src/app/[locale]/articles/[slug]/edit/page.tsx - Edit article
- src/app/[locale]/articles/my/page.tsx - User's articles

### Admin Pages
- src/app/[locale]/admin/page.tsx (53 lines) - Admin dashboard
- src/app/[locale]/admin/articles/page.tsx (20 lines) - Article moderation

### Import Page
- src/app/[locale]/markdown-import/page.tsx (798 lines) - Markdown file import UI

## API ROUTES

### Article CRUD
- POST /api/articles (143 lines) - Create article
- PUT /api/articles/{id} (151 lines) - Update article
- DELETE /api/articles/{id} - Delete article
- GET /api/articles - List articles with filters

### Article Workflow
- POST /api/articles/{id}/submit (41 lines) - Submit for review
- POST /api/articles/{id}/review - Admin approve/reject

### Markdown Import
- POST /api/markdown/import - Import markdown file
- POST /api/markdown/undo - Undo import

## CORE COMPONENTS

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| BlogCard | BlogCard.tsx | 74 | Blog post preview card |
| MoodFilter | MoodFilter.tsx | 56 | Mood-based filtering |
| PostContent | PostContent.tsx | 151 | Render HTML + Mermaid diagrams |
| ArticleEditor | article-editor.tsx | 119 | Tiptap WYSIWYG editor |
| ArticleForm | article-form.tsx | 120+ | Full article creation form with auto-save |
| AdminArticlesClient | admin-articles-client.tsx | 80+ | Article moderation panel |

## LIBRARIES & TOOLS

### Markdown Processing
- gray-matter: YAML frontmatter extraction
- remark: Markdown parser
- remark-gfm: GitHub flavored markdown
- remark-html: Convert to HTML
- Tiptap: WYSIWYG editor

### Security
- isomorphic-dompurify: HTML sanitization
- ContentSanitizer: Custom security scanning

### Utilities
- MarkdownProcessor: Convert & process markdown (258 lines)
- MarkdownFormatter: Normalize markdown (298 lines)
- MarkdownTranslator: Translate en ↔ vi (143 lines)
- FileValidator: Validate filenames (218 lines)

## KEY FINDINGS

1. **Dual System:** Blog posts and articles are completely separate systems
   - Blog: File-based, simple, no moderation
   - Articles: Database-backed, with review workflow

2. **Mood System:** Only for file-based blog, not articles

3. **Image Handling:** ArticleEditor uploads to external service via /api/upload

4. **Auto-Save:** ArticleForm saves every 30 seconds

5. **Permissions:**
   - Authors can edit own DRAFT/REJECTED articles
   - Admins can edit any article status
   - Only admins can import markdown files

6. **Markdown Processing:**
   - Auto-format: Normalize line endings, indentation, heading levels
   - Auto-translate: Supports en ↔ vi
   - Security scanning: Detects XSS/malicious patterns
   - Chunked processing: For large files (>250KB)

## UNRESOLVED QUESTIONS

1. Published articles display location? (No public listing found)
2. External upload service? (S3, Vercel Blob, custom?)
3. Articles support mood field?
4. Translation service? (API or hardcoded?)
5. Article search/filter functionality?
6. Edit history / version tracking?
7. View counts / analytics?
8. Can articles change locale?


