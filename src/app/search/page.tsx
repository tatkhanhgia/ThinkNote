import { Suspense } from 'react';
import SearchResults from './SearchResults';

export const metadata = {
  title: 'Search Results - ThinkNote',
  description: 'Search through programming articles and tutorials.',
};

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="h-10 bg-gray-200 rounded-lg mx-auto mb-6 max-w-md animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg mx-auto mb-4 max-w-2xl animate-pulse"></div>
        </div>
      </section>

      {/* Results Skeleton */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="modern-card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}