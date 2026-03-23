'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const FlagUS = () => (
  <svg className="w-5 h-4 rounded-sm flex-shrink-0" viewBox="0 0 20 16" aria-hidden="true">
    <rect width="20" height="16" fill="#B22234" />
    <rect y="1.23" width="20" height="1.23" fill="white" />
    <rect y="3.69" width="20" height="1.23" fill="white" />
    <rect y="6.15" width="20" height="1.23" fill="white" />
    <rect y="8.62" width="20" height="1.23" fill="white" />
    <rect y="11.08" width="20" height="1.23" fill="white" />
    <rect y="13.54" width="20" height="1.23" fill="white" />
    <rect width="8" height="8.62" fill="#3C3B6E" />
  </svg>
);

const FlagVI = () => (
  <svg className="w-5 h-4 rounded-sm flex-shrink-0" viewBox="0 0 20 16" aria-hidden="true">
    <rect width="20" height="16" fill="#DA251D" />
    <polygon points="10,3 11.2,6.8 15,6.8 11.9,9 13,12.8 10,10.5 7,12.8 8.1,9 5,6.8 8.8,6.8" fill="#FFFF00" />
  </svg>
);

const locales = [
  { code: 'en', name: 'English', Flag: FlagUS },
  { code: 'vi', name: 'Tiếng Việt', Flag: FlagVI },
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLocaleData = locales.find(l => l.code === currentLocale) || locales[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (locale: string) => {
    if (locale === currentLocale) { setIsOpen(false); return; }
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    window.location.href = `/${locale}${pathWithoutLocale}`;
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(locales.length - 1);
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, locales.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) switchLocale(locales[activeIndex].code);
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen(prev => !prev);
          setActiveIndex(-1);
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-listbox"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        <currentLocaleData.Flag />
        <span className="hidden sm:inline">{currentLocaleData.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="language-listbox"
          role="listbox"
          aria-label="Available languages"
          onKeyDown={handleDropdownKeyDown}
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="py-2">
            {locales.map((locale, index) => (
              <button
                key={locale.code}
                role="option"
                aria-selected={locale.code === currentLocale}
                onClick={() => switchLocale(locale.code)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${
                  index === activeIndex
                    ? 'bg-blue-50'
                    : locale.code === currentLocale
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${locale.code === currentLocale ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
              >
                <locale.Flag />
                <span>{locale.name}</span>
                {locale.code === currentLocale && (
                  <svg className="w-4 h-4 ml-auto text-blue-700" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
