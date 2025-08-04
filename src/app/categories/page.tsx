import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Categories - ThinkNote',
  description: 'Explore programming articles organized by categories and technologies.',
};

// Define main categories with their subcategories and colors
const CATEGORY_CONFIG = {
  'Programming Languages': {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '💻',
    subcategories: ['Java', 'JavaScript', 'TypeScript', 'Python', 'React']
  },
  'Development Core': {
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: '⚡',
    subcategories: ['DevCore', 'Architecture', 'Design Patterns', 'Best Practices']
  },
  'Tools & IDE': {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🛠️',
    subcategories: ['Tool', 'IDE', 'Extensions', 'Productivity']
  },
  'AI & Machine Learning': {
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: '🤖',
    subcategories: ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks']
  },
  'Frontend Development': {
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🎨',
    subcategories: ['Frontend', 'CSS', 'TailwindCSS', 'UI/UX', 'Responsive Design']
  },
  'Backend Development': {
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🔧',
    subcategories: ['Backend', 'API', 'Database', 'Server', 'Microservices']
  }
};

export default function CategoriesPage() {
  const allPosts = getSortedPostsData();
  
  // Get all tags from posts
  const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags || [])));
  
  // Group tags by categories
  const categorizedTags: { [key: string]: { tags: string[], count: number } } = {};
  
  Object.entries(CATEGORY_CONFIG).forEach(([categoryName, config]) => {
    const categoryTags = allTags.filter(tag => 
      config.subcategories.some(sub => 
        tag.toLowerCase().includes(sub.toLowerCase()) || 
        sub.toLowerCase().includes(tag.toLowerCase())
      )
    );
    
    const tagCounts = categoryTags.reduce((acc: { [key: string]: number }, tag) => {
      acc[tag] = allPosts.filter(post => post.tags?.includes(tag)).length;
      return acc;
    }, {});
    
    const totalCount = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);
    
    if (categoryTags.length > 0) {
      categorizedTags[categoryName] = {
        tags: categoryTags.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)),
        count: totalCount
      };
    }
  });

  // Uncategorized tags
  const categorizedTagsList = Object.values(categorizedTags).flatMap(cat => cat.tags);
  const uncategorizedTags = allTags.filter(tag => !categorizedTagsList.includes(tag));
  
  const uncategorizedCounts = uncategorizedTags.reduce((acc: { [key: string]: number }, tag) => {
    acc[tag] = allPosts.filter(post => post.tags?.includes(tag)).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-gray-800 mb-6">
            Knowledge Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore programming knowledge organized by categories. From languages and frameworks 
            to tools and best practices - find exactly what you're looking for.
          </p>
          
          {/* Stats */}
          <div className="mt-10 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{Object.keys(categorizedTags).length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{allTags.length}</div>
                  <div className="text-sm text-gray-600">Total Tags</div>
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

      {/* Categories Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {Object.entries(categorizedTags).map(([categoryName, data], index) => {
              const config = CATEGORY_CONFIG[categoryName as keyof typeof CATEGORY_CONFIG];
              return (
                <div
                  key={categoryName}
                  className={`modern-card p-8 hover:scale-105 ${config.color} border`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">{config.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{categoryName}</h3>
                      <p className="text-sm opacity-80">
                        {data.count} article{data.count !== 1 ? 's' : ''} across {data.tags.length} topic{data.tags.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {data.tags.slice(0, 6).map((tag) => {
                      const count = allPosts.filter(post => post.tags?.includes(tag)).length;
                      return (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/50 hover:bg-white/80 transition-colors"
                        >
                          <span>{tag}</span>
                          <span className="text-xs opacity-60">({count})</span>
                        </Link>
                      );
                    })}
                    {data.tags.length > 6 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/30">
                        +{data.tags.length - 6} more
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/tags`}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    Explore Category
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Uncategorized Tags */}
          {uncategorizedTags.length > 0 && (
            <div className="mb-16">
              <h2 className="heading-md text-gray-800 mb-8 text-center">
                Other Topics
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {uncategorizedTags.map((tag) => {
                  const count = uncategorizedCounts[tag] || 0;
                  return (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium text-gray-700">{tag}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Ready to dive deep into learning?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start exploring articles in your area of interest, or discover something completely new.
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
              View All Tags
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}