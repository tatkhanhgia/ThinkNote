import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import KnowledgeCard from '@/components/ui/KnowledgeCard';

export async function generateStaticParams() {
  const allPosts = getSortedPostsData();
  const categories = Array.from(new Set(allPosts.flatMap(post => post.categories || [])));
  
  return categories.map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${categoryName} Articles - ThinkNote`,
    description: `Browse all articles in the ${categoryName} category`,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const allPosts = getSortedPostsData();
  const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const filteredPosts = allPosts.filter(post => 
    post.categories?.some(cat => 
      cat.toLowerCase().replace(/\s+/g, '-') === params.category.toLowerCase()
    )
  );

  if (filteredPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="heading-lg text-gray-800 mb-4">No Articles Found</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            There are no articles in the "{categoryName}" category yet. 
            Check back soon for new content!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/categories" 
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Categories
            </Link>
            <Link 
              href="/topics" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse All Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/categories" className="hover:text-gray-700 transition-colors">
                Categories
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-600">{categoryName}</span>
            </nav>

            <h1 className="heading-xl text-gray-800 mb-6">
              {categoryName} Articles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in the {categoryName} category. 
              Dive deep into specialized knowledge and expert insights.
            </p>
            
            {/* Stats */}
            <div className="mt-10 flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{filteredPosts.length}</div>
                    <div className="text-sm text-gray-600">Articles</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600">
                      {Array.from(new Set(filteredPosts.flatMap(post => post.tags || []))).length}
                    </div>
                    <div className="text-sm text-gray-600">Related Tags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
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
                  categories={post.categories}
                  href={`/topics/${post.id}`}
                  gradientFrom={post.gradientFrom || 'from-purple-500'}
                  gradientTo={post.gradientTo || 'to-pink-600'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Explore More Categories
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover other categories and broaden your knowledge across different domains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="btn-primary"
            >
              All Categories
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse All Topics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}