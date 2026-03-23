import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboard({
  params: { locale: _locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Admin.dashboard');

  // Fetch user stats via Better Auth admin API (server-side)
  const requestHeaders = await headers();
  const [allUsers, bannedUsers, adminUsers] = await Promise.all([
    auth.api.listUsers({ headers: requestHeaders, query: { limit: 1 } }),
    auth.api.listUsers({ headers: requestHeaders, query: { limit: 1, filterField: 'banned', filterValue: 'true', filterOperator: 'eq' } }),
    auth.api.listUsers({ headers: requestHeaders, query: { limit: 1, filterField: 'role', filterValue: 'admin', filterOperator: 'eq' } }),
  ]);

  const total = allUsers?.total ?? 0;
  const banned = bannedUsers?.total ?? 0;
  const admins = adminUsers?.total ?? 0;

  const stats = [
    { label: t('totalUsers'), value: total, color: 'blue' },
    { label: t('bannedUsers'), value: banned, color: 'red' },
    { label: t('adminUsers'), value: admins, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
