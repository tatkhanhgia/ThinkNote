# Community Article Publishing System

## Overview

ThinkNote includes a full-featured article publishing system that enables authenticated users to create, review, and publish community-contributed articles. The system manages the complete lifecycle from draft creation through admin review to publication.

**Key Features:**
- TipTap WYSIWYG editor with image upload
- Draft management with auto-save
- Editorial workflow (DRAFT → PENDING → PUBLISHED/REJECTED)
- Admin review dashboard
- User article management
- Integration with existing knowledge base

## Architecture

### Data Model

**Article** (PostgreSQL via Prisma)
```typescript
model Article {
  id           String        @id @default(cuid())
  title        String
  slug         String        (URL-safe, auto-generated)
  description  String        (excerpt for listings)
  content      String        (HTML sanitized)
  locale       String        @default("en")
  status       ArticleStatus (DRAFT|PENDING|PUBLISHED|REJECTED)
  categories   String[]      (shared with KB)
  tags         String[]      (shared with KB)
  gradientFrom String?       (card styling)
  gradientTo   String?       (card styling)
  coverImage   String?       (uploaded image)
  reviewNote   String?       (admin feedback)
  reviewedAt   DateTime?     (review timestamp)
  reviewedBy   String?       (admin user ID)
  publishedAt  DateTime?     (publication timestamp)
  authorId     String        (FK to User)
  author       User
  createdAt    DateTime
  updatedAt    DateTime

  @@unique([slug, locale])
  @@index([status])
  @@index([authorId])
  @@index([locale])
}

enum ArticleStatus {
  DRAFT       // Author editing
  PENDING     // Awaiting admin review
  PUBLISHED   // Live and visible
  REJECTED    // Rejected with feedback
}
```

### API Endpoints

#### Reading Articles
```
GET /api/articles
├─ Query: status, locale, authorId, limit, offset
├─ Auth: Optional (filters based on user role)
└─ Returns: Paginated article list

GET /api/articles/[id]
├─ Auth: Optional (published articles public)
└─ Returns: Article object with author details
```

#### Creating & Editing
```
POST /api/articles
├─ Auth: Required
├─ Body: title, slug, description, content, locale, categories, tags
└─ Returns: New article (status: DRAFT)

PATCH /api/articles/[id]
├─ Auth: Required (author or admin)
├─ Body: Partial article fields
└─ Returns: Updated article

DELETE /api/articles/[id]
├─ Auth: Required (author or admin)
└─ Returns: Confirmation
```

#### Workflow Actions
```
POST /api/articles/[id]/submit
├─ Auth: Required (author)
├─ Returns: Article with status: PENDING

POST /api/articles/[id]/publish
├─ Auth: Required (admin)
├─ Returns: Article with status: PUBLISHED, publishedAt: now()

POST /api/articles/[id]/reject
├─ Auth: Required (admin)
├─ Body: { reason: string }
└─ Returns: Article with status: REJECTED, reviewNote
```

#### Image Upload
```
POST /api/upload
├─ Auth: Required
├─ Body: FormData with image file
├─ Validation: Magic bytes check, 5MB limit
├─ Formats: PNG, JPG, WebP
└─ Returns: { url, filename, size }
```

## Components

### Editor Components

**ArticleEditor**
- TipTap WYSIWYG editor instance
- Toolbar integration (ArticleEditorToolbar)
- Auto-save every 30 seconds
- Image upload (drag-drop, paste, button)
- Draft preservation

**ArticleEditorToolbar**
- Text formatting buttons (bold, italic, underline)
- Heading levels (h1-h6)
- Code blocks and inline code
- Link insertion
- Image upload button
- Undo/redo controls

**ArticleForm**
- Title input with auto-slug generation
- Description textarea
- Locale selector (en/vi)
- Category & tag input (CategoryTagInput)
- Gradient color pickers (from/to)
- Submit/draft buttons

**CategoryTagInput**
- Multi-select dropdown
- Autocomplete from existing options
- Add new tags inline
- Display as badge list
- Shared vocabulary with KB

### Management Components

**ArticleStatusBadge**
- Color-coded status display
- DRAFT: Gray
- PENDING: Yellow/amber
- PUBLISHED: Green
- REJECTED: Red
- Optional metadata display

**ArticleRejectDialog**
- Modal for admin rejection
- Feedback text area
- Confirmation with reason message
- Email notification trigger (future)

