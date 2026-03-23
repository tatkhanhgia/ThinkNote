import { getTranslations } from 'next-intl/server';
import AdminUserTable from '@/components/ui/admin-user-table';

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
