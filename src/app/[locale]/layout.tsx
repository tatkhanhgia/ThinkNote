import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Fira_Sans, Fira_Code } from 'next/font/google';
import SearchBar from "@/components/ui/SearchBar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LogoIcon from "@/components/ui/LogoIcon";
import HeaderNav from "@/components/ui/HeaderNav";
import AuthButton from "@/components/ui/auth-button";
import { Toaster } from 'sonner';
import "../../styles/globals.css";

const firaSans = Fira_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-sans',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code',
});

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
      <body className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800 antialiased ${firaSans.variable} ${firaCode.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Toaster richColors position="top-right" />
          {/* Skip to main content — accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
          >
            Skip to main content
          </a>
            {/* Modern Header */}
            <header className="sticky top-0 z-50 w-full glass border-b border-white/20">
            <div className="container mx-auto flex h-16 items-center px-6 gap-1 md:gap-2">
              {/* Logo */}
              <Link href={`/${locale}`} className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
                <div className="relative">
                  <LogoIcon className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  <div className="absolute -inset-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-sm"></div>
                </div>
                <span className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  ThinkNote
                </span>
              </Link>

              {/* Primary Nav — visible on md+ (tablets and up), right after logo */}
              <HeaderNav locale={locale} />

              {/* Spacer */}
              <div className="flex-1" />

              {/* Action buttons — search toggle, language, auth */}
              <div className="flex items-center gap-1 md:gap-3">
                <SearchBar mode="toggle" />
                <LanguageSwitcher />
                <AuthButton locale={locale} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main id="main-content" className="flex-1">
            {children}
          </main>

          {/* Modern Footer */}
          <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <LogoIcon className="w-6 h-6 text-blue-600" />
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