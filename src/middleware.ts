import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { getSessionCookie } from 'better-auth/cookies';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

// Routes requiring authentication (without locale prefix)
const protectedPaths = ['/admin', '/profile'];
// Routes only for unauthenticated users
const authOnlyPaths = ['/login', '/register'];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip auth API routes entirely
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Check session cookie (no DB call)
  const sessionCookie = getSessionCookie(request);
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  // 3. Redirect unauthenticated from protected routes
  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // 4. Redirect authenticated away from auth-only routes
  const isAuthOnly = authOnlyPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  if (isAuthOnly && sessionCookie) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 5. Run next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/api/auth/:path*',
  ],
};
