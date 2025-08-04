import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-purple-900 to-blue-700 py-24 sm:py-32 text-white animate-gradient">
        {/* Decorative Blobs - Now using custom CSS classes */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="hero-blob-1" />
          <div className="hero-blob-2" />
        </div>

        <div className="w-full px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Welcome to Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 animate-text-gradient">
              Knowledge Base
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-200 sm:text-xl md:text-2xl">
            A centralized hub for your programming notes, code snippets, and technical articles.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/topics"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-blue-700 shadow-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Explore Topics
            </Link>
            <Link
              href="/tags"
              className="inline-flex items-center justify-center rounded-md border border-white bg-transparent px-8 py-3 text-base font-medium text-white shadow-sm transition-transform duration-200 hover:scale-105 hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Browse Tags
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16">
            Featured Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="transform rounded-xl bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Deep Dive into React</h3>
              <p className="text-slate-600">Unlock the full potential of React with advanced patterns and techniques.</p>
            </div>
            {/* Card 2 */}
            <div className="transform rounded-xl bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Mastering TailwindCSS</h3>
              <p className="text-slate-600">Build beautiful, responsive UIs faster than ever before.</p>
            </div>
            {/* Card 3 */}
            <div className="transform rounded-xl bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Next.js Essentials</h3>
              <p className="text-slate-600">Everything you need to get started with server-side rendering and static sites.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
