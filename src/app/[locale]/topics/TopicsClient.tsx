'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import KnowledgeCard from '@/components/ui/KnowledgeCard';

interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  categories?: string[];
  gradientFrom?: string;
  gradientTo?: string;
}

interface TopicsClientProps {
  posts: PostData[];
  categories: { slug: string; name: string; count: number }[];
  locale: string;
}

export default function TopicsClient({ posts, categories, locale }: TopicsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get('category') || 'all';

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post =>
        post.categories?.some(c =>
          c.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === activeCategory
        )
      );

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`/${locale}/topics?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => selectCategory('all')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
          <span className={`text-xs ${activeCategory === 'all' ? 'text-blue-100' : 'text-gray-400'}`}>
            {posts.length}
          </span>
        </button>
        {categories.map(({ slug, name, count }) => (
          <button
            key={slug}
            onClick={() => selectCategory(slug)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === slug
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {name}
            <span className={`text-xs ${activeCategory === slug ? 'text-blue-100' : 'text-gray-400'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              className="animate-in"
              style={{
                animationDelay: `${Math.min(index * 80, 400)}ms`,
                animationFillMode: 'both',
              }}
            >
              <KnowledgeCard
                title={post.title}
                description={post.description}
                tags={post.tags}
                categories={post.categories}
                href={`/${locale}/topics/${post.id}`}
                gradientFrom={post.gradientFrom || 'from-blue-500'}
                gradientTo={post.gradientTo || 'to-purple-600'}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No articles in this category yet.
        </div>
      )}
    </>
  );
}
