# Phase 5: User Dashboard & Admin Moderation

## Context Links
- [Admin Panel Page](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/admin/page.tsx)
- [Admin User Table](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/admin-user-table.tsx)
- [Auth Button (user menu)](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/auth-button.tsx)
- [i18n en.json](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/en.json)
- [Plan Overview](./plan.md)

## Overview
- **Priority**: P1
- **Status**: completed
- **Effort**: 3h
- **Depends on**: Phase 2 (API routes)
- User "My Articles" dashboard + Admin article moderation panel

## Key Insights
- Follow existing admin panel pattern (layout.tsx with sidebar nav, nested pages)
- User dashboard at `/[locale]/articles/my` — not under `/admin/`
- Admin moderation at `/[locale]/admin/articles` — extends existing admin layout
- Status badges: DRAFT (gray), PENDING (amber), PUBLISHED (green), REJECTED (red)
- Reuse existing Tailwind patterns from admin-user-table.tsx

## Requirements

### Functional

**User Dashboard (`/[locale]/articles/my`)**
- List all own articles with status badge
- Filter tabs: All | Draft | Pending | Published | Rejected
- Each row: title, status badge, date, action buttons
- Actions per status:
  - DRAFT: Edit, Delete, Submit for Review
  - PENDING: View (read-only, awaiting review)
  - PUBLISHED: View (link to published article)
  - REJECTED: Edit (see review note), Delete, Resubmit
- Show admin review note for REJECTED articles
- "Write New Article" button -> /articles/create
- Pagination (20 per page)

**Admin Moderation (`/[locale]/admin/articles`)**
- List articles filtered by status (default: PENDING)
- Filter tabs: Pending | Published | Rejected | All
- Each row: title, author name, locale, date, actions
- Actions:
  - PENDING: Preview, Approve, Reject (with optional reason dialog)
  - PUBLISHED: View, Unpublish (set back to DRAFT)
  - REJECTED: View, Re-review
- Preview opens article content in modal or new tab
- Reject dialog: textarea for reason, confirm/cancel buttons
- Article count stats at top (pending count, published count, total)

### Non-Functional
- Server-side auth check on both pages
- Responsive table/card layout

## Architecture

```
User Dashboard:
  /[locale]/articles/my/page.tsx (server: auth check)
  -> MyArticlesClient.tsx (client: fetch, filter, actions)

Admin Moderation:
  /[locale]/admin/articles/page.tsx (server: admin check)
  -> AdminArticlesClient.tsx (client: fetch, review actions)
  -> ArticleRejectDialog.tsx (client: reject reason modal)
```

## Related Code Files

### Files to Create
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/articles/my/page.tsx` - My Articles server page
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/my-articles-client.tsx` - User dashboard client
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/admin/articles/page.tsx` - Admin moderation server page
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/admin-articles-client.tsx` - Admin moderation client
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/article-reject-dialog.tsx` - Reject reason modal
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/article-status-badge.tsx` - Reusable status badge

### Files to Modify
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/admin/layout.tsx` - Add "Articles" nav link (if layout exists)
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/en.json` - i18n strings
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/vi.json` - i18n strings

## Implementation Steps

### Step 1: Create article-status-badge.tsx
Shared component for consistent status display:
```typescript
const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};
```

### Step 2: Create My Articles page
Server component at `/articles/my/page.tsx`:
- `requireAuth()` -> redirect to login if not authenticated
- Pass session user info to client component
- Get translations

Client component `my-articles-client.tsx`:
- Fetch GET /api/articles?authorId={userId} on mount
- Tab filter by status
- Article list with actions (conditional on status)
- Delete with confirmation dialog
- Submit for review calls POST /api/articles/[id]/submit
- Show review note for REJECTED articles as alert/info box

### Step 3: Create Admin Articles page
Server component at `/admin/articles/page.tsx`:
- `requireAdmin()` -> redirect/403 if not admin
- Pass to client component

Client component `admin-articles-client.tsx`:
- Fetch GET /api/articles?status=PENDING (default tab)
- Tab filter: Pending | Published | Rejected | All
- Stats bar: "X pending review", "Y published", "Z total"
- Each article row: title, author, locale badge, date, action buttons
- Approve: POST /api/articles/[id]/review { action: 'approve' } -> refresh list
- Reject: open dialog -> POST /api/articles/[id]/review { action: 'reject', note }

### Step 4: Create article-reject-dialog.tsx
Simple modal with:
- Title: "Reject Article: {title}"
- Textarea for rejection reason
- Cancel / Confirm Reject buttons
- Uses existing Tailwind modal pattern (backdrop + centered card)

### Step 5: Update admin layout navigation
Add "Articles" link next to "Users" in admin sidebar/nav:
```typescript
{ href: `/${locale}/admin/articles`, label: t('navigation.articles'), icon: ArticleIcon }
```

### Step 6: Add i18n strings
Add to both en.json and vi.json:
```json
{
  "MyArticles": {
    "title": "My Articles",
    "description": "Manage your articles",
    "writeNew": "Write New Article",
    "tabs": { "all": "All", "draft": "Drafts", "pending": "Pending", "published": "Published", "rejected": "Rejected" },
    "actions": { "edit": "Edit", "delete": "Delete", "submit": "Submit for Review", "view": "View" },
    "reviewNote": "Review Note",
    "empty": "No articles yet. Start writing!",
    "confirmDelete": "Are you sure you want to delete this article?",
    "submitted": "Article submitted for review",
    "deleted": "Article deleted"
  },
  "Admin": {
    "navigation": { "articles": "Articles" },
    "articles": {
      "title": "Article Moderation",
      "tabs": { "pending": "Pending", "published": "Published", "rejected": "Rejected", "all": "All" },
      "stats": { "pendingReview": "Pending Review", "published": "Published", "total": "Total" },
      "actions": { "preview": "Preview", "approve": "Approve", "reject": "Reject" },
      "rejectDialog": { "title": "Reject Article", "reason": "Reason (optional)", "confirm": "Confirm Reject", "cancel": "Cancel" },
      "approved": "Article approved and published",
      "rejected": "Article rejected"
    }
  }
}
```

## Todo List
- [x] Create article-status-badge.tsx
- [x] Create /articles/my/page.tsx (server auth check)
- [x] Create my-articles-client.tsx (list + filter + actions)
- [x] Create /admin/articles/page.tsx (server admin check)
- [x] Create admin-articles-client.tsx (moderation list)
- [x] Create article-reject-dialog.tsx
- [x] Update admin layout navigation
- [x] Add i18n translations (en + vi)
- [x] Test user dashboard CRUD flow
- [x] Test admin approve/reject flow

## Success Criteria
- User sees only own articles, filtered by status tabs
- DRAFT articles have Edit/Delete/Submit actions
- REJECTED articles show review note and allow re-edit + resubmit
- Admin sees pending articles by default, can approve/reject
- Reject dialog captures reason and stores in DB
- Approve sets publishedAt and status to PUBLISHED
- Admin nav shows "Articles" link
- All strings use i18n

## Risk Assessment
- **Low**: Admin layout may not exist yet as separate file — check if nested under `/admin/layout.tsx` or handled by parent layout
- **Mitigation**: If no admin layout, add articles nav directly in admin page or create minimal layout

## Security Considerations
- User dashboard requires auth — server-side redirect
- Admin moderation requires admin role — server-side check
- All state mutations go through auth-guarded API routes
- No direct DB access from client components
- Delete requires confirmation to prevent accidental data loss

## Next Steps
- Phase 6: Integration & Polish (merge community articles into existing KB)
