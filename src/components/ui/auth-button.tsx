'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

export default function AuthButton({ locale }: { locale: string }) {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('Auth.button');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setOpen(false);
    router.push(`/${locale}`);
    router.refresh();
  };

  // Loading placeholder — prevents layout shift
  if (isPending) {
    return <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />;
  }

  // Unauthenticated state
  if (!session) {
    return (
      <Link
        href={`/${locale}/login`}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        {t('signIn')}
      </Link>
    );
  }

  // Authenticated — avatar with dropdown
  const user = session.user;
  const initial = user.name?.charAt(0).toUpperCase() ?? '?';
  const isAdmin = (user as { role?: string }).role === 'admin';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-200 hover:border-blue-400 flex items-center justify-center overflow-hidden transition-colors"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? ''} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-blue-600">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            href={`/${locale}/profile`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('profile')}
          </Link>

          <Link
            href={`/${locale}/articles/create`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('writeArticle')}
          </Link>

          <Link
            href={`/${locale}/articles/my`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('myArticles')}
          </Link>

          {isAdmin && (
            <Link
              href={`/${locale}/admin`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('admin')}
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
