'use client';

import { useSearchParams } from 'next/navigation';
import { getSortedPostsData } from '@/lib/posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const allPosts = getSortedPostsData();
  
  // Filter posts based on search query
  const filteredPosts = query 
    ? allPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-xl text-gray-800 mb-6">
              Search Results
            </h1>
            
            {query && (
              <div className="mb-8">
                <p className="text-xl text-gray-600 mb-4">
                  {filteredPosts.length > 0 
                    ? `Found ${filteredPosts.length} result${filteredPosts.length !== 1 ? 's' : ''} for` 
                    : 'No results found for'
                  }
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-semibold text-gray-800">"{query}"</span>
                </div>
              </div>
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
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <KnowledgeCard
                    title={post.title}
                    description={post.description}
                    tags={post.tags}
                    href={`/topics/${post.id}`}
                    gradientFrom={post.gradientFrom || 'from-blue-500'}
                    gradientTo={post.gradientTo || 'to-purple-600'}
                  />
                </div>
              ))}
            </div>
          ) : query ? (
            // No results found
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="heading-md text-gray-800 mb-4">
                No articles found
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find any articles matching your search. Try using different keywords or browse by categories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/topics"
                  className="btn-primary"
                >
                  Browse All Topics
                </Link>
                <Link
                  href="/tags"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          ) : (
            // No search query
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="heading-md text-gray-800 mb-4">
                Start your search
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Enter keywords to search through articles, or explore by categories and topics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/topics"
                  className="btn-primary"
                >
                  Browse All Topics
                </Link>
                <Link
                  href="/tags"
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