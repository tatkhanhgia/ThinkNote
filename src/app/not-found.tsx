'use client';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-6">The page you are looking for doesn't exist.</p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}