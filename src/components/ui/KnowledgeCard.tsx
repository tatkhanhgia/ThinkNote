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
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ 
  title, 
  description, 
  tags, 
  categories,
  href, 
  gradientFrom = 'from-blue-500', 
  gradientTo = 'to-purple-600'
}) => {
  const locale = useLocale();
  const t = useTranslations('Common');

  // Map gradient classes to modern color schemes
  const getGradientClass = (from: string, to: string) => {
    const gradientMap: { [key: string]: string } = {
      'from-teal-400 to-emerald-500': 'gradient-emerald',
      'from-blue-500 to-indigo-500': 'gradient-blue', 
      'from-sky-400 to-cyan-300': 'gradient-blue',
      'from-gray-700 to-gray-800': 'gradient-purple',
    };
    
    const key = `${from} ${to}`;
    return gradientMap[key] || 'gradient-blue';
  };

  const gradientClass = getGradientClass(gradientFrom, gradientTo);

  return (
    <article className="modern-card group overflow-hidden h-full flex flex-col">
      {/* Gradient Header */}
      <div className={`${gradientClass} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="w-12 h-1 bg-white/30 rounded-full"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 leading-relaxed text-sm flex-1">
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
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800 transition-colors"
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

        {/* Read More Button */}
        <div className="mt-auto">
          <Link 
            href={href} 
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg font-medium text-sm transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-700"
          >
            <span>{t('readMore')}</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
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