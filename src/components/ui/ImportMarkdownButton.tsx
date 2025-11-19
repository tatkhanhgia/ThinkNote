'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface ImportMarkdownButtonProps {
  className?: string;
  variant?: 'header' | 'hero';
}

const ImportMarkdownButton: React.FC<ImportMarkdownButtonProps> = ({ 
  className = '', 
  variant = 'header' 
}) => {
  const t = useTranslations('Layout');
  const tHome = useTranslations('HomePage');
  const router = useRouter();
  const locale = useLocale();

  const handleImportClick = () => {
    router.push(`/${locale}/markdown-import`);
  };

  if (variant === 'hero') {
    return (
      <button
        onClick={handleImportClick}
        className={`btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4 ${className}`}
        aria-label={tHome('hero.importMarkdown')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        {tHome('hero.importMarkdown')}
      </button>
    );
  }

  return (
    <button
      onClick={handleImportClick}
      className={`nav-link inline-flex items-center gap-2 ${className}`}
      aria-label={t('navigation.importMarkdown')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
      <span className="hidden xl:inline">{t('navigation.importMarkdown')}</span>
    </button>
  );
};

export default ImportMarkdownButton;