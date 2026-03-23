---
phase: 8
title: "Header Integration (Auth Button + Avatar)"
status: completed
priority: P2
effort: 0.5h
depends_on: [2]
---

# Phase 8: Header Integration

## Context Links

- Existing header: `src/app/[locale]/layout.tsx` (lines 66-101)
- Existing nav: `src/components/ui/HeaderNav.tsx`
- Better Auth `useSession` hook

## Overview

Add auth UI to the header: login button for unauthenticated users, user avatar dropdown for authenticated users. Shows profile link, admin link (if admin), and logout button.

## Key Insights

- `useSession()` from auth-client provides reactive session state
- Header is in the server layout; auth button must be a client component
- Keep the existing header structure; add AuthButton component next to LanguageSwitcher
- Dropdown menu for authenticated users: Profile, Admin (if admin), Sign Out
- Use simple dropdown (no external library); follows existing HeaderNav pattern

## Requirements

**Functional:**
- Unauthenticated: "Sign In" button linking to `/[locale]/login`
- Authenticated: avatar/initial circle with dropdown
- Dropdown items: Profile, Admin (admin only), Sign Out
- i18n support

**Non-functional:**
- Component < 120 lines
- No layout shifts (fixed-size avatar circle)
- Dropdown closes on outside click + Escape key

## Architecture

```
src/components/ui/AuthButton.tsx  <- Client component with useSession
src/app/[locale]/layout.tsx       <- Add <AuthButton /> to header actions
```

## Related Code Files

**Create:**
- `src/components/ui/AuthButton.tsx`

**Modify:**
- `src/app/[locale]/layout.tsx` - Import and add AuthButton to header
- `src/messages/en.json` - Add auth button i18n
- `src/messages/vi.json` - Add auth button i18n

## Implementation Steps

### Step 1: Add i18n strings

Add to `src/messages/en.json`:

```json
{
  "Auth": {
    "button": {
      "signIn": "Sign In",
      "profile": "Profile",
      "admin": "Admin Panel",
      "signOut": "Sign Out"
    }
  }
}
```

Note: Merge this into the existing `"Auth"` key from Phase 4.

### Step 2: Create `src/components/ui/AuthButton.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

export default function AuthButton({ locale }: { locale: string }) {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('Auth.button');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setOpen(false);
    router.push(`/${locale}`);
    router.refresh();
  };

  // Loading state - show placeholder to prevent layout shift
  if (isPending) {
    return <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />;
  }

  // Not authenticated
  if (!session) {
    return (
      <Link
        href={`/${locale}/login`}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        {t('signIn')}
      </Link>
    );
  }

  // Authenticated - avatar dropdown
  const user = session.user;
  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-200 hover:border-blue-400 flex items-center justify-center overflow-hidden transition-colors"
        aria-label="User menu"
        aria-expanded={open}
      >
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-blue-600">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            href={`/${locale}/profile`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('profile')}
          </Link>

          {user.role === 'admin' && (
            <Link
              href={`/${locale}/admin`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {t('admin')}
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Add AuthButton to layout header

In `src/app/[locale]/layout.tsx`, add import and component:

```tsx
import AuthButton from '@/components/ui/AuthButton';
```

In the header actions section (around line 85-94), add `<AuthButton />` after LanguageSwitcher:

```tsx
{/* Navigation, Actions & Language Switcher */}
<div className="flex items-center gap-4">
  <ImportMarkdownButton />
  <LanguageSwitcher />
  <AuthButton locale={locale} />
  <HeaderNav locale={locale} />
</div>
```

## Todo List

- [x] Add auth button i18n strings (merge into Auth key)
- [x] Create AuthButton component
- [x] Add AuthButton to layout header
- [ ] Test unauthenticated state (Sign In button)
- [ ] Test authenticated state (avatar dropdown)
- [ ] Test admin link visibility (admin only)
- [ ] Test sign out flow
- [ ] Test dropdown accessibility (Escape, outside click)
- [ ] Verify no layout shift during session loading

## Success Criteria

- Sign In button shows when not logged in
- Avatar with dropdown shows when logged in
- Admin link only visible for admin users
- Sign out works and redirects to home
- No layout shift during loading

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| useSession flash of loading | Low | Skeleton placeholder prevents layout shift |
| Dropdown z-index conflict with mobile menu | Low | Both use z-50; dropdown is smaller/positioned |

## Security Considerations

- `user.role` check is client-side (for UI only); server checks role in admin layout
- Sign out calls Better Auth API which revokes server session
- Avatar image uses img src (safe for URLs)

## Next Steps

- Phase 9: Route protection (final phase)
