import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface KnowledgeCardProps {
  title: string;
  description: string;
  tags?: string[];
  categories?: string[];
  href: string;
  gradientFrom?: string;
  gradientTo?: string;
  source?: 'system' | 'community';
  author?: { name: string; image?: string };
}

// Map category names (EN + VI) to consistent gradient CSS classes
const CATEGORY_GRADIENT_MAP: Record<string, string> = {
  // Security & Performance - rose (pink-to-yellow, alert/energy)
  'Security': 'gradient-rose',
  'Bảo mật': 'gradient-rose',
  'Web Performance': 'gradient-rose',
  'Hiệu suất Web': 'gradient-rose',

  // AI & Design - purple (pink-to-red, innovation/abstract)
  'AI': 'gradient-purple',
  'Trí tuệ nhân tạo': 'gradient-purple',
  'Design Patterns': 'gradient-purple',
  'Mẫu thiết kế': 'gradient-purple',
  'System Design': 'gradient-purple',
  'Thiết kế hệ thống': 'gradient-purple',

  // Frontend & Tools - emerald (blue-to-cyan, creative/utility)
  'Frontend': 'gradient-emerald',
  'Framework': 'gradient-emerald',
  'Tool': 'gradient-emerald',
  'Công cụ': 'gradient-emerald',
  'IDE': 'gradient-emerald',

  // Data & Backend - blue (indigo-to-purple, foundational)
  'Database': 'gradient-blue',
  'Cơ sở dữ liệu': 'gradient-blue',
  'Backend': 'gradient-blue',
  'Development Core': 'gradient-blue',
  'Lõi phát triển': 'gradient-blue',

  // Languages - amber (warm/classic)
  'Java': 'gradient-amber',
  'Programming Languages': 'gradient-amber',
  'Ngôn ngữ lập trình': 'gradient-amber',
};

/** Pick gradient based on first matching category; fallback to gradient-blue */
function getCategoryGradient(categories?: string[]): string {
  if (!categories?.length) return 'gradient-blue';
  for (const cat of categories) {
    if (CATEGORY_GRADIENT_MAP[cat]) return CATEGORY_GRADIENT_MAP[cat];
  }
  // Deterministic hash fallback for unknown categories
  const gradients = ['gradient-blue', 'gradient-emerald', 'gradient-purple', 'gradient-rose', 'gradient-amber'];
  const hash = (categories[0] || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  title,
  description,
  tags,
  categories,
  href,
  source,
  author,
}) => {
  const locale = useLocale();
  const t = useTranslations('Common');

  const gradientClass = getCategoryGradient(categories);

  // hover lift/shadow handled by .modern-card:hover in globals.css — no duplicate Tailwind class needed
  return (
    <article aria-label={title} className="modern-card group overflow-hidden h-full flex flex-col cursor-pointer">
      {/* Gradient Header */}
      <div className={`${gradientClass} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={title}>
            {title}
          </h3>
          <div className="w-12 h-1 bg-white/30 rounded-full"></div>
        </div>
        
        {/* Community badge */}
        {source === 'community' && (
          <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/80 text-white backdrop-blur-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" /></svg>
            Community
          </span>
        )}

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-2" title={description}>
          {description}
        </p>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="text-xs font-medium text-gray-500 mr-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {t('categories')}:
            </div>
            {categories.map((category, index) => (
              <Link 
                href={`/${locale}/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`} 
                key={index} 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="text-xs font-medium text-gray-500 mr-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('tags')}:
            </div>
            {tags.map((tag, index) => (
              <Link 
                href={`/${locale}/tags/${encodeURIComponent(tag.toLowerCase())}`} 
                key={index} 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author */}
        {author && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            {author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.image} alt={author.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{author.name.charAt(0).toUpperCase()}</span>
            )}
            <span>{author.name}</span>
          </div>
        )}

        {/* Read More Button */}
        <div className="mt-auto">
          <Link 
            href={href} 
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg font-medium text-sm transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <span>{t('readMore')}</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default KnowledgeCard;