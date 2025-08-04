import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

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

            {/* Search Bar in Hero */}
            <div className="max-w-md mx-auto mb-10">
              <SearchBar className="w-full" />
            </div>

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
                href="/categories"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Knowledge Articles</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">25+</div>
              <div className="text-gray-600">Technologies</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-rose-600 mb-2">24/7</div>
              <div className="text-gray-600">Always Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-800 mb-4">
              Popular Categories
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore the most valuable programming concepts, best practices, 
              and technical deep-dives organized by category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Category Card 1 - Programming Languages */}
            <Link 
              href="/categories"
              className="modern-card p-8 group hover:scale-105 bg-blue-50 border-blue-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                Programming Languages
              </h3>
              <p className="text-gray-600 mb-6">
                Master Java, JavaScript, TypeScript, Python and more with comprehensive 
                tutorials and best practices.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <span>Explore Languages</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Category Card 2 - Development Core */}
            <Link 
              href="/categories"
              className="modern-card p-8 group hover:scale-105 bg-purple-50 border-purple-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                Development Core
              </h3>
              <p className="text-gray-600 mb-6">
                Learn software architecture, design patterns, and core development 
                principles that every developer should know.
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <span>Learn Core Concepts</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Category Card 3 - Tools & AI */}
            <Link 
              href="/categories"
              className="modern-card p-8 group hover:scale-105 bg-emerald-50 border-emerald-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                Tools & AI
              </h3>
              <p className="text-gray-600 mb-6">
                Discover productivity tools, IDEs, AI technologies, and automation 
                that enhance your development workflow.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <span>Discover Tools</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-md text-gray-800 mb-8">
            Quick Access
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Articles
            </Link>
            <Link
              href="/tags"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Browse All Tags
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              All Articles
            </Link>
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