import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter } from 'next/font/google';
import SearchBar from "@/components/ui/SearchBar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import "../../styles/globals.css";

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Layout' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const t = await getTranslations('Layout');

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800 antialiased ${inter.className}`}>
        <NextIntlClientProvider messages={messages}>
          {/* Modern Header */}
          <header className="sticky top-0 z-50 w-full glass border-b border-white/20">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
              {/* Logo Section */}
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <div className="relative">
                  <svg 
                    className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="absolute -inset-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-sm"></div>
                </div>
                <span className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  ThinkNote
                </span>
              </Link>

              {/* Search Bar - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <SearchBar className="w-full" />
              </div>

              {/* Navigation & Language Switcher */}
              <div className="flex items-center gap-4">
                {/* Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                  <Link href={`/${locale}`} className="nav-link">
                    {t('navigation.home')}
                  </Link>
                  <Link href={`/${locale}/topics`} className="nav-link">
                    {t('navigation.topics')}
                  </Link>
                  <Link href={`/${locale}/categories`} className="nav-link">
                    {t('navigation.categories')}
                  </Link>
                </nav>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Mobile Menu Button */}
                <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden border-t border-white/20 p-4">
              <SearchBar className="w-full" />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Modern Footer */}
          <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-semibold text-gray-700">ThinkNote</span>
                </div>
                
                <p className="text-sm text-gray-500 text-center md:text-left">
                  {t('footer.copyright', { year: new Date().getFullYear() })}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{t('footer.builtWith')}</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
                <p>&copy; 2025 GiaTK. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}