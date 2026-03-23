# Planner Report: Auth & Account Management

**Date:** 2026-03-22
**Plan:** `plans/260322-2252-auth-account-management/`
**Status:** Complete - 9 phases, ready for implementation

---

## Summary

Created comprehensive implementation plan for adding authentication and account management to ThinkNote. Plan covers 9 phases (~12h total effort) using Better Auth + Prisma + PostgreSQL (Docker) + Gmail SMTP/Nodemailer.

## Research Conducted

- **Better Auth docs:** Installation, Next.js integration, email/password auth, admin plugin, session management, database schema
- **next-intl middleware composition:** Verified pattern for composing with auth middleware
- **Existing codebase:** middleware.ts, layout.tsx, HeaderNav.tsx, API routes, i18n config, package.json

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Gmail SMTP + Nodemailer over Resend | User specified Gmail App Password; simpler setup, no external service signup |
| Cookie-only check in middleware | No DB calls per request; full validation in server components/API routes |
| `autoSignIn: false` on signup | Forces email verification before first login |
| Reusable `auth-guard.ts` utility | DRY pattern for API route protection |
| AuthButton as client component | Uses `useSession()` hook; skeleton placeholder prevents layout shift |
| Server-side role check in admin layout | Defense in depth; middleware is cookie-only |

## Files Created

```
plans/260322-2252-auth-account-management/
  plan.md                                    <- Overview (links to phases)
  phase-01-docker-postgres-prisma.md         <- Docker + DB + Prisma
  phase-02-better-auth-core.md               <- Auth server/client + API route
  phase-03-middleware-composition.md          <- next-intl + auth middleware
  phase-04-auth-pages.md                     <- Login, register, verify email UI
  phase-05-email-verification-gmail-smtp.md  <- Nodemailer + Gmail SMTP
  phase-06-user-profile.md                   <- Profile page + password change
  phase-07-admin-panel.md                    <- Admin dashboard + user management
  phase-08-header-integration.md             <- Auth button in header
  phase-09-route-protection.md               <- API route auth guards
```

## New Dependencies (3 packages)

- `better-auth` - Auth framework
- `@prisma/client` + `prisma` (dev) - ORM
- `nodemailer` + `@types/nodemailer` (dev) - Email

## New Files to Create (implementation)

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL container |
| `prisma/schema.prisma` | DB schema (User, Session, Account, Verification) |
| `.env.local` | Secrets (DB URL, auth secret, SMTP creds) |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Better Auth server config |
| `src/lib/auth-client.ts` | Better Auth client config |
| `src/lib/email.ts` | Nodemailer transporter + email template |
| `src/lib/auth-guard.ts` | Server-side auth utilities |
| `src/app/api/auth/[...all]/route.ts` | Auth API handler |
| `src/app/[locale]/login/page.tsx` | Login page |
| `src/app/[locale]/register/page.tsx` | Register page |
| `src/app/[locale]/verify-email/page.tsx` | Email verification page |
| `src/app/[locale]/profile/page.tsx` | User profile page |
| `src/app/[locale]/admin/layout.tsx` | Admin layout (role guard) |
| `src/app/[locale]/admin/page.tsx` | Admin dashboard |
| `src/app/[locale]/admin/users/page.tsx` | User management |
| `src/components/ui/AuthFormCard.tsx` | Shared auth form wrapper |
| `src/components/ui/AuthButton.tsx` | Header auth button/avatar |
| `src/components/ui/ProfileForm.tsx` | Profile edit form |
| `src/components/ui/ChangePasswordForm.tsx` | Password change form |
| `src/components/ui/AdminUserTable.tsx` | Admin user table |

## Existing Files Modified (4 total)

- `src/middleware.ts` - Compose next-intl + auth
- `src/app/[locale]/layout.tsx` - Add AuthButton
- `src/messages/en.json` - Auth/Profile/Admin i18n strings
- `src/messages/vi.json` - Vietnamese translations
- `src/app/api/markdown/import/route.ts` - Add requireAuth()
- `src/app/api/markdown/undo/route.ts` - Add requireAuth()

## Unresolved Questions

1. **Better Auth CLI schema generation**: Should implementor run `npx @better-auth/cli generate` to verify Prisma schema matches exactly, or trust the manually defined schema from docs?
2. **Email verification callback URL**: Better Auth auto-generates the verification URL. Need to verify it works correctly with the `[locale]` prefix in the callback.
3. **next-intl v4 + Better Auth cookie**: The `getSessionCookie()` import from `better-auth/cookies` needs verification that it correctly reads the cookie name Better Auth uses by default.
4. **Admin plugin `customSyntheticUser`**: With `requireEmailVerification` + admin plugin, may need to add `customSyntheticUser` config to prevent email enumeration (documented in Better Auth admin docs). Should verify during Phase 2.
