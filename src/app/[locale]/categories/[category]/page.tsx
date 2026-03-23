import { getPostsByCategorySlug, getCategoryNameBySlug } from '@/lib/posts';
import { getCommunityPostsByCategorySlug } from '@/lib/community-posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    category: string; // This is now a slug
    locale: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug, locale } = params;

  const [filePosts, communityPosts] = await Promise.all([
    Promise.resolve(getPostsByCategorySlug(categorySlug, locale)),
    getCommunityPostsByCategorySlug(categorySlug, locale),
  ]);
  const posts = [...filePosts, ...communityPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const categoryName = getCategoryNameBySlug(categorySlug, locale) ?? communityPosts[0]?.categories.find(c => c.toLowerCase().replace(/\s+/g, '-') === categorySlug);
  const t = await getTranslations('CategoryPage');

  if (!categoryName && posts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="page-header relative py-16 sm:py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="heading-xl text-white mb-6">
            {t('title')} <span className="text-blue-300">{categoryName}</span>
          </h1>
          <div className="mt-6 inline-flex items-center bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
            <span className="text-2xl font-bold text-white mr-2">{posts.length}</span>
            <span className="text-sm text-gray-300">{t('title')}</span>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-in"
                style={{
                  animationDelay: `${Math.min(index * 80, 400)}ms`,
                  animationFillMode: 'both',
                }}
              >
                <KnowledgeCard
                  {...post}
                  href={post.source === 'community' ? `/${locale}/articles/${post.id}` : `/${locale}/topics/${post.id}`}
                  source={post.source}
                  author={post.author}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
