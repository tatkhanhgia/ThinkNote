---
phase: 7
title: "Admin Panel"
status: completed
priority: P2
effort: 2h
depends_on: [2]
---

# Phase 7: Admin Panel

## Context Links

- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- Admin client methods: listUsers, banUser, unbanUser, setRole, removeUser

## Overview

Create admin panel at `/[locale]/admin` with user management. Admin layout checks role server-side. Uses Better Auth admin plugin API for all operations.

## Key Insights

- Better Auth admin plugin provides full CRUD: `listUsers`, `banUser`, `unbanUser`, `setRole`, `removeUser`
- `listUsers` supports pagination, search, filter, sort
- Admin guard: server component checks `session.user.role === 'admin'`
- First admin: register normally, then `UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com'` in DB
- Admin routes: `/[locale]/admin` (dashboard), `/[locale]/admin/users` (user management)

## Requirements

**Functional:**
- Admin dashboard with user count stats
- Users list page with search, pagination
- Ban/unban users with reason
- Change user role (admin/user)
- Remove user (with confirmation)
- i18n support

**Non-functional:**
- Server-side role check (not just middleware cookie)
- Admin layout wraps all admin pages
- Tables responsive on mobile (card layout fallback)
- Each file < 180 lines

## Architecture

```
src/app/[locale]/admin/
  layout.tsx              <- Server: check session + role, redirect if not admin
  page.tsx                <- Admin dashboard (stats)
  users/
    page.tsx              <- User management (list, search, actions)
src/components/ui/
  AdminUserTable.tsx      <- Client: user table with actions
```

## Related Code Files

**Create:**
- `src/app/[locale]/admin/layout.tsx`
- `src/app/[locale]/admin/page.tsx`
- `src/app/[locale]/admin/users/page.tsx`
- `src/components/ui/AdminUserTable.tsx`

**Modify:**
- `src/messages/en.json` - Add Admin i18n keys
- `src/messages/vi.json` - Add Admin i18n keys

## Implementation Steps

### Step 1: Add i18n strings

Add to `src/messages/en.json`:

```json
{
  "Admin": {
    "title": "Admin Panel",
    "navigation": {
      "dashboard": "Dashboard",
      "users": "Users"
    },
    "dashboard": {
      "title": "Dashboard",
      "totalUsers": "Total Users",
      "verifiedUsers": "Verified",
      "bannedUsers": "Banned",
      "adminUsers": "Admins"
    },
    "users": {
      "title": "User Management",
      "search": "Search users...",
      "table": {
        "name": "Name",
        "email": "Email",
        "role": "Role",
        "status": "Status",
        "joined": "Joined",
        "actions": "Actions"
      },
      "status": {
        "verified": "Verified",
        "unverified": "Unverified",
        "banned": "Banned"
      },
      "actions": {
        "setAdmin": "Make Admin",
        "setUser": "Remove Admin",
        "ban": "Ban User",
        "unban": "Unban User",
        "remove": "Delete User",
        "confirmRemove": "Are you sure you want to delete this user? This cannot be undone."
      },
      "banDialog": {
        "title": "Ban User",
        "reason": "Ban reason (optional)",
        "confirm": "Confirm Ban",
        "cancel": "Cancel"
      },
      "noUsers": "No users found",
      "pagination": {
        "previous": "Previous",
        "next": "Next",
        "showing": "Showing {from}-{to} of {total}"
      }
    },
    "notAdmin": "You do not have permission to access this page."
  }
}
```

### Step 2: Create admin layout `src/app/[locale]/admin/layout.tsx`

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Server-side role check - this is the real guard
  if (session.user.role !== 'admin') {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('Admin');

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <nav className="flex gap-4">
          <Link
            href={`/${locale}/admin`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('navigation.dashboard')}
          </Link>
          <Link
            href={`/${locale}/admin/users`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('navigation.users')}
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
```

### Step 3: Create admin dashboard `src/app/[locale]/admin/page.tsx`

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Admin.dashboard');

  // Fetch stats directly from DB
  const [total, verified, banned, admins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { role: 'admin' } }),
  ]);

  const stats = [
    { label: t('totalUsers'), value: total, color: 'blue' },
    { label: t('verifiedUsers'), value: verified, color: 'green' },
    { label: t('bannedUsers'), value: banned, color: 'red' },
    { label: t('adminUsers'), value: admins, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-6 ${colorMap[color]}`}
          >
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 4: Create users management page `src/app/[locale]/admin/users/page.tsx`

