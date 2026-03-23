import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import MyArticlesClient from '@/components/ui/my-articles-client';

export default async function MyArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Articles</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your submitted articles</p>
        </div>
        <Link
          href={`/${locale}/articles/create`}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + Write New Article
        </Link>
      </div>
      <MyArticlesClient userId={session.user.id} locale={locale} />
    </div>
  );
}
