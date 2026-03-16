import { getPostsByCategorySlug, getCategoryNameBySlug } from '@/lib/posts';
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
  
  const posts = getPostsByCategorySlug(categorySlug, locale);
  const categoryName = getCategoryNameBySlug(categorySlug, locale);
  const t = await getTranslations('CategoryPage');

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {t('title')} <span className="text-blue-500">{categoryName}</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <KnowledgeCard 
            key={post.id} 
            {...post} 
            href={`/${locale}/topics/${post.id}`} 
          />
        ))}
      </div>
    </div>
  );
}
