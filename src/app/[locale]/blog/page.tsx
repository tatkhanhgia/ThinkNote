import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getSortedBlogPosts, getAllBlogMoods } from '@/lib/blog-posts';
import BlogListClient from './BlogListClient';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  return {
    title: `${t('hero.title')} - ThinkNote`,
    description: t('hero.subtitle'),
  };
}

export default async function BlogPage({ params: { locale } }: Props) {
  const posts = getSortedBlogPosts(locale);
  const moods = getAllBlogMoods(locale);
  const t = await getTranslations('BlogPage');

  return (
    <div className="blog-layout min-h-screen">
      {/* Hero */}
      <section className="blog-hero text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
            <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
            {moods.length > 0 && (
              <>
                <span>·</span>
                <span>{moods.length} moods</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <BlogListClient
          posts={posts}
          moods={moods}
          locale={locale}
          noPostsTitle={t('noPosts.title')}
          noPostsDesc={t('noPosts.description')}
        />
      </section>

      {/* Back to KB */}
      <section className="py-8 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#C17765] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {locale === 'vi' ? 'Về trang chủ' : 'Back to home'}
          </Link>
        </div>
      </section>
    </div>
  );
}
