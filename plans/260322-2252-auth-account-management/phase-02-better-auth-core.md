---
phase: 2
title: "Better Auth Core Setup"
status: completed
priority: P1
effort: 1.5h
depends_on: [1]
---

# Phase 2: Better Auth Core Setup

## Context Links

- [Better Auth Installation](https://www.better-auth.com/docs/installation)
- [Better Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Better Auth Prisma Adapter](https://www.better-auth.com/docs/concepts/database)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)

## Overview

Install Better Auth, configure server auth instance with Prisma adapter, set up client auth, create API catch-all route handler. Enable email/password + admin + email verification plugins.

## Key Insights

- Better Auth uses a catch-all API route `/api/auth/[...all]/route.ts`
- Prisma adapter: `prismaAdapter(prisma, { provider: "postgresql" })`
- Admin plugin adds role, banned, banReason, banExpires fields to User
- `nextCookies()` plugin needed for cookie handling in Server Actions
- Email verification config lives in `emailVerification` top-level key (not a plugin)
- Session cookie caching reduces DB queries in middleware

## Requirements

**Functional:**
- Better Auth server instance with Prisma adapter
- Email/password auth enabled with email verification required
- Admin plugin for user management
- Client auth instance for React components
- API route handler at `/api/auth/[...all]`

**Non-functional:**
- Server config < 100 lines
- Client config < 30 lines
- Type-safe throughout

## Architecture

```
src/lib/auth.ts          <- Server auth config (Prisma + plugins)
src/lib/auth-client.ts   <- Client auth (React hooks + admin client)
src/app/api/auth/[...all]/route.ts <- API handler
```

## Related Code Files

**Create:**
- `src/lib/auth.ts` - Server auth configuration
- `src/lib/auth-client.ts` - Client auth configuration
- `src/app/api/auth/[...all]/route.ts` - API route handler

**Existing (read-only reference):**
- `src/lib/prisma.ts` - Prisma client singleton (Phase 1)

## Implementation Steps

### Step 1: Install Better Auth

```bash
npm install better-auth
```

### Step 2: Create server auth config `src/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // autoSignIn false = user must verify email before first login
    autoSignIn: false,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Implemented in Phase 5 - Gmail SMTP via Nodemailer
      console.log(`[DEV] Verify email for ${user.email}: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min cache - reduces DB calls in middleware
    },
  },

  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
    nextCookies(),
  ],
});

// Export auth types for use in components
export type Session = typeof auth.$Infer.Session;
```

### Step 3: Create client auth config `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

// Export typed hooks
export const {
  useSession,
  signIn,
  signUp,
  signOut,
  getSession,
} = authClient;
```

### Step 4: Create API route `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

### Step 5: Verify schema compatibility

```bash
npx @better-auth/cli generate
```

Compare output with `prisma/schema.prisma` from Phase 1. If differences, update schema and run `npx prisma db push`.

### Step 6: Verify build compiles

```bash
npm run build
```

Fix any TypeScript errors.

## Todo List

- [x] Install better-auth
- [x] Create src/lib/auth.ts with Prisma adapter + plugins
- [x] Create src/lib/auth-client.ts with admin client plugin
- [x] Create API route handler at src/app/api/auth/[...all]/route.ts
- [ ] Run Better Auth CLI to verify schema (requires DB running)
- [x] Verify build compiles

## Success Criteria

- `npm run build` passes
- `GET /api/auth/ok` returns 200 (Better Auth health check)
- Better Auth CLI shows no schema mismatches
- TypeScript types resolve for Session, User

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Better Auth version breaking changes | Low | Pin exact version in package.json |
| Prisma schema drift from Better Auth | Medium | Use CLI generate to sync |
| Cookie caching stale sessions | Low | 5min cache is acceptable for personal project |

## Security Considerations

- `BETTER_AUTH_SECRET` must be random 32+ bytes
- `requireEmailVerification: true` prevents unverified logins
- `nextCookies()` plugin ensures proper HttpOnly/Secure cookie handling
- scrypt password hashing (Better Auth default)
- `autoSignIn: false` on signup prevents pre-verification access

## Next Steps

- Phase 3: Compose middleware (next-intl + Better Auth)
- Phase 5: Replace console.log email with Gmail SMTP
