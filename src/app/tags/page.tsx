import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'All Tags - ThinkNote',
  description: 'Explore articles by topic tags. Find programming tutorials organized by technology and concept.',
};

// Define category mappings for better organization
const CATEGORY_MAPPINGS = {
  'Programming Languages': {
    keywords: ['java', 'javascript', 'typescript', 'python', 'react', 'c++', 'c#', 'php', 'ruby', 'go', 'rust'],
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '💻'
  },
  'Development Core': {
    keywords: ['devcore', 'architecture', 'design', 'patterns', 'best', 'practices', 'solid', 'clean'],
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '⚡'
  },
  'Tools & IDE': {
    keywords: ['tool', 'ide', 'editor', 'vscode', 'intellij', 'eclipse', 'setup', 'configuration'],
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🛠️'
  },
  'AI & Machine Learning': {
    keywords: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'ml', 'deep', 'neural', 'tensorflow', 'pytorch'],
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: '🤖'
  },
  'Frontend Development': {
    keywords: ['frontend', 'css', 'tailwindcss', 'ui', 'ux', 'responsive', 'html', 'sass', 'bootstrap'],
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🎨'
  },
  'Backend Development': {
    keywords: ['backend', 'api', 'database', 'server', 'microservices', 'nodejs', 'express', 'spring', 'django'],
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🔧'
  }
};

function getCategoryForTag(tag: string): { category: string; color: string; icon: string } | null {
  const tagLower = tag.toLowerCase();
  
  for (const [categoryName, config] of Object.entries(CATEGORY_MAPPINGS)) {
    if (config.keywords.some(keyword => 
      tagLower.includes(keyword) || keyword.includes(tagLower)
    )) {
      return {
        category: categoryName,
        color: config.color,
        icon: config.icon
      };
    }
  }
  
  return null;
}

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

  // Group tags by category
  const tagsByCategory: { [key: string]: typeof sortedTags } = {};
  const uncategorizedTags: typeof sortedTags = [];

  sortedTags.forEach(tagData => {
    const categoryInfo = getCategoryForTag(tagData.tag);
    if (categoryInfo) {
      if (!tagsByCategory[categoryInfo.category]) {
        tagsByCategory[categoryInfo.category] = [];
      }
      tagsByCategory[categoryInfo.category].push(tagData);
    } else {
      uncategorizedTags.push(tagData);
    }
  });

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
            All Tags
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
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{Object.keys(tagsByCategory).length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
            >
              <span>📋</span>
              Browse by Categories
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <span>🔍</span>
              Search Articles
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              <span>📚</span>
              All Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Tags by Category */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          {Object.entries(tagsByCategory).map(([categoryName, categoryTags]) => {
            const categoryConfig = CATEGORY_MAPPINGS[categoryName as keyof typeof CATEGORY_MAPPINGS];
            return (
              <div key={categoryName} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-2xl">{categoryConfig.icon}</span>
                  <h2 className="heading-md text-gray-800">{categoryName}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {categoryTags.length} tags
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryTags.map(({ tag, count }, index) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                      className={`modern-card group p-4 hover:scale-105 ${categoryConfig.color} border`}
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
            );
          })}

          {/* Uncategorized Tags */}
          {uncategorizedTags.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🏷️</span>
                <h2 className="heading-md text-gray-800">Other Tags</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {uncategorizedTags.length} tags
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {uncategorizedTags.map(({ tag, count }, index) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                    className="modern-card group p-4 hover:scale-105 bg-gray-100 text-gray-800 border-gray-200 border"
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
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Ready to dive into the topics?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start exploring articles by clicking on any tag above, or browse organized categories 
            to discover comprehensive programming insights and tutorials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="btn-primary"
            >
              Browse Categories
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All Topics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}