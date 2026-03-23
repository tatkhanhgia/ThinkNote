'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import SearchResults from './SearchResults';

interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  [key: string]: any;
}

interface SearchBarProps {
  className?: string;
  mode?: 'inline' | 'toggle';
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '', mode = 'inline' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const locale = useLocale();
  const t = useTranslations('Layout.search');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/${locale}/api/posts`)
      .then(res => res.json())
      .then(posts => { setAllPosts(posts); setIsLoading(false); })
      .catch(err => { console.error('Error loading posts:', err); setIsLoading(false); });
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
        if (mode === 'toggle' && !query) setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode, query]);

  useEffect(() => { if (mode === 'toggle' && expanded) inputRef.current?.focus(); }, [mode, expanded]);
  useEffect(() => { setActiveIndex(-1); }, [results]);
  useEffect(() => {
    if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const closeToggle = () => { setExpanded(false); setIsOpen(false); setQuery(''); setResults([]); };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === '') { setResults([]); setIsOpen(false); return; }
    const q = searchQuery.toLowerCase();
    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags?.some(tag => tag.toLowerCase().includes(q)) ||
      post.categories?.some(cat => cat.toLowerCase().includes(q))
    );
    setResults(filtered.slice(0, 6));
    setIsOpen(true);
  };

  const handleResultClick = () => {
    setQuery(''); setResults([]); setIsOpen(false); setActiveIndex(-1);
    if (mode === 'toggle') setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(prev => Math.min(prev + 1, results.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setActiveIndex(prev => Math.max(prev - 1, -1)); break;
      case 'Enter': if (activeIndex >= 0) resultRefs.current[activeIndex]?.click(); break;
      case 'Escape':
        setIsOpen(false); setActiveIndex(-1);
        if (mode === 'toggle') closeToggle();
        break;
    }
  };

  const getResultsCount = (count: number) => t('resultsFound', { count, plural: count > 1 ? 's' : '' });

  // Toggle mode collapsed: show icon button only
  if (mode === 'toggle' && !expanded) {
    return (
      <div className={`relative ${className}`} ref={searchRef}>
        <button
          onClick={() => setExpanded(true)}
          className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          aria-label={t('placeholder')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    );
  }

  const searchContent = (
    <div className={mode === 'toggle' ? 'relative w-full max-w-lg mx-4' : `relative ${className}`} ref={searchRef}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isOpen && results.length > 0 ? `${results.length} result${results.length > 1 ? 's' : ''} found` : isOpen && query ? 'No results found' : ''}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef} type="text" role="combobox"
          aria-label={t('placeholder')} aria-expanded={isOpen}
          aria-controls="search-results-list"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-autocomplete="list" value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown} disabled={isLoading}
          placeholder={isLoading ? '...' : t('placeholder')}
          className={`w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm text-gray-800 placeholder-gray-500 disabled:opacity-60 ${mode === 'toggle' ? 'bg-white shadow-lg border-gray-200 py-3 text-base' : ''}`}
        />
        {mode === 'toggle' && (
          <button onClick={closeToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" aria-label="Close search">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {isLoading && mode !== 'toggle' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" role="status" aria-label="Loading search index">
            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <SearchResults
          results={results} query={query} activeIndex={activeIndex}
          locale={locale} resultRefs={resultRefs}
          onResultClick={handleResultClick} getResultsCount={getResultsCount}
          tCommon={(key, vals) => tCommon(key, vals)} tSeeAll={t('seeAllResults', { query })}
        />
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

  if (mode === 'toggle') {
    return (
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/20 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) closeToggle(); }}>
        {searchContent}
      </div>
    );
  }

  return searchContent;
};

export default SearchBar;
