'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import KnowledgeCard from '@/components/ui/KnowledgeCard';
import Link from 'next/link';

interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  gradientFrom?: string;
  gradientTo?: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = useLocale();
  const t = useTranslations('Common');

  useEffect(() => {
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

  // Sync input with URL query param
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Filter posts based on search query
  const filteredPosts = query && allPosts.length > 0
    ? allPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        post.categories?.some(category => category.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  // Derive popular tags (top 8 by frequency) from loaded posts
  const popularTags = allPosts.length > 0
    ? Object.entries(
        allPosts.flatMap(p => p.tags || []).reduce<Record<string, number>>((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {})
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag)
    : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push(`/${locale}/search`);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <section className="page-header relative overflow-hidden py-16 sm:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="page-header relative overflow-hidden py-12 sm:py-16">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="heading-xl text-white mb-6">
              {query ? 'Search Results' : 'Search'}
            </h1>

            {/* Prominent search input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search articles, tags, categories..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus={!query}
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-6 py-3 flex-shrink-0"
              >
                Search
              </button>
            </form>

            {query && (
              <p className="mt-4 text-gray-300">
                {filteredPosts.length > 0
                  ? `Found ${filteredPosts.length} result${filteredPosts.length !== 1 ? 's' : ''} for `
                  : 'No results found for '}
                <span className="font-semibold text-white">&ldquo;{query}&rdquo;</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-in"
                  style={{
                    animationDelay: `${Math.min(index * 80, 400)}ms`,
                    animationFillMode: 'both'
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
          ) : query ? (
            // No results
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="heading-md text-gray-800 mb-2">No articles found</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try different keywords or browse by categories.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/${locale}/topics`} className="btn-primary">
                  Browse All Topics
                </Link>
                <Link
                  href={`/${locale}/categories`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          ) : (
            // Empty state — no query
            <div className="text-center py-8">
              <h2 className="heading-md text-gray-800 mb-2">Explore by Tag</h2>
              <p className="text-gray-600 mb-6">Popular topics to get you started</p>
              {popularTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {popularTags.map(tag => (
                    <Link
                      key={tag}
                      href={`/${locale}/tags/${encodeURIComponent(tag.toLowerCase())}`}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/${locale}/topics`} className="btn-primary">
                  Browse All Topics
                </Link>
                <Link
                  href={`/${locale}/categories`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