```tsx
import { getTranslations } from 'next-intl/server';
import AdminUserTable from '@/components/ui/AdminUserTable';

export default async function AdminUsersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Admin.users');

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('title')}</h2>
      <AdminUserTable locale={locale} />
    </div>
  );
}
```

### Step 5: Create AdminUserTable `src/components/ui/AdminUserTable.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default function AdminUserTable({ locale }: { locale: string }) {
  const t = useTranslations('Admin.users');
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await authClient.admin.listUsers({
      query: {
        limit: PAGE_SIZE,
        offset,
        ...(search && {
          searchValue: search,
          searchField: 'email',
          searchOperator: 'contains',
        }),
      },
    });
    if (data) {
      setUsers(data.users as User[]);
      setTotal(data.total);
    }
    setLoading(false);
  }, [offset, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (userId: string) => {
    const reason = prompt(t('banDialog.reason'));
    await authClient.admin.banUser({ userId, banReason: reason || undefined });
    fetchUsers();
  };

  const handleUnban = async (userId: string) => {
    await authClient.admin.unbanUser({ userId });
    fetchUsers();
  };

  const handleSetRole = async (userId: string, role: string) => {
    await authClient.admin.setRole({ userId, role });
    fetchUsers();
  };

  const handleRemove = async (userId: string) => {
    if (!confirm(t('actions.confirmRemove'))) return;
    await authClient.admin.removeUser({ userId });
    fetchUsers();
  };

  const getStatus = (user: User) => {
    if (user.banned) return { label: t('status.banned'), class: 'bg-red-100 text-red-700' };
    if (user.emailVerified) return { label: t('status.verified'), class: 'bg-green-100 text-green-700' };
    return { label: t('status.unverified'), class: 'bg-yellow-100 text-yellow-700' };
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
        className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.name')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.email')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.role')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.joined')}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const status = getStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString(locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' ? (
                          <button onClick={() => handleSetRole(user.id, 'user')}
                            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
                            {t('actions.setUser')}
                          </button>
                        ) : (
                          <button onClick={() => handleSetRole(user.id, 'admin')}
                            className="text-xs px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700">
                            {t('actions.setAdmin')}
                          </button>
                        )}
                        {user.banned ? (
                          <button onClick={() => handleUnban(user.id)}
                            className="text-xs px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700">
                            {t('actions.unban')}
                          </button>
                        ) : (
                          <button onClick={() => handleBan(user.id)}
                            className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
                            {t('actions.ban')}
                          </button>
                        )}
                        <button onClick={() => handleRemove(user.id)}
                          className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
                          {t('actions.remove')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <p className="text-center py-8 text-gray-500">{t('noUsers')}</p>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {t('pagination.showing', {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              {t('pagination.previous')}
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              {t('pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Create first admin user

After registration, run in Prisma Studio or psql:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or via Prisma Studio: open `npx prisma studio`, find user, change `role` to `admin`.

## Todo List

- [x] Add Admin i18n strings to en.json and vi.json
- [x] Create admin layout with role check
- [x] Create admin dashboard with stats
- [x] Create users management page
- [x] Create AdminUserTable client component
- [ ] Test admin access control (non-admin redirected)
- [ ] Test user search and pagination
- [ ] Test ban/unban functionality
- [ ] Test role change
- [ ] Test user deletion with confirmation
- [ ] Create first admin user in DB

## Success Criteria

- Admin layout redirects non-admin users to home
- Dashboard shows accurate user stats
- Users table loads with pagination
- Search filters users by email
- Ban/unban, role change, delete all work
- i18n works on admin pages

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Admin can delete themselves | Medium | Could add check; YAGNI for personal project |
| Admin plugin API shape changes | Low | Pin better-auth version |
| Large user list performance | Low | Pagination limits to 20 per page |

## Security Considerations

- Server-side role check in layout.tsx (not just middleware cookie)
- Admin plugin API methods check role server-side
- Confirm dialog before destructive actions (delete)
- Admin cannot be created via API; must be set in DB directly

## Next Steps

- Phase 8: Header integration (admin link visible for admins)
- Phase 9: Protect API routes
