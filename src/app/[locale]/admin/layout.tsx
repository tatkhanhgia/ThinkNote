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

  // Server-side role check — real guard (not just middleware cookie)
  if ((session.user as { role?: string }).role !== 'admin') {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('Admin');

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <nav className="flex gap-2">
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
          <Link
            href={`/${locale}/admin/articles`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('navigation.articles')}
          </Link>
          <Link
            href={`/${locale}/admin/blog`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('navigation.blog')}
          </Link>
          <Link
            href={`/${locale}/markdown-import`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('navigation.import')}
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
