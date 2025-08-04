import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Browse Tags - ThinkNote',
  description: 'Explore articles by topic tags. Find programming tutorials organized by technology and concept.',
};

export default function TagsPage() {
  const allPosts = getSortedPostsData();
  
  // Extract all tags and count their occurrences
  const tagCounts = allPosts.reduce((acc: { [key: string]: number }, post) => {
    post.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  const tagColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-pink-100 text-pink-800 border-pink-200',
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  if (sortedTags.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h1 className="heading-lg text-gray-800 mb-4">No Tags Found</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            There are no tags available at the moment. Check back when articles are added!
          </p>
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-gray-800 mb-6">
            Browse by Tags
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover content organized by topics and technologies. Each tag represents 
            a collection of carefully curated articles and insights.
          </p>
          
          {/* Stats */}
          <div className="mt-10 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{sortedTags.length}</div>
                  <div className="text-sm text-gray-600">Tags</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{allPosts.length}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tags Cloud */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="heading-md text-gray-800 mb-4">
              Explore Topics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Click on any tag to see all related articles. The size indicates how many articles are available for each topic.
            </p>
          </div>

          {/* Popular Tags */}
          <div className="mb-16">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Most Popular Tags
            </h3>
            <div className="flex flex-wrap gap-4">
              {sortedTags.slice(0, 5).map(({ tag, count }, index) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className={`modern-card group px-6 py-4 hover:scale-105 ${getTagColor(index)} border`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-semibold text-lg">{tag}</span>
                    <span className="bg-white/50 text-xs px-2 py-1 rounded-full font-medium">
                      {count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* All Tags Grid */}
          <div className="mb-16">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Tags
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedTags.map(({ tag, count }, index) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className={`modern-card group p-4 hover:scale-105 ${getTagColor(index)} border`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">{tag}</span>
                    </div>
                    <span className="bg-white/50 text-xs px-2 py-1 rounded-full font-medium">
                      {count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Ready to dive into the topics?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start exploring articles by clicking on any tag above, or browse all topics 
            to discover comprehensive programming insights and tutorials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/topics"
              className="btn-primary"
            >
              View All Topics
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}