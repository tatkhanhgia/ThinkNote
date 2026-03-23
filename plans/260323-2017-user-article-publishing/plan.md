---
title: "User Article Publishing"
description: "Community article publishing with TipTap editor, moderation workflow, and KB integration"
status: completed
priority: P1
effort: 18h
branch: master
tags: [articles, tiptap, moderation, prisma, community]
created: 2026-03-23
completed: 2026-03-23
---

# User Article Publishing

Enable authenticated users to write/publish articles via TipTap WYSIWYG editor with Draft->Pending->Published moderation workflow. Community articles merge into existing knowledge base with "Community" badge.

## Architecture Summary

- **Storage**: PostgreSQL `Article` model via Prisma (status enum: DRAFT/PENDING/PUBLISHED/REJECTED)
- **Editor**: TipTap rich text with image upload, auto-save drafts
- **Auth**: User owns CRUD on own articles; Admin approves/rejects all
- **Integration**: Merge DB articles into existing file-based `getSortedPostsData()` + search + categories/tags
- **Sanitization**: isomorphic-dompurify server-side before DB save
- **Images**: Local storage at `public/uploads/articles/{year}/{month}/`

## Phases

| # | Phase | Status | Effort | Blocked By |
|---|-------|--------|--------|------------|
| 1 | [Database Schema & Migration](./phase-01-database-schema.md) | completed ✅ | 1.5h | - |
| 2 | [Article API Routes](./phase-02-article-api-routes.md) | completed ✅ | 4h | Phase 1 |
| 3 | [Image Upload API](./phase-03-image-upload-api.md) | completed ✅ | 2h | Phase 1 |
| 4 | [TipTap Editor & Article Pages](./phase-04-editor-article-pages.md) | completed ✅ | 5h | Phase 2, 3 |
| 5 | [User Dashboard & Admin Moderation](./phase-05-dashboard-moderation.md) | completed ✅ | 3h | Phase 2 |
| 6 | [Integration & Polish](./phase-06-integration-polish.md) | completed ✅ | 2.5h | Phase 4, 5 |

## Key Dependencies

- Prisma + PostgreSQL (already configured)
- Better Auth with admin plugin (already configured)
- TipTap packages (to install)
- isomorphic-dompurify (to install)

## Risks

- TipTap bundle size (~150KB gzipped) - mitigate with dynamic import
- HTML sanitization edge cases - comprehensive DOMPurify config needed
- File-based + DB merge performance - cache DB queries, limit to published only
