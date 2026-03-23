'use client';

import React from 'react';
import Link from 'next/link';

interface PostData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  [key: string]: any;
}

interface SearchResultsProps {
  results: PostData[];
  query: string;
  activeIndex: number;
  locale: string;
  resultRefs: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  onResultClick: () => void;
  getResultsCount: (count: number) => string;
  tCommon: (key: string, values?: Record<string, any>) => string;
  tSeeAll: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results, query, activeIndex, locale, resultRefs,
  onResultClick, getResultsCount, tCommon, tSeeAll,
}) => {
  if (results.length === 0) return null;

  return (
    <div
      id="search-results-list"
      role="listbox"
      aria-label="Search results"
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-2">
        <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
          {getResultsCount(results.length)}
        </div>
        {results.map((post, index) => (
          <Link
            key={post.id}
            id={`search-result-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            href={`/${locale}/topics/${post.id}`}
            onClick={onResultClick}
            ref={el => { resultRefs.current[index] = el; }}
            className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-150 cursor-pointer ${
              index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1" title={post.title}>
                {post.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1" title={post.description}>
                {post.description}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                {post.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400">{tCommon('categories')}:</span>
                    {post.categories.slice(0, 2).map((category, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {category}
                      </span>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="text-xs text-gray-400">{tCommon('more', { count: post.categories.length - 2 })}</span>
                    )}
                  </div>
                )}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400">{tCommon('tags')}:</span>
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-gray-400">{tCommon('more', { count: post.tags.length - 2 })}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {query && (
        <div className="border-t border-gray-100 p-3">
          <Link
            href={`/${locale}/search?q=${encodeURIComponent(query)}`}
            onClick={onResultClick}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {tSeeAll}
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