**MyArticlesClient**
- User's article dashboard
- List all statuses (DRAFT, PENDING, PUBLISHED, REJECTED)
- Filter by status
- Edit/delete actions
- Status indicators
- "New article" button

**AdminArticlesClient**
- Admin review dashboard
- Pending articles list
- Article preview with content
- Publish/reject actions
- Bulk operations (future)
- Review notes display

## Pages

### User-Facing Pages

**`/articles/create`**
- Create new article page
- Auth: Required (redirect to login)
- Components: ArticleEditor, ArticleForm
- Workflow: Save as DRAFT, submit for review

**`/articles/[slug]/edit`**
- Edit existing article
- Auth: Required (author or admin only)
- Auto-load article data
- Components: ArticleEditor, ArticleForm
- Workflow: Update DRAFT or REJECTED articles

**`/articles/my`**
- User's article dashboard
- Auth: Required
- Component: MyArticlesClient
- Features: Filter, edit, delete own articles

**`/articles/[slug]`**
- Public article detail page
- Auth: Optional
- Visibility: Published articles public, others restricted
- Components: ArticleDetail with author info, metadata
- Features: Reading time, categories, tags, author profile

### Admin Pages

**`/admin/articles`**
- Admin review dashboard
- Auth: Required (admin only)
- Component: AdminArticlesClient
- Features: Preview, publish, reject articles

## Integration with Knowledge Base

### Content Display
- Community articles merged with file-based KB articles in listings
- KnowledgeCard shows "Community" badge for user-published articles
- Unified search results (KB + community)
- Shared category/tag system
- Same styling and layout as KB articles

### Search Integration
- Published articles included in full-text search
- SearchBar component queries both sources
- Results show source (KB or Community)

### Navigation
- Community articles appear in:
  - Topics/articles page
  - Category listings
  - Tag pages
  - Search results
- Separate `/articles` namespace for community focus

## Security

### Content Sanitization
- DOMPurify sanitization on save
- HTML sanitization on render
- XSS prevention for user content
- Script tag removal
- Event handler removal

### Image Upload Security
- Magic bytes validation (file type verification)
- Size limit enforcement (5MB)
- Filename sanitization
- Storage outside web root (future)

### Authentication & Authorization
- Auth required for article creation
- Auth required for article updates/deletes
- Ownership verification (authors can only edit own articles)
- Admin-only publish/reject operations
- Session validation on protected routes

### Data Validation
- Title and slug required
- Slug uniqueness per locale
- Locale validation
- Category/tag format validation
- HTML content validation

## Features

### Draft Management
- Auto-save every 30 seconds
- Draft preserved on page reload
- Draft indicator in MyArticles
- Ability to continue editing or discard

### Slug Generation
- Auto-generated from title
- URL-safe encoding
- Collision detection
- Manual override allowed
- (slug, locale) uniqueness enforced

### Editorial Workflow
**Draft Stage**
- Author creates article
- Auto-saves in DRAFT status
- Only author can view/edit
- Can delete or submit for review

**Pending Stage**
- Author submits for review
- Status changes to PENDING
- Hidden from public view
- Admin can publish or reject

**Published Stage**
- Admin approves article
- Status changes to PUBLISHED
- Visible in all community features
- Author can still edit
- Author can retract to draft

**Rejected Stage**
- Admin rejects with feedback
- Status changes to REJECTED
- Hidden from public
- Author sees rejection reason
- Author can revise and resubmit

### Bilingual Support
- Article per locale
- Shared slug (slug + locale unique)
- Categories/tags shared across locales
- Author creates in preferred locale
- No automatic translation

## Performance Considerations

### Database Queries
- Indexed on status, authorId, locale
- Pagination for article lists
- Author relationship pre-loaded
- Content not loaded in list views

### Image Handling
- Client-side preview before upload
- Magic bytes validation on server
- Storage URL returned to client
- Lazy loading in article list

### Search Integration
- Published articles only in search index
- Indexed alongside KB articles
- Full-text search remains client-side for <2000 articles
- Backend search planned for Phase 2

## Future Enhancements

- Comment system on articles
- Version history and edit tracking
- Collaborative editing
- Article publishing analytics
- Author reputation system
- Featured articles algorithm
- Email notifications for reviews
- Auto-publish based on author karma
- Article recommendations
- Community voting/rating system

---

For integration with existing features, see `/docs/system-architecture.md` API Endpoints section.
