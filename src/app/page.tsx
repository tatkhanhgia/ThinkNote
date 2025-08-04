import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative py-24 sm:py-32 text-white">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="heading-xl text-white mb-6">
              Welcome to Your
              <span className="block text-gradient mt-2">
                Knowledge Universe
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
              A beautifully crafted space where your programming insights, 
              code snippets, and technical wisdom come to life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/topics"
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Explore Topics
              </Link>
              
              <Link
                href="/tags"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Browse Tags
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Knowledge Articles</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
              <div className="text-gray-600">Programming Topics</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600">Always Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-800 mb-4">
              Featured Insights
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the most valuable programming concepts, best practices, 
              and technical deep-dives from my learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="modern-card p-8 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                React Deep Dive
              </h3>
              <p className="text-gray-600 mb-6">
                Master advanced React patterns, hooks, and performance optimization techniques 
                that every developer should know.
              </p>
              <Link 
                href="/topics" 
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="modern-card p-8 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                TailwindCSS Mastery
              </h3>
              <p className="text-gray-600 mb-6">
                Build stunning, responsive interfaces with utility-first CSS. 
                From basics to advanced design systems.
              </p>
              <Link 
                href="/topics" 
                className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="modern-card p-8 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                Next.js Essentials
              </h3>
              <p className="text-gray-600 mb-6">
                Everything you need to build modern web applications with server-side 
                rendering and static generation.
              </p>
              <Link 
                href="/topics" 
                className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-lg mb-6">
            Ready to explore the knowledge?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join me on this continuous learning journey. Every article is crafted 
            with care to help you grow as a developer.
          </p>
          <Link
            href="/topics"
            className="btn-primary bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg px-10 py-4"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  );
}