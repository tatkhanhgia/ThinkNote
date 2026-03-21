import Link from 'next/link';
import { Suspense } from 'react';
import { getSortedPostsData, getAllCategoriesWithSlug } from '@/lib/posts';
import { getTranslations } from 'next-intl/server';
import TopicsClient from './TopicsClient';
import PageHeader from '@/components/ui/PageHeader';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'TopicsPage' });

  return {
    title: `${t('title')} - ThinkNote`,
    description: t('description'),
  };
}

export default async function TopicsPage({ params: { locale } }: Props) {
  const allPosts = getSortedPostsData(locale);
  const categories = getAllCategoriesWithSlug(locale);
  const t = await getTranslations('TopicsPage');

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="heading-lg text-gray-800 mb-4">{t('noTopics.title')}</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {t('noTopics.description')}
          </p>
          <Link 
            href={`/${locale}`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('noTopics.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('title')}
        description={t('description')}
        stats={[
          { label: t('stats.articles'), value: allPosts.length, color: 'text-blue-600' },
          { label: t('stats.categories'), value: categories.length, color: 'text-purple-600' },
          { label: t('stats.tags'), value: Array.from(new Set(allPosts.flatMap(p => p.tags || []))).length, color: 'text-emerald-600' },
        ]}
      />

      {/* Topics Grid with Category Filter */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="modern-card p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          }>
            <TopicsClient posts={allPosts} categories={categories} locale={locale} />
          </Suspense>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/tags`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('cta.browseTags')}
            </Link>
            <Link
              href={`/${locale}`}
              className="btn-primary"
            >
              {t('cta.backToHome')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}