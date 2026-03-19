'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  gradientFrom?: string;
  gradientTo?: string;
  contentHtml?: string;
  [key: string]: any;
}

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const locale = useLocale();
  const t = useTranslations('Layout.search');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/${locale}/api/posts`)
      .then(res => res.json())
      .then(posts => {
        setAllPosts(posts);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading posts:', err);
        setIsLoading(false);
      });
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Scroll active result into view
  useEffect(() => {
    if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (searchQuery.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filteredResults = allPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.categories?.some(category => category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setResults(filteredResults.slice(0, 6));
    setIsOpen(true);
  };

  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
          resultRefs.current[activeIndex]?.click();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const getResultsCount = (count: number) => {
    const plural = count > 1 ? 's' : '';
    return t('resultsFound', { count, plural });
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Screen reader live region for result announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isOpen && results.length > 0
          ? `${results.length} result${results.length > 1 ? 's' : ''} found`
          : isOpen && query
          ? 'No results found'
          : ''}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          role="combobox"
          aria-label={t('placeholder')}
          aria-expanded={isOpen}
          aria-controls="search-results-list"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={isLoading ? '...' : t('placeholder')}
          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm text-gray-800 placeholder-gray-500 disabled:opacity-60"
        />
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" role="status" aria-label="Loading search index">
            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
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
                onClick={handleResultClick}
                ref={el => { resultRefs.current[index] = el; }}
                className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-150 cursor-pointer ${
                  index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1" title={post.title}>
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1" title={post.description}>
                    {post.description}
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-400">{tCommon('categories')}:</span>
                        {post.categories.slice(0, 2).map((category, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                        {post.categories.length > 2 && (
                          <span className="text-xs text-gray-400">
                            {tCommon('more', { count: post.categories.length - 2 })}
                          </span>
                        )}
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-400">{tCommon('tags')}:</span>
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            {tCommon('more', { count: post.tags.length - 2 })}
                          </span>
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
                onClick={handleResultClick}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('seeAllResults', { query })}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50" role="status">
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{t('noResults', { query })}</p>
            <p className="text-xs text-gray-400 mt-1">{t('tryDifferent')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
