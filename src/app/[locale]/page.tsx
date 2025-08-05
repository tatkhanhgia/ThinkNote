import Link from "next/link";
import { useTranslations } from 'next-intl';
import SearchBar from "@/components/ui/SearchBar";

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  const t = useTranslations('HomePage');
  const tLayout = useTranslations('Layout');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative py-24 sm:py-32 text-white">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="heading-xl text-white mb-6">
              {t('hero.title')}
              <span className="block text-gradient mt-2">
                {t('hero.subtitle')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>

            {/* Search Bar in Hero */}
            <div className="max-w-md mx-auto mb-10">
              <SearchBar className="w-full" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/topics`}
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {t('hero.exploreTopics')}
              </Link>
              
              <Link
                href={`/${locale}/categories`}
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t('hero.browseCategories')}
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
              <div className="text-gray-600">{t('stats.articles')}</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
              <div className="text-gray-600">{t('stats.categories')}</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">25+</div>
              <div className="text-gray-600">{t('stats.technologies')}</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-rose-600 mb-2">24/7</div>
              <div className="text-gray-600">{t('stats.alwaysLearning')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="content-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-800 mb-4">
              {t('featuredCategories.title')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('featuredCategories.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Category Card 1 - Programming Languages */}
            <Link 
              href={`/${locale}/categories`}
              className="modern-card p-8 group hover:scale-105 bg-blue-50 border-blue-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                {t('featuredCategories.programmingLanguages.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('featuredCategories.programmingLanguages.description')}
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <span>{t('featuredCategories.programmingLanguages.action')}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Category Card 2 - Development Core */}
            <Link 
              href={`/${locale}/categories`}
              className="modern-card p-8 group hover:scale-105 bg-purple-50 border-purple-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                {t('featuredCategories.developmentCore.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('featuredCategories.developmentCore.description')}
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <span>{t('featuredCategories.developmentCore.action')}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Category Card 3 - Tools & AI */}
            <Link 
              href={`/${locale}/categories`}
              className="modern-card p-8 group hover:scale-105 bg-emerald-50 border-emerald-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="heading-md text-gray-800 mb-3">
                {t('featuredCategories.toolsAI.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('featuredCategories.toolsAI.description')}
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <span>{t('featuredCategories.toolsAI.action')}</span>
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
            {t('quickAccess.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/search`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('quickAccess.searchArticles')}
            </Link>
            <Link
              href={`/${locale}/tags`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('quickAccess.browseAllTags')}
            </Link>
            <Link
              href={`/${locale}/topics`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t('quickAccess.allArticles')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-lg mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link
            href={`/${locale}/topics`}
            className="btn-primary bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 text-lg px-10 py-4"
          >
            {t('cta.startExploring')}
          </Link>
        </div>
      </section>
    </div>
  );
}