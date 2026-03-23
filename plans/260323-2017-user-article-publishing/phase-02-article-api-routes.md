# Phase 2: Article API Routes

## Context Links
- [Auth Guard Utils](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/auth-guard.ts)
- [Prisma Client](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/prisma.ts)
- [Slugify Util](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/slugify.ts)
- [Import Route Pattern](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/markdown/import/route.ts)
- [Plan Overview](./plan.md)

## Overview
- **Priority**: P1
- **Status**: completed
- **Effort**: 4h
- **Depends on**: Phase 1 (database schema)
- Full CRUD + moderation API for articles with auth guards and DOMPurify sanitization

## Key Insights
- Follow existing API pattern from `/api/markdown/import/route.ts`: `requireAuth()` / `requireAdmin()` guards
- Use `NextResponse.json()` pattern consistently
- Slug generation via existing `slugify()` from `@/lib/slugify`
- Install `isomorphic-dompurify` for HTML sanitization before DB save
- Content stored as sanitized HTML (TipTap outputs HTML)

## Requirements

### Functional
- **Create** (POST /api/articles): Auth required. Create article as DRAFT. Auto-generate slug from title. Sanitize HTML content
- **List** (GET /api/articles): Public for published; auth for own drafts; admin for all. Filter by status, author, category, tag, locale. Pagination
- **Get** (GET /api/articles/[id]): Public for published; author for own; admin for any
- **Update** (PUT /api/articles/[id]): Author only (own articles in DRAFT/REJECTED status). Admin can update any. Resanitize content
- **Delete** (DELETE /api/articles/[id]): Author only (own). Admin can delete any
- **Submit** (POST /api/articles/[id]/submit): Author submits DRAFT->PENDING for review
- **Review** (POST /api/articles/[id]/review): Admin only. Approve (PENDING->PUBLISHED) or Reject (PENDING->REJECTED) with optional note

### Non-Functional
- Rate limiting: max 10 article creates per hour per user (simple in-memory counter)
- Content max length: 100KB
- Pagination: default 20 per page, max 100

## Architecture

```
API Routes Tree:
  /api/articles/
    POST   - Create article (auth)
    GET    - List articles (public/auth)

  /api/articles/[id]/
    GET    - Get single article
    PUT    - Update article (author/admin)
    DELETE - Delete article (author/admin)

  /api/articles/[id]/submit/
    POST   - Submit for review (author)

  /api/articles/[id]/review/
    POST   - Approve/Reject (admin)
```

### Permission Matrix
| Action | User (own) | User (other) | Admin |
|--------|-----------|-------------|-------|
| Create | Yes | - | Yes |
| List drafts | Own only | No | All |
| List published | Yes | Yes | Yes |
| Read draft | Own only | No | Yes |
| Read published | Yes | Yes | Yes |
| Update | DRAFT/REJECTED only | No | Any status |
| Delete | Yes | No | Yes |
| Submit | DRAFT only | No | Yes |
| Review | No | No | Yes |

## Related Code Files

### Files to Create
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/articles/route.ts` - Create + List
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/articles/[id]/route.ts` - Get + Update + Delete
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/articles/[id]/submit/route.ts` - Submit for review
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/articles/[id]/review/route.ts` - Admin review
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/article-sanitizer.ts` - DOMPurify config + sanitize function

### Files to Modify
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/package.json` - Add isomorphic-dompurify

## Implementation Steps

### Step 1: Install DOMPurify
```bash
npm install isomorphic-dompurify
```

### Step 2: Create article-sanitizer.ts
```typescript
// src/lib/article-sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'h1','h2','h3','h4','h5','h6','p','br','hr',
  'ul','ol','li','blockquote','pre','code',
  'strong','em','u','s','a','img',
  'table','thead','tbody','tr','th','td',
  'div','span','figure','figcaption',
];

const ALLOWED_ATTR = [
  'href','src','alt','title','class','id','target','rel',
  'width','height','colspan','rowspan',
];

export function sanitizeArticleHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}
```

### Step 3: Create /api/articles/route.ts (POST + GET)
- POST: requireAuth(), validate body (title required, content optional), generate slug via slugify(title), check slug uniqueness per locale, sanitize content, create article with status DRAFT
- GET: parse query params (status, authorId, category, tag, locale, page, limit). Public = PUBLISHED only. Auth user can add own drafts. Admin can filter any status

### Step 4: Create /api/articles/[id]/route.ts (GET + PUT + DELETE)
- GET: find article by ID. If not PUBLISHED, require author or admin
- PUT: requireAuth(). Author can only update own DRAFT/REJECTED articles. Admin can update any. Re-sanitize content. Regenerate slug if title changed
- DELETE: requireAuth(). Author can delete own. Admin can delete any

### Step 5: Create /api/articles/[id]/submit/route.ts
- POST: requireAuth(). Article must be own and status DRAFT. Set status to PENDING

### Step 6: Create /api/articles/[id]/review/route.ts
- POST: requireAdmin(). Body: { action: 'approve' | 'reject', note?: string }
- approve: set status PUBLISHED, publishedAt = now(), reviewedAt = now(), reviewedBy = admin user ID
- reject: set status REJECTED, reviewNote = note, reviewedAt = now(), reviewedBy = admin user ID

### Step 7: Handle slug collision
- When creating/updating, if slug+locale exists, append `-2`, `-3`, etc.
```typescript
async function generateUniqueSlug(title: string, locale: string, excludeId?: string) {
  let slug = slugify(title);
  let suffix = 0;
  let candidate = slug;
  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug_locale: { slug: candidate, locale } },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix++;
    candidate = `${slug}-${suffix}`;
  }
}
```

## Todo List
- [x] Install isomorphic-dompurify
- [x] Create src/lib/article-sanitizer.ts with DOMPurify config
- [x] Create POST /api/articles (create article as DRAFT)
- [x] Create GET /api/articles (list with filters + pagination)
- [x] Create GET /api/articles/[id] (single article)
- [x] Create PUT /api/articles/[id] (update with re-sanitize)
- [x] Create DELETE /api/articles/[id] (soft permission check)
- [x] Create POST /api/articles/[id]/submit (DRAFT->PENDING)
- [x] Create POST /api/articles/[id]/review (admin approve/reject)
- [x] Test all endpoints with auth/non-auth/admin users

## Success Criteria
- All CRUD operations work with correct auth guards
- Slug auto-generation and collision handling works
- HTML sanitization strips dangerous tags/attributes
- Pagination returns correct results
- Status transitions follow the workflow: DRAFT->PENDING->PUBLISHED|REJECTED
- Rejected articles can be edited and resubmitted

## Risk Assessment
- **Medium**: DOMPurify might strip TipTap-specific classes needed for styling
  - Mitigation: test with TipTap output, add required classes to allowlist
- **Low**: Slug collision loop could be slow for many articles with same title
  - Mitigation: limit to 20 attempts, throw error after

## Security Considerations
- All write operations require authentication
- Admin-only endpoints use `requireAdmin()`
- Content sanitized via DOMPurify before DB storage
- User can only modify own articles (except admin)
- Status transitions enforced server-side (no direct status update via PUT)
- Content length validated (max 100KB)

## Next Steps
- Phase 3: Image Upload API (parallel, also depends on Phase 1)
- Phase 4: TipTap Editor (depends on this + Phase 3)
