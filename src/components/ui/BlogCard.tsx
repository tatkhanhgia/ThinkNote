import React from 'react';
import Link from 'next/link';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';
import ReadingTime from './ReadingTime';

interface BlogCardProps {
  title: string;
  description: string;
  date: string;
  mood: string;
  readingTime: number;
  tags: string[];
  href: string;
  locale: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title, description, date, mood, readingTime, tags, href, locale,
}) => {
  const moodKey = mood as BlogMood;
  const moodData = BLOG_MOODS[moodKey] ?? { icon: '📝', en: mood, vi: mood };
  const moodLabel = locale === 'vi' ? moodData.vi : moodData.en;

  const formattedDate = new Date(date).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <Link href={href} className="block h-full group cursor-pointer" aria-label={title}>
      <article className="blog-card h-full flex flex-col p-6">
        {/* Date + reading time */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
          <time dateTime={date}>{formattedDate}</time>
          <ReadingTime minutes={readingTime} locale={locale} />
        </div>

        {/* Mood chip */}
        <div className="mb-3">
          <span className={`mood-chip mood-chip--${moodKey}`}>
            {moodData.icon} {moodLabel}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-bold text-gray-800 text-lg leading-snug mb-2 group-hover:text-[#C17765] transition-colors duration-150 line-clamp-2" title={title}>
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4" title={description}>
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
};

export default BlogCard;
