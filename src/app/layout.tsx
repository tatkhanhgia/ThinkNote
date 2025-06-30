import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // Import Link
import "../styles/globals.css"; // Đảm bảo import globals.css ở đây

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Knowledge Base",
  description: "A personal knowledge base for programming topics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-400 min-h-screen text-gray-800`}
      >
        {/* Header Placeholder */}
        <header className="p-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md">
          <nav className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold text-white">KnowledgeBase</div>
            <div>
              {/* Navigation links can go here */}
              <Link href="/" className="text-white hover:text-purple-200 px-3">Home</Link>
              <Link href="/topics" className="text-white hover:text-purple-200 px-3">Topics</Link>
            </div>
          </nav>
        </header>

        <main className="container mx-auto p-4">
          {children}
        </main>

        {/* Footer Placeholder */}
        <footer className="p-4 mt-8 text-center text-white text-opacity-80">
          © {new Date().getFullYear()} My Knowledge Base. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
