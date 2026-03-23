import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import ArticleForm from '@/components/ui/article-form';

export default async function ArticleEditPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  // Fetch article by slug + locale
  const article = await prisma.article.findUnique({
    where: { slug_locale: { slug, locale } },
  });

  if (!article) return notFound();

  const isAdmin = (session.user as { role?: string }).role === 'admin';
  const isOwner = article.authorId === session.user.id;

  // Only owner or admin can edit; only DRAFT/REJECTED are editable by owner
  if (!isAdmin && (!isOwner || (article.status !== 'DRAFT' && article.status !== 'REJECTED'))) {
    redirect(`/${locale}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Edit Article</h1>
        {article.status === 'REJECTED' && article.reviewNote && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <span className="font-medium">Rejected: </span>{article.reviewNote}
          </div>
        )}
      </div>
      <ArticleForm
        locale={locale}
        initialData={{
          id: article.id,
          title: article.title,
          description: article.description,
          content: article.content,
          locale: article.locale,
          categories: article.categories,
          tags: article.tags,
          gradientFrom: article.gradientFrom ?? undefined,
          gradientTo: article.gradientTo ?? undefined,
        }}
      />
    </div>
  );
}
