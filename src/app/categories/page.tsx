import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Categories - ThinkNote',
  description: 'Explore programming articles organized by categories and technologies.',
};

export default function CategoriesPage() {
  const allPosts = getSortedPostsData();
  
  // Get all unique categories with their counts
  const categoryStats = allPosts.reduce((acc, post) => {
    if (post.categories) {
      post.categories.forEach(category => {
        if (!acc[category]) {
          acc[category] = { count: 0, posts: [] };
        }
        acc[category].count++;
        acc[category].posts.push(post);
      });
    }
    return acc;
  }, {} as Record<string, { count: number; posts: any[] }>);

  const categories = Object.entries(categoryStats).sort(([,a], [,b]) => b.count - a.count);

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Programming Languages': '💻',
    'DevCore': '⚡',
    'AI': '🤖',
    'Tool': '🛠️',
    'IDE': '🖥️',
    'Frontend': '🎨',
    'Backend': '⚙️',
    'Database': '💾',
    'Frameworks': '🏗️',
    'Java': '☕',
    'Libraries': '📚',
    'Development Core': '⚡',
  };

  // Category colors mapping
  const categoryColors: Record<string, string> = {
    'Programming Languages': 'bg-blue-100 text-blue-800 border-blue-200',
    'DevCore': 'bg-purple-100 text-purple-800 border-purple-200',
    'AI': 'bg-pink-100 text-pink-800 border-pink-200',
    'Tool': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'IDE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Frontend': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Backend': 'bg-gray-100 text-gray-800 border-gray-200',
    'Database': 'bg-green-100 text-green-800 border-green-200',
    'Frameworks': 'bg-orange-100 text-orange-800 border-orange-200',
    'Java': 'bg-amber-100 text-amber-800 border-amber-200',
    'Libraries': 'bg-teal-100 text-teal-800 border-teal-200',
    'Development Core': 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-gray-800 mb-6">
            Browse by Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore articles organized by specific domains and technologies. 
            Each category contains curated content to help you master different aspects of development.
          </p>
          
          {/* Stats */}
          <div className="mt-10 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{allPosts.length}</div>
                  <div className="text-sm text-gray-600">Total Articles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="heading-lg text-gray-800 mb-4">No Categories Found</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                No categories are available yet. Articles need to have categories defined.
              </p>
              <Link 
                href="/topics" 
                className="btn-primary inline-flex items-center gap-2"
              >
                Browse All Topics
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(([category, stats], index) => {
                const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
                const icon = categoryIcons[category] || '📁';
                const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
                
                return (
                  <div
                    key={category}
                    className="animate-in"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Link
                      href={`/categories/${categorySlug}`}
                      className={`modern-card p-6 group hover:scale-105 transition-all duration-300 block h-full border ${colorClass}`}
                    >
                      {/* Icon and Title */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="text-3xl">{icon}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{category}</h3>
                          <p className="text-sm opacity-80">
                            {stats.count} article{stats.count !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>

                      {/* Sample Articles */}
                      <div className="space-y-2 mb-6">
                        {stats.posts.slice(0, 2).map((post) => (
                          <div key={post.id} className="text-xs bg-white/50 rounded-lg p-2">
                            <div className="font-medium line-clamp-1">{post.title}</div>
                          </div>
                        ))}
                        {stats.count > 2 && (
                          <div className="text-xs opacity-60 text-center">
                            +{stats.count - 2} more article{stats.count - 2 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {stats.count}
                        </div>
                        <div className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="mr-2">Explore</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Want to explore more?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse all articles or search for specific topics that interest you most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/topics"
              className="btn-primary"
            >
              Browse All Articles
            </Link>
            <Link
              href="/tags"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Browse by Tags
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}