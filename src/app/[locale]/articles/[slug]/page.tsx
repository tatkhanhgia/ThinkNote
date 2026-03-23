import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PostContent from '@/components/ui/PostContent';
import { getTranslations } from 'next-intl/server';

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function CommunityArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('TopicDetail');

  const article = await prisma.article.findUnique({
    where: { slug_locale: { slug, locale } },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!article || article.status !== 'PUBLISHED') return notFound();

  const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-gray-200">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{t('breadcrumb.home')}</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href={`/${locale}/topics`} className="hover:text-white transition-colors">{t('breadcrumb.topics')}</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-300 truncate">{article.title}</span>
          </nav>

          {/* Community badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" /></svg>
            Community Article
          </span>

          <h1 className="heading-xl text-white mb-6">{article.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 mb-6">
            {/* Author */}
            <div className="flex items-center gap-2 text-gray-300">
              {article.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.author.image} alt={article.author.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">{article.author.name.charAt(0).toUpperCase()}</span>
              )}
              <span className="text-sm">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{(article.publishedAt ?? article.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span>{t('meta.readTime', { minutes: readingTime })}</span>
            </div>
          </div>

          {/* Categories + Tags */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {article.categories.map((c) => (
                <Link key={c} href={`/${locale}/categories/${encodeURIComponent(c.toLowerCase().replace(/\s+/g, '-'))}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-200 hover:bg-purple-600/30 transition-colors">{c}</Link>
              ))}
            </div>
          )}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link key={tag} href={`/${locale}/tags/${encodeURIComponent(tag.toLowerCase())}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-200 hover:bg-blue-600/30 transition-colors">#{tag}</Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="content-section">
        <div className="container mx-auto px-6 max-w-4xl">
          <PostContent contentHtml={article.content} />
        </div>
      </section>
    </div>
  );
}
