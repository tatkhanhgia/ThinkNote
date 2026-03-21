import { getPostData, getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import PostContent from '@/components/ui/PostContent'; // Import the new component

type Props = {
  params: { locale: string; topic: string };
};

export async function generateStaticParams() {
  const locales = ['en', 'vi'];
  const params = [];
  
  for (const locale of locales) {
    const allPosts = getSortedPostsData(locale);
    for (const post of allPosts) {
      params.push({
        locale,
        topic: post.id,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const postData = await getPostData(params.topic, params.locale);
  return {
    title: `${postData.title} - ThinkNote`,
    description: postData.description,
  };
}

export default async function TopicDetailPage({ params }: Props) {
  const postData = await getPostData(params.topic, params.locale);
  const t = await getTranslations('TopicDetail');
  const { locale } = params;

  const wordCount = (postData.contentHtml || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract TOC from h2/h3 headings
  const tocItems: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = headingRegex.exec(postData.contentHtml || '')) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    tocItems.push({ id, text, level: parseInt(match[1]) });
  }

  // Add IDs to headings in rendered HTML for anchor navigation
  const contentWithIds = (postData.contentHtml || '').replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, level, attrs, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim();
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-gray-200">
              <Link href={`/${locale}`} className="hover:text-white transition-colors">
                {t('breadcrumb.home')}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/${locale}/topics`} className="hover:text-white transition-colors">
                {t('breadcrumb.topics')}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-300 max-w-[200px] md:max-w-none truncate md:overflow-visible">{postData.title}</span>
            </nav>

            {/* Title and Meta */}
            <h1 className="heading-xl text-white mb-6">
              {postData.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(postData.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{t('meta.readTime', { minutes: readingTime })}</span>
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="space-y-3">
              {postData.categories && postData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-300 text-sm font-medium">{t('meta.categories')}:</span>
                  {postData.categories.map((category, index) => (
                    <Link 
                      href={`/${locale}/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`} 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-200 hover:bg-purple-600/30 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
              
              {postData.tags && postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-300 text-sm font-medium">{t('meta.tags')}:</span>
                  {postData.tags.map((tag, index) => (
                    <Link 
                      href={`/${locale}/tags/${encodeURIComponent(tag.toLowerCase())}`} 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Table of Contents — only shown for articles with 3+ headings */}
            {tocItems.length >= 3 && (
              <details className="mb-6 bg-blue-50 border border-blue-200 rounded-xl" open>
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-800 flex items-center gap-2 select-none">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                  </svg>
                  Table of Contents
                </summary>
                <nav className="px-6 pb-4">
                  <ol className="space-y-1 text-sm">
                    {tocItems.map((item, i) => (
                      <li key={i} className={item.level === 3 ? 'ml-4' : ''}>
                        <a
                          href={`#${item.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
            )}

            <div className="modern-card p-8 lg:p-12">
              <PostContent contentHtml={contentWithIds} />
            </div>
          </div>
        </div>
      </article>

      {/* Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center">
              <Link
                href={`/${locale}/topics`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('navigation.backToTopics')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}