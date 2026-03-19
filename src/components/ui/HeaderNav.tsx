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
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: `/${locale}`, label: t('navigation.home') },
    { href: `/${locale}/topics`, label: t('navigation.topics') },
    { href: `/${locale}/categories`, label: t('navigation.categories') },
    { href: `/${locale}/blog`, label: t('navigation.blog') },
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

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;

    const menuEl = menuContainerRef.current;
    if (!menuEl) return;

    const focusableEls = menuEl.querySelectorAll<HTMLElement>('a, button');
    if (focusableEls.length === 0) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    // Auto-focus first item when menu opens
    firstEl.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    menuEl.addEventListener('keydown', trapFocus);
    return () => menuEl.removeEventListener('keydown', trapFocus);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
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
        <div
          id="mobile-nav-menu"
          ref={menuContainerRef}
          className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-50"
        >
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-150 ${
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
