import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getBlogPostData, getSortedBlogPosts } from '@/lib/blog-posts';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';
import PostContent from '@/components/ui/PostContent';
import ReadingTime from '@/components/ui/ReadingTime';

type Props = { params: { locale: string; slug: string } };

export async function generateStaticParams() {
  const locales = ['en', 'vi'];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    getSortedBlogPosts(locale).forEach(p => params.push({ locale, slug: p.id }));
  }
  return params;
}

export async function generateMetadata({ params: { locale, slug } }: Props) {
  try {
    const post = await getBlogPostData(slug, locale);
    return {
      title: `${post.title} - ThinkNote Blog`,
      description: post.description,
    };
  } catch {
    return { title: 'Blog - ThinkNote' };
  }
}

export default async function BlogDetailPage({ params: { locale, slug } }: Props) {
  const post = await getBlogPostData(slug, locale);
  const t = await getTranslations('BlogDetail');

  const moodKey = post.mood as BlogMood;
  const moodData = BLOG_MOODS[moodKey] ?? { icon: '📝', en: post.mood, vi: post.mood };
  const moodLabel = locale === 'vi' ? moodData.vi : moodData.en;

  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="blog-layout min-h-screen">
      {/* Article Header */}
      <header className="blog-hero relative">
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-300" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t('breadcrumb.home')}
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/${locale}/blog`} className="hover:text-white transition-colors">
              {t('breadcrumb.blog')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Mood */}
          <div className="mb-4">
            <span className={`mood-chip mood-chip--${moodKey}`}>
              {moodData.icon} {moodLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <time dateTime={post.date}>{formattedDate}</time>
            <span>·</span>
            <ReadingTime minutes={post.readingTime} locale={locale} />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="modern-card p-8 lg:p-12">
          <div className="blog-prose">
            <PostContent contentHtml={post.contentHtml || ''} />
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-white border border-gray-200 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-[#C17765] hover:border-[#C17765] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('navigation.backToBlog')}
          </Link>
        </div>
      </article>
    </div>
  );
}
