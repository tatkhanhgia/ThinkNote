import Link from 'next/link';

export default function HomePage() {
  return (
    // Opting for a light pastel gradient. Text colors will be adjusted for contrast.
    // Added !important to background gradient classes to increase specificity against global body background.
    // If !important is not desired, an alternative is to remove the `background` property from `body` in globals.css
    // or wrap the content in another div inside body that then gets the gradient.
    <div className="min-h-screen flex flex-col bg-red-500 text-slate-800">
      {/* Optional Navbar placeholder - can be developed later if needed */}
      {/* <header className="py-4 shadow-md">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold">KnowledgeBase</div>
          <div>
            <Link href="/topics" className="text-gray-300 hover:text-white px-3">Topics</Link>
            <Link href="/tags" className="text-gray-300 hover:text-white px-3">Tags</Link>
          </div>
        </nav>
      </header> */}

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center">
        <section className="container mx-auto px-6 py-20 sm:py-32 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight text-slate-900">
            <span className="block">Welcome to My</span>
            {/* Gradient text might be hard to read on pastel, switching to solid darker color for now, can be revisited */}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              Programming Knowledge Base
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto">
            Discover insights, tutorials, and code snippets accumulated over years of learning and practice.
          </p>
          <Link href="/topics"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-10 rounded-lg shadow-xl hover:from-purple-600 hover:to-pink-600 transition duration-300 transform hover:scale-105 text-lg">
            Explore Topics
          </Link>
        </section>
      </main>

      {/* Optional: Featured Content Section - Placeholder for now, styles would need adjustment for pastel theme */}
      {/* <section className="py-16 sm:py-24 bg-white/20 backdrop-blur-md"> // Example of a slightly transparent bg for cards
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16">
            Featured Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-purple-300/50 transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-purple-600 mb-3">Deep Dive into React</h3>
              <p className="text-slate-600">Unlock the full potential of React with advanced patterns and techniques.</p>
            </div>
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-pink-300/50 transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-pink-600 mb-3">Mastering TailwindCSS</h3>
              <p className="text-slate-600">Build beautiful, responsive UIs faster than ever before.</p>
            </div>
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-blue-300/50 transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-blue-600 mb-3">Next.js Essentials</h3>
              <p className="text-slate-600">Everything you need to get started with server-side rendering and static sites.</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 border-t border-slate-300/70">
        <p>&copy; {new Date().getFullYear()} My Knowledge Base. All rights reserved.</p>
      </footer>
    </div>
  );
}