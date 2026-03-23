---
phase: 6
title: "User Profile Page"
status: completed
priority: P2
effort: 1.5h
depends_on: [4, 5]
---

# Phase 6: User Profile Page

## Context Links

- [Better Auth Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [Better Auth Email/Password - Change Password](https://www.better-auth.com/docs/authentication/email-password)
- Existing layout: `src/app/[locale]/layout.tsx`

## Overview

Create a profile page at `/[locale]/profile` where authenticated users can view and edit their name, avatar URL, and change password. Protected route (middleware redirects unauthenticated).

## Key Insights

- `auth.api.getSession({ headers: await headers() })` for server-side session
- `authClient.updateUser()` for updating name/image on client
- `authClient.changePassword()` for password changes
- Avatar is URL-based first (YAGNI - no file upload)
- Profile page is a protected route (handled by Phase 3 middleware)

## Requirements

**Functional:**
- Display current user info: name, email, avatar, role, member since
- Edit name and avatar URL
- Change password (current + new + confirm)
- Success/error feedback on save
- i18n support (en/vi)

**Non-functional:**
- Page < 150 lines (split into sub-components if needed)
- Server component for initial data, client component for form interactions

## Architecture

```
src/app/[locale]/profile/
  page.tsx                <- Server component: fetch session, render ProfileForm
src/components/ui/
  ProfileForm.tsx         <- Client component: edit name, avatar
  ChangePasswordForm.tsx  <- Client component: change password
```

## Related Code Files

**Create:**
- `src/app/[locale]/profile/page.tsx`
- `src/components/ui/ProfileForm.tsx`
- `src/components/ui/ChangePasswordForm.tsx`

**Modify:**
- `src/messages/en.json` - Add Profile i18n keys
- `src/messages/vi.json` - Add Profile i18n keys

## Implementation Steps

### Step 1: Add i18n strings

Add to `src/messages/en.json`:

```json
{
  "Profile": {
    "title": "Your Profile",
    "description": "Manage your account settings",
    "info": {
      "name": "Full Name",
      "email": "Email",
      "avatar": "Avatar URL",
      "avatarHelp": "Enter a URL to an image (e.g., Gravatar, GitHub avatar)",
      "role": "Role",
      "memberSince": "Member since"
    },
    "actions": {
      "save": "Save Changes",
      "saving": "Saving...",
      "saved": "Changes saved successfully",
      "error": "Failed to save changes"
    },
    "password": {
      "title": "Change Password",
      "current": "Current Password",
      "new": "New Password",
      "confirm": "Confirm New Password",
      "change": "Change Password",
      "changing": "Changing...",
      "changed": "Password changed successfully",
      "mismatch": "Passwords do not match",
      "wrongCurrent": "Current password is incorrect",
      "tooShort": "Password must be at least 8 characters",
      "error": "Failed to change password"
    },
    "sessions": {
      "title": "Active Sessions",
      "current": "Current session",
      "revokeOthers": "Sign out other sessions"
    }
  }
}
```

Add Vietnamese equivalent to `vi.json`.

### Step 2: Create profile page `src/app/[locale]/profile/page.tsx`

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfileForm from '@/components/ui/ProfileForm';
import ChangePasswordForm from '@/components/ui/ChangePasswordForm';

export default async function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('Profile');

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <div className="space-y-8">
        <ProfileForm
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image || '',
            role: session.user.role || 'user',
            createdAt: session.user.createdAt,
          }}
          locale={locale}
        />

        <hr className="border-gray-200" />

        <ChangePasswordForm locale={locale} />
      </div>
    </div>
  );
}
```

### Step 3: Create ProfileForm `src/components/ui/ProfileForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
    createdAt: string;
  };
  locale: string;
}

export default function ProfileForm({ user, locale }: ProfileFormProps) {
  const t = useTranslations('Profile');
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    const { error } = await authClient.updateUser({
      name,
      image: image || undefined,
    });

    setStatus(error ? 'error' : 'saved');
    if (!error) setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-500">
              {t('info.role')}: {user.role} &middot; {t('info.memberSince')}: {new Date(user.createdAt).toLocaleDateString(locale)}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('info.name')}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
            {t('info.avatar')}
          </label>
          <input
            id="avatar"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-400 mt-1">{t('info.avatarHelp')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'saving' ? t('actions.saving') : t('actions.save')}
          </button>
          {status === 'saved' && (
            <span className="text-sm text-green-600">{t('actions.saved')}</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">{t('actions.error')}</span>
          )}
        </div>
      </form>
    </div>
  );
}
```

### Step 4: Create ChangePasswordForm `src/components/ui/ChangePasswordForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

export default function ChangePasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('Profile.password');
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'changing' | 'changed' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPw !== confirm) {
      setError(t('mismatch'));
      return;
    }
    if (newPw.length < 8) {
      setError(t('tooShort'));
      return;
    }

    setStatus('changing');

    const { error: authError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: newPw,
      revokeOtherSessions: true,
    });

    if (authError) {
      setStatus('error');
      setError(t('wrongCurrent'));
      return;
    }

    setStatus('changed');
    setCurrent('');
    setNewPw('');
    setConfirm('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="currentPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('current')}
          </label>
          <input id="currentPw" type="password" required value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="current-password" />
        </div>

        <div>
          <label htmlFor="newPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('new')}
          </label>
          <input id="newPw" type="password" required minLength={8} value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password" />
        </div>

        <div>
          <label htmlFor="confirmPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('confirm')}
          </label>
          <input id="confirmPw" type="password" required minLength={8} value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={status === 'changing'}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
            {status === 'changing' ? t('changing') : t('change')}
          </button>
          {status === 'changed' && (
            <span className="text-sm text-green-600">{t('changed')}</span>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Todo List

- [x] Add Profile i18n strings to en.json and vi.json
- [x] Create profile server page with session check
- [x] Create ProfileForm client component
- [x] Create ChangePasswordForm client component
- [ ] Test profile info display
- [ ] Test name/avatar update
- [ ] Test password change flow
- [ ] Test unauthenticated redirect to login
- [ ] Verify responsive design

## Success Criteria

- Profile page shows current user info
- Name and avatar URL editable with success feedback
- Password change works with proper validation
- Unauthenticated users redirected to login
- i18n works in both locales

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Session type mismatch | Low | Export Session type from auth.ts |
| Avatar URL XSS | Low | URL is rendered as img src; no script injection |
| updateUser API shape | Medium | Test with Better Auth docs; handle errors |

## Security Considerations

- Server-side session check in page.tsx (not just middleware cookie check)
- `revokeOtherSessions: true` on password change logs out all other devices
- Avatar is URL only; no file upload (no storage security concerns)
- Password fields use autoComplete attributes for proper browser behavior

## Next Steps

- Phase 7: Admin panel (uses same session patterns)
- Phase 8: Header auth button links to profile
