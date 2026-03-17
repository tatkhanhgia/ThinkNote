'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface HeaderNavProps {
  locale: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ locale }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Layout');
  const menuRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { href: `/${locale}`, label: t('navigation.home') },
    { href: `/${locale}/topics`, label: t('navigation.topics') },
    { href: `/${locale}/categories`, label: t('navigation.categories') },
  ];

  // Home only matches exact; others match prefix with trailing slash guard
  const isActive = (href: string) => {
    const exactHome = `/${locale}`;
    if (href === exactHome) return pathname === exactHome || pathname === `${exactHome}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Close on Escape and return focus to toggle button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        menuRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-8">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive(href) ? 'nav-link-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        ref={menuRef}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-menu"
      >
        {mobileOpen ? (
          // X icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Dropdown — fixed below 64px (h-16) sticky header, z-50 matches header */}
      {mobileOpen && (
        <div id="mobile-nav-menu" className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-50">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive(href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default HeaderNav;
