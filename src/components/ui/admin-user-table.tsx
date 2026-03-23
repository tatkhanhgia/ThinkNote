'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
  emailVerified: boolean;
  createdAt: string | Date;
}

const PAGE_SIZE = 20;

export default function AdminUserTable({ locale }: { locale: string }) {
  const t = useTranslations('Admin.users');
  const [users, setUsers] = useState<AdminUser[]>([]);
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
      setUsers(data.users as AdminUser[]);
      setTotal(data.total);
    }
    setLoading(false);
  }, [offset, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (userId: string) => {
    const reason = prompt(t('banDialog.reason'));
    await authClient.admin.banUser({ userId, banReason: reason ?? undefined });
    fetchUsers();
  };

  const handleUnban = async (userId: string) => {
    await authClient.admin.unbanUser({ userId });
    fetchUsers();
  };

  const handleSetRole = async (userId: string, role: string) => {
    await authClient.admin.setRole({ userId, role: role as 'admin' | 'user' });
    fetchUsers();
  };

  const handleRemove = async (userId: string) => {
    if (!confirm(t('actions.confirmRemove'))) return;
    await authClient.admin.removeUser({ userId });
    fetchUsers();
  };

  const getStatus = (user: AdminUser) => {
    if (user.banned) return { label: t('status.banned'), cls: 'bg-red-100 text-red-700' };
    if (user.emailVerified) return { label: t('status.verified'), cls: 'bg-green-100 text-green-700' };
    return { label: t('status.unverified'), cls: 'bg-yellow-100 text-yellow-700' };
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
        className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />

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
                const joinedDate = new Date(user.createdAt).toLocaleDateString(locale);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{joinedDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => handleSetRole(user.id, 'user')}
                            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            {t('actions.setUser')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetRole(user.id, 'admin')}
                            className="text-xs px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700"
                          >
                            {t('actions.setAdmin')}
                          </button>
                        )}
                        {user.banned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="text-xs px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700"
                          >
                            {t('actions.unban')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="text-xs px-2 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-700"
                          >
                            {t('actions.ban')}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(user.id)}
                          className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                        >
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

        {loading && (
          <p className="text-center py-8 text-gray-400 animate-pulse">Loading...</p>
        )}
      </div>

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
