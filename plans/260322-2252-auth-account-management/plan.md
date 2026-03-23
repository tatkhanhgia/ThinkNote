---
title: "Authentication & Account Management"
description: "Add Better Auth, Prisma/PostgreSQL, email verification, user profiles, and admin panel to ThinkNote"
status: pending
priority: P1
effort: 12h
branch: kai/feat/auth-account-management
tags: [auth, better-auth, prisma, postgresql, admin, email-verification]
created: 2026-03-22
---

# Authentication & Account Management

## Overview

Add authentication (Better Auth), database (Prisma + PostgreSQL via Docker), email verification (Gmail SMTP/Nodemailer), user profiles, and admin panel to ThinkNote Next.js 14 knowledge base.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Better Auth | Plugin ecosystem; successor of Auth.js + Lucia |
| ORM | Prisma | Best DX; CLI auto-generates Better Auth schema |
| Database | PostgreSQL (Docker) | Production-grade; Docker for easy setup |
| Email | Gmail SMTP + Nodemailer | Free; user has Gmail App Password ready |
| Sessions | Database | Admin session revocation; Better Auth default |

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Docker + PostgreSQL + Prisma | pending | 1h | [phase-01](phase-01-docker-postgres-prisma.md) |
| 2 | Better Auth Core Setup | pending | 1.5h | [phase-02](phase-02-better-auth-core.md) |
| 3 | Middleware Composition | pending | 1.5h | [phase-03](phase-03-middleware-composition.md) |
| 4 | Auth Pages (Login/Register/Verify) | pending | 2h | [phase-04](phase-04-auth-pages.md) |
| 5 | Email Verification (Gmail SMTP) | pending | 1h | [phase-05](phase-05-email-verification-gmail-smtp.md) |
| 6 | User Profile Page | pending | 1.5h | [phase-06](phase-06-user-profile.md) |
| 7 | Admin Panel | pending | 2h | [phase-07](phase-07-admin-panel.md) |
| 8 | Header Integration | pending | 0.5h | [phase-08](phase-08-header-integration.md) |
| 9 | Route Protection | pending | 1h | [phase-09](phase-09-route-protection.md) |

## Dependencies

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4
                  \-> Phase 5
Phase 4 + 5 -> Phase 6
Phase 2 -> Phase 7
Phase 2 -> Phase 8
Phase 3 -> Phase 9
```

## New Dependencies

- `better-auth` - Auth framework
- `@prisma/client` + `prisma` (dev) - ORM
- `nodemailer` + `@types/nodemailer` (dev) - Email via Gmail SMTP

## Files Modified (existing)

- `src/middleware.ts` - Compose next-intl + auth
- `src/messages/en.json` / `vi.json` - Auth i18n strings
- `src/components/ui/HeaderNav.tsx` - Add auth button
- `src/app/[locale]/layout.tsx` - Wrap with session provider

## Success Criteria

- [ ] Register with email/password, email verification required
- [ ] Login/logout, session persists across refreshes
- [ ] Profile page: edit name, avatar URL
- [ ] Admin: view/ban/unban users, change roles
- [ ] Protected routes redirect unauthenticated users
- [ ] Existing public pages unaffected
- [ ] i18n works on all new pages
- [ ] No secrets in git
