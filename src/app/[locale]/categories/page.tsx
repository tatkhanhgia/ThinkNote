import Link from 'next/link';
import { getAllCategoriesWithSlug, getSortedPostsData } from '@/lib/posts';
import PageHeader from '@/components/ui/PageHeader';
import { getCategoryIcon } from '@/lib/category-icons';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({ locale, namespace: 'CategoriesPage' });
 
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function CategoriesPage({params: {locale}}: {params: {locale: string}}) {
  const t = useTranslations('CategoriesPage');
  const allPosts = getSortedPostsData(locale);
  const categories = getAllCategoriesWithSlug(locale);

  // Unified color map (EN + VI) — locale-agnostic
  const categoryColors: Record<string, string> = {
    'Programming Languages': 'bg-blue-100 text-blue-800 border-blue-200',
    'DevCore': 'bg-purple-100 text-purple-800 border-purple-200',
    'Development Core': 'bg-purple-100 text-purple-800 border-purple-200',
    'AI': 'bg-pink-100 text-pink-800 border-pink-200',
    'Tool': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'IDE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Frontend': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Backend': 'bg-gray-100 text-gray-800 border-gray-200',
    'Database': 'bg-green-100 text-green-800 border-green-200',
    'Frameworks': 'bg-orange-100 text-orange-800 border-orange-200',
    'Framework': 'bg-orange-100 text-orange-800 border-orange-200',
    'Java': 'bg-amber-100 text-amber-800 border-amber-200',
    'Libraries': 'bg-teal-100 text-teal-800 border-teal-200',
    'Security': 'bg-red-100 text-red-800 border-red-200',
    'Design Patterns': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    // VI
    'Ngôn ngữ lập trình': 'bg-blue-100 text-blue-800 border-blue-200',
    'Lõi phát triển': 'bg-purple-100 text-purple-800 border-purple-200',
    'Trí tuệ nhân tạo': 'bg-pink-100 text-pink-800 border-pink-200',
    'Công cụ': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cơ sở dữ liệu': 'bg-green-100 text-green-800 border-green-200',
    'Thư viện': 'bg-teal-100 text-teal-800 border-teal-200',
    'Bảo mật': 'bg-red-100 text-red-800 border-red-200',
    'Mẫu thiết kế': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('title')}
        description={t('description')}
        stats={[
          { label: t('stats.categories'), value: categories.length, color: 'text-blue-600' },
          { label: t('stats.totalArticles'), value: allPosts.length, color: 'text-purple-600' },
        ]}
      />

      {/* Categories Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="heading-lg text-gray-800 mb-4">{t('noCategories.title')}</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {t('noCategories.description')}
              </p>
              <Link
                href={`/${locale}/topics`}
                className="btn-primary inline-flex items-center gap-2"
              >
                {t('noCategories.browseAllTopics')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(({slug, name, count}, index) => {
                const colorClass = categoryColors[name] || 'bg-gray-100 text-gray-800 border-gray-200';
                const IconComponent = getCategoryIcon(name);

                return (
                  <div
                    key={slug}
                    className="animate-in"
                    style={{
                      animationDelay: `${Math.min(index * 80, 400)}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Link
                      href={`/${locale}/categories/${slug}`}
                      className={`modern-card p-6 group hover:scale-105 transition-all duration-300 block h-full border cursor-pointer ${colorClass}`}
                    >
                      {/* Icon and Title */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-8 h-8 flex-shrink-0">
                          <IconComponent className="w-8 h-8 text-current" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{name}</h3>
                          <p className="text-sm opacity-80">
                            {t('card.articlesAvailable', {count: count})}
                          </p>
                        </div>
                      </div>

                      {/* Sample Articles */}
                      <div className="space-y-2 mb-6">
                        {allPosts.filter(p => p.categories && p.categories.includes(name)).slice(0, 2).map((post) => (
                          <div key={post.id} className="text-xs bg-white/50 rounded-lg p-2">
                            <div className="font-medium line-clamp-1">{post.title}</div>
                          </div>
                        ))}
                        {count > 2 && (
                          <div className="text-xs opacity-60 text-center">
                            {t('card.moreArticles', {count: count - 2})}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {count}
                        </div>
                        <div className="flex items-center text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <span className="mr-2">{t('card.explore')}</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
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
              href={`/${locale}/topics`}
              className="btn-primary"
            >
              {t('cta.browseAllArticles')}
            </Link>
            <Link
              href={`/${locale}/tags`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('cta.browseByTags')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

