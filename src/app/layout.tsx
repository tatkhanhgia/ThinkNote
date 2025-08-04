import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "../styles/globals.css";

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
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 to-indigo-100 text-slate-800 min-h-screen`}>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto grid h-16 grid-cols-3 items-center px-4">
            <div />
            <div className="flex justify-center">
                <a href="/" className="flex items-center gap-3 text-blue-600">
                    {/* Icon SVG */}
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {/* Text */}
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">Knowledge Base</span>
                </a>
            </div>
            <nav className="flex items-center justify-end gap-6 text-sm">
              <Link
                href="/"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Home
              </Link>
              <Link
                href="/topics"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Topics
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="py-6 md:py-8">
          <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-slate-600 md:text-left">
              © {new Date().getFullYear()} My Knowledge Base. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
