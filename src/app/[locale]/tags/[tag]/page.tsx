import Link from 'next/link';
import { getSortedPostsData, getAllPostIds } from '@/lib/posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n';

export async function generateStaticParams() {
  const allPosts = getAllPostIds(locales);
  const allTags = new Set<string>();
  
  allPosts.forEach(({ params }) => {
    const posts = getSortedPostsData(params.locale);
    posts.forEach(post => {
        post.tags?.forEach(tag => {
            allTags.add(tag.toLowerCase());
        });
    });
  });

  const params = Array.from(allTags).flatMap((tag) =>
    locales.map((locale) => ({ tag, locale }))
  );

  return params;
}

export async function generateMetadata({ params }: { params: { tag: string, locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'TagPage' });
  const tagName = decodeURIComponent(params.tag);
  const formattedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  
  return {
    title: t('title', { tag: formattedTag }),
    description: t('description', { tag: formattedTag }),
  };
}

export default function TagPage({ params }: { params: { tag: string, locale: string } }) {
  const t = useTranslations('TagPage');
  const allPosts = getSortedPostsData(params.locale);
  const tagName = decodeURIComponent(params.tag).toLowerCase();
  
  const filteredPosts = allPosts.filter(post => 
    post.tags?.some(tag => tag.toLowerCase() === tagName)
  );

  const formattedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);

  const relatedTags = new Set<string>();
  filteredPosts.forEach(post => {
    post.tags?.forEach(tag => {
      if (tag.toLowerCase() !== tagName) {
        relatedTags.add(tag);
      }
    });
  });

  const tagColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-amber-100 text-amber-800 border-amber-200',
  ];

  if (filteredPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h1 className="heading-lg text-gray-800 mb-4">{t('noArticles.title')}</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {t('noArticles.description', { tag: formattedTag })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/${params.locale}/tags`} 
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('noArticles.browseAllTags')}
            </Link>
            <Link 
              href={`/${params.locale}/topics`} 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('noArticles.viewAllTopics')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-blue-50 py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
              <Link href={`/${params.locale}`} className="hover:text-gray-800 transition-colors">
                {t('breadcrumb.home')}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/${params.locale}/tags`} className="hover:text-gray-800 transition-colors">
                {t('breadcrumb.tags')}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-500">{formattedTag}</span>
            </nav>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>

              <h1 className="heading-xl text-gray-800 mb-6">
                {t('header.title', { tag: formattedTag })}
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                {t('header.description', { count: filteredPosts.length, tag: formattedTag })}
              </p>

              {/* Stats */}
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{filteredPosts.length}</div>
                    <div className="text-sm text-gray-600">{t('stats.articles')}</div>
                  </div>
                  {relatedTags.size > 0 && (
                    <>
                      <div className="w-px h-8 bg-gray-300"></div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{relatedTags.size}</div>
                        <div className="text-sm text-gray-600">{t('stats.relatedTags')}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="animate-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <KnowledgeCard
                  title={post.title}
                  description={post.description}
                  tags={post.tags}
                  href={`/${params.locale}/topics/${post.id}`}
                  gradientFrom={post.gradientFrom || 'from-blue-500'}
                  gradientTo={post.gradientTo || 'to-purple-600'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Tags */}
      {relatedTags.size > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="heading-md text-gray-800 mb-6">
                {t('relatedTags.title')}
              </h2>
              <p className="text-gray-600 mb-8">
                {t('relatedTags.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {Array.from(relatedTags).slice(0, 10).map((tag, index) => (
                  <Link
                    key={tag}
                    href={`/${params.locale}/tags/${encodeURIComponent(tag.toLowerCase())}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:scale-105 ${
                      tagColors[index % tagColors.length]
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link 
                href={`/${params.locale}/tags`} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('navigation.backToTags')}
              </Link>

              <Link
                href={`/${params.locale}/topics`}
                className="btn-primary"
              >
                {t('navigation.viewAllTopics')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
