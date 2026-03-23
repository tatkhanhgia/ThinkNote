import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ArticleForm from '@/components/ui/article-form';

export default async function ArticleCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Write Article</h1>
        <p className="mt-1 text-sm text-gray-500">Share your knowledge with the community</p>
      </div>
      <ArticleForm locale={locale} />
    </div>
  );
}
