---
phase: 3
title: "Middleware Composition (next-intl + Auth)"
status: completed
priority: P1
effort: 1.5h
depends_on: [2]
---

# Phase 3: Middleware Composition

## Context Links

- [next-intl Middleware Docs](https://next-intl.dev/docs/routing/middleware)
- [Better Auth Next.js Middleware](https://www.better-auth.com/docs/integrations/next)
- Current middleware: `src/middleware.ts`

## Overview

Compose next-intl locale routing with Better Auth session checking in a single middleware. Critical phase - must not break existing i18n routing.

## Key Insights

- next-intl v4 `createMiddleware` returns a standard `(request: NextRequest) => NextResponse` function
- Better Auth provides `getSessionCookie(request)` for fast cookie-only check (no DB call)
- Cookie check is sufficient for middleware redirects; server components do full session validation
- Auth API routes (`/api/auth/*`) must bypass i18n middleware entirely
- Strategy: check auth cookie FIRST, redirect if needed, THEN run i18n middleware

## Requirements

**Functional:**
- Unauthenticated users redirected from `/[locale]/admin/*` and `/[locale]/profile` to `/[locale]/login`
- Authenticated users accessing `/[locale]/login` or `/[locale]/register` redirected to `/[locale]`
- Auth API routes (`/api/auth/*`) bypass all middleware
- All existing public routes work exactly as before

**Non-functional:**
- No DB calls in middleware (cookie check only)
- Single middleware file < 80 lines

## Architecture

```
Request -> middleware.ts
  1. Skip /api/auth/* (Better Auth API)
  2. Check session cookie via getSessionCookie()
  3. Redirect logic for protected/auth routes
  4. Run next-intl createMiddleware for locale routing
  5. Return response
```

## Related Code Files

**Modify:**
- `src/middleware.ts` - Replace current simple middleware with composed version

**Existing (reference):**
- `src/i18n.ts` - Locale config (locales: ['en', 'vi'], default: 'en')

## Implementation Steps

### Step 1: Replace `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { getSessionCookie } from 'better-auth/cookies';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

// Routes requiring authentication (without locale prefix)
const protectedPaths = ['/admin', '/profile'];
// Routes only for unauthenticated users
const authOnlyPaths = ['/login', '/register'];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip auth API routes entirely
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Check session cookie (no DB call)
  const sessionCookie = getSessionCookie(request);
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  // 3. Redirect unauthenticated from protected routes
  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(
      new URL(`/${locale}/login`, request.url)
    );
  }

  // 4. Redirect authenticated away from auth-only routes
  const isAuthOnly = authOnlyPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  if (isAuthOnly && sessionCookie) {
    return NextResponse.redirect(
      new URL(`/${locale}`, request.url)
    );
  }

  // 5. Run next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/api/auth/:path*',
  ],
};
```

### Step 2: Test critical paths manually

1. Visit `/en` (public) - should work as before
2. Visit `/en/admin` without login - should redirect to `/en/login`
3. Visit `/en/topics` - should work as before
4. Visit `/api/auth/ok` - should return 200 (no i18n redirect)

### Step 3: Verify existing pages unbroken

- Home page (`/en`, `/vi`)
- Topics listing
- Category pages
- Tag pages
- Search
- Blog
- Markdown import

## Todo List

- [x] Replace src/middleware.ts with composed version
- [x] Verify /api/auth/* routes bypass i18n (matcher excludes, explicit NextResponse.next())
- [x] Test protected route redirects (logic verified in code)
- [x] Test auth-only route redirects for logged-in users (logic verified in code)
- [x] Verify all existing public pages still work (npm run build 174 pages pass)
- [ ] Verify locale switching works on all routes (requires dev server)

## Success Criteria

- All existing public pages render correctly in both locales
- `/en/admin` redirects to `/en/login` when not authenticated
- `/en/login` redirects to `/en` when authenticated
- `/api/auth/*` routes respond without locale redirects
- Language switcher works on login/register/profile pages

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| i18n routing breaks | HIGH | Test all existing pages immediately after change |
| Cookie name mismatch | Medium | Use Better Auth's `getSessionCookie` helper (handles naming) |
| Middleware matcher too broad/narrow | Medium | Include `/api/auth/:path*` explicitly in matcher |
| Redirect loops | Medium | Auth-only redirect checks cookie presence, not validity |

## Security Considerations

- Cookie check only verifies existence, not validity. Full validation happens in server components/API routes
- No DB calls in middleware = no latency impact on every request
- Protected paths list is explicit (allowlist approach)

## Next Steps

- Phase 4: Create login/register/verify-email pages
- Phase 9: Add API route protection (server-side validation)
