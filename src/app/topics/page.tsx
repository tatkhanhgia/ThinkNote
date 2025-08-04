import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';

export const metadata = {
  title: 'All Topics - ThinkNote',
  description: 'Explore all programming topics, tutorials, and technical insights in one place.',
};

export default function TopicsPage() {
  const allPosts = getSortedPostsData();

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="heading-lg text-gray-800 mb-4">No Topics Found</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            It seems there are no knowledge articles available at the moment. 
            Check back soon for new content!
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
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-gray-800 mb-6">
            Explore All Topics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Dive deep into programming concepts, best practices, and the latest insights 
            from my continuous learning journey. Each article is crafted to provide 
            practical value and actionable knowledge.
          </p>
          
          {/* Stats */}
          <div className="mt-10 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{allPosts.length}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.from(new Set(allPosts.flatMap(post => post.tags || []))).length}
                  </div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post, index) => (
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
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            This knowledge base is constantly growing. If you have suggestions for topics 
            you'd like to see covered, feel free to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tags"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Browse by Tags
            </Link>
            <Link
              href="/"
              className="btn-primary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}