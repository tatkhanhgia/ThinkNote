'use client';

import React, { useState } from 'react';
import BlogCard from '@/components/ui/BlogCard';
import MoodFilter from '@/components/ui/MoodFilter';

interface BlogPostData {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: string;
  tags: string[];
  readingTime: number;
}

interface BlogListClientProps {
  posts: BlogPostData[];
  moods: { mood: string; count: number }[];
  locale: string;
  noPostsTitle: string;
  noPostsDesc: string;
}

const BlogListClient: React.FC<BlogListClientProps> = ({
  posts, moods, locale, noPostsTitle, noPostsDesc,
}) => {
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const displayed = activeMood ? posts.filter(p => p.mood === activeMood) : posts;

  return (
    <>
      {/* Mood Filter */}
      {moods.length > 0 && (
        <div className="mb-8">
          <MoodFilter
            moods={moods}
            activeMood={activeMood}
            onMoodChange={setActiveMood}
            locale={locale}
          />
        </div>
      )}

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{noPostsTitle}</h2>
          <p className="text-gray-500">{noPostsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((post, i) => (
            <div
              key={post.id}
              className="animate-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <BlogCard
                title={post.title}
                description={post.description}
                date={post.date}
                mood={post.mood}
                readingTime={post.readingTime}
                tags={post.tags}
                href={`/${locale}/blog/${post.id}`}
                locale={locale}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default BlogListClient;
