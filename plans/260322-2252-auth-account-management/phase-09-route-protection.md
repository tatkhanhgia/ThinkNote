---
phase: 9
title: "Route Protection"
status: completed
priority: P2
effort: 1h
depends_on: [3]
---

# Phase 9: Route Protection

## Context Links

- [Better Auth Session - Server Side](https://www.better-auth.com/docs/concepts/session-management)
- Existing API routes: `src/app/api/markdown/import/route.ts`, `src/app/api/markdown/undo/route.ts`
- Middleware: `src/middleware.ts` (Phase 3)

## Overview

Add server-side auth checks to existing API routes (markdown import/undo) and create a reusable auth guard utility. Middleware handles redirects; this phase adds real session validation for API routes and server components.

## Key Insights

- Middleware cookie check is fast but not secure (cookie exists != valid session)
- API routes need full session validation via `auth.api.getSession()`
- Create a reusable `requireSession()` helper to DRY the pattern
- Existing markdown import/undo API routes should require authentication
- Public pages (topics, categories, tags, search, blog) remain fully public
- Admin API calls go through Better Auth admin plugin (already protected by role)

## Requirements

**Functional:**
- All markdown API routes require authentication
- Unauthenticated API calls return 401
- Reusable auth guard for future API routes
- Admin pages have server-side role check (done in Phase 7)

**Non-functional:**
- Auth guard utility < 30 lines
- Minimal changes to existing API routes (wrap with guard)

## Architecture

```
src/lib/auth-guard.ts    <- Reusable session validation helpers
src/app/api/markdown/... <- Add auth checks to existing routes
```

## Related Code Files

**Create:**
- `src/lib/auth-guard.ts` - Server-side auth utilities

**Modify:**
- `src/app/api/markdown/import/route.ts` - Add auth check to POST
- `src/app/api/markdown/undo/route.ts` - Add auth check to POST

## Implementation Steps

### Step 1: Create auth guard utility `src/lib/auth-guard.ts`

```typescript
import { auth } from './auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Get current session in API routes.
 * Returns session or null.
 */
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Require authentication for API routes.
 * Returns 401 response if not authenticated.
 * Returns session if authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return { session: null, error: NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )};
  }
  return { session, error: null };
}

/**
 * Require admin role for API routes.
 * Returns 403 response if not admin.
 */
export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session!.user.role !== 'admin') {
    return { session: null, error: NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    )};
  }
  return { session, error: null };
}
```

### Step 2: Protect markdown import API `src/app/api/markdown/import/route.ts`

Add auth check at the top of the POST handler. The existing function is long, so add early return:

```typescript
import { requireAuth } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  // Auth check
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  // ... existing code continues unchanged
}
```

The GET handler (returns config info) can stay public.

### Step 3: Protect markdown undo API `src/app/api/markdown/undo/route.ts`

Same pattern:

```typescript
import { requireAuth } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  // ... existing code continues unchanged
}
```

### Step 4: Update ImportMarkdownButton to handle 401

In `src/components/ui/ImportMarkdownButton.tsx` (or wherever the import API is called), handle 401 response:

If the API returns 401, show a message directing user to log in. This is optional - the middleware already redirects, but API calls from authenticated pages should handle this gracefully.

### Step 5: Summary of protected vs public routes

| Route | Protection | Method |
|-------|-----------|--------|
| `/[locale]` (home) | Public | None |
| `/[locale]/topics/*` | Public | None |
| `/[locale]/categories/*` | Public | None |
| `/[locale]/tags/*` | Public | None |
| `/[locale]/search` | Public | None |
| `/[locale]/blog/*` | Public | None |
| `/[locale]/login` | Auth-only (redirect if logged in) | Middleware |
| `/[locale]/register` | Auth-only (redirect if logged in) | Middleware |
| `/[locale]/profile` | Protected | Middleware + server page check |
| `/[locale]/admin/*` | Protected + Admin role | Middleware + server layout check |
| `/api/auth/*` | Better Auth managed | Better Auth |
| `/api/markdown/import` POST | Protected | `requireAuth()` |
| `/api/markdown/undo` POST | Protected | `requireAuth()` |
| `/api/markdown/import` GET | Public | None (config info) |

## Todo List

- [x] Create src/lib/auth-guard.ts with requireAuth + requireAdmin
- [x] Add auth check to markdown import POST route
- [x] Add auth check to markdown undo DELETE route (route uses DELETE, not POST)
- [ ] Test API returns 401 when not authenticated
- [ ] Test API works normally when authenticated
- [ ] Verify all public pages still work without auth
- [ ] Test admin API routes require admin role
- [ ] End-to-end: register -> verify -> login -> import markdown -> logout

## Success Criteria

- `POST /api/markdown/import` returns 401 without session cookie
- `POST /api/markdown/import` works with valid session
- `POST /api/markdown/undo` returns 401 without session
- All public pages load without authentication
- Admin pages return 403 for non-admin users (server check)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing markdown import | Medium | Only add auth check at top; don't modify logic |
| ImportMarkdownButton UX on 401 | Low | User already redirected by middleware; edge case |
| headers() async in API route | Low | Next.js 14 supports async headers in route handlers |

## Security Considerations

- Full session validation (DB check) in API routes, not just cookie existence
- `requireAdmin()` chains with `requireAuth()` - no bypass
- Public routes explicitly listed; default is public (matches existing behavior)
- No CORS changes needed (same-origin API calls)

## Next Steps

This is the final phase. After completion:
1. Full end-to-end testing of all flows
2. Update docs/system-architecture.md with auth additions
3. Update docs/project-changelog.md
