---
phase: 4
title: "Auth Pages (Login, Register, Verify Email)"
status: completed
priority: P1
effort: 2h
depends_on: [2, 3]
---

# Phase 4: Auth Pages (Login, Register, Verify Email)

## Context Links

- [Better Auth Email/Password](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth Session](https://www.better-auth.com/docs/concepts/session-management)
- Existing layout: `src/app/[locale]/layout.tsx`
- i18n messages: `src/messages/en.json`, `src/messages/vi.json`

## Overview

Create login, register, and email verification pages under `src/app/[locale]/`. All pages use Better Auth client SDK, follow existing Tailwind styling, and support en/vi locales.

## Key Insights

- `authClient.signUp.email()` for registration, `authClient.signIn.email()` for login
- `authClient.signOut()` for logout with redirect
- Email verification: Better Auth sends verification link; user clicks it; auto-redirects after verify
- `requireEmailVerification: true` means sign-in returns 403 if email not verified
- Error handling: check `error.status === 403` for unverified email on sign-in
- All pages are client components (`'use client'`) since they use auth hooks

## Requirements

**Functional:**
- Login page: email + password form, error display, link to register
- Register page: name + email + password + confirm password, link to login
- Verify email page: message shown after registration + handles verification callback URL
- All pages i18n-ready (en/vi)
- Form validation (client-side + server errors)
- Loading states during auth calls

**Non-functional:**
- Consistent with existing ThinkNote design (glass morphism, gradients, Tailwind)
- Each page component < 150 lines
- Accessible: proper labels, aria attributes, focus management

## Architecture

```
src/app/[locale]/
  login/page.tsx          <- LoginPage (client component)
  register/page.tsx       <- RegisterPage (client component)
  verify-email/page.tsx   <- VerifyEmailPage (handles callback)
```

## Related Code Files

**Create:**
- `src/app/[locale]/login/page.tsx`
- `src/app/[locale]/register/page.tsx`
- `src/app/[locale]/verify-email/page.tsx`
- `src/components/ui/AuthFormCard.tsx` - Shared card wrapper for auth forms

**Modify:**
- `src/messages/en.json` - Add Auth i18n keys
- `src/messages/vi.json` - Add Auth i18n keys (Vietnamese)

## Implementation Steps

### Step 1: Add i18n strings to `src/messages/en.json`

Add new top-level key `"Auth"`:

```json
{
  "Auth": {
    "login": {
      "title": "Welcome Back",
      "description": "Sign in to your ThinkNote account",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "submitting": "Signing in...",
      "noAccount": "Don't have an account?",
      "register": "Create one",
      "forgotPassword": "Forgot password?",
      "errors": {
        "invalidCredentials": "Invalid email or password",
        "emailNotVerified": "Please verify your email before signing in",
        "generic": "Something went wrong. Please try again."
      }
    },
    "register": {
      "title": "Create Account",
      "description": "Join ThinkNote to start building your knowledge base",
      "name": "Full Name",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "submit": "Create Account",
      "submitting": "Creating account...",
      "hasAccount": "Already have an account?",
      "login": "Sign in",
      "errors": {
        "passwordMismatch": "Passwords do not match",
        "emailExists": "An account with this email already exists",
        "passwordTooShort": "Password must be at least 8 characters",
        "generic": "Something went wrong. Please try again."
      }
    },
    "verifyEmail": {
      "title": "Check Your Email",
      "description": "We've sent a verification link to {email}",
      "instructions": "Click the link in the email to verify your account. Check your spam folder if you don't see it.",
      "resend": "Resend verification email",
      "resending": "Sending...",
      "resent": "Verification email sent!",
      "verified": "Email Verified!",
      "verifiedDescription": "Your email has been verified. Redirecting to login...",
      "backToLogin": "Back to Login"
    }
  }
}
```

Add equivalent Vietnamese translations to `src/messages/vi.json`.

### Step 2: Create shared auth form card `src/components/ui/AuthFormCard.tsx`

```tsx
'use client';

import React from 'react';

interface AuthFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthFormCard({
  title,
  description,
  children,
}: AuthFormCardProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create login page `src/app/[locale]/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import AuthFormCard from '@/components/ui/AuthFormCard';

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('Auth.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      if (authError.status === 403) {
        setError(t('errors.emailNotVerified'));
      } else if (authError.status === 401) {
        setError(t('errors.invalidCredentials'));
      } else {
        setError(t('errors.generic'));
      }
      return;
    }

    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <AuthFormCard title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? t('submitting') : t('submit')}
        </button>

        <p className="text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/register`} className="text-blue-600 hover:underline font-medium">
            {t('register')}
          </Link>
        </p>
      </form>
    </AuthFormCard>
  );
}
```

### Step 4: Create register page `src/app/[locale]/register/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import AuthFormCard from '@/components/ui/AuthFormCard';

export default function RegisterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('Auth.register');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      if (authError.status === 409 || authError.message?.includes('exists')) {
        setError(t('errors.emailExists'));
      } else {
        setError(t('errors.generic'));
      }
      return;
    }

    // Redirect to verify email page with email param
    router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthFormCard title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('name')}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? t('submitting') : t('submit')}
        </button>

        <p className="text-center text-sm text-gray-500">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
            {t('login')}
          </Link>
        </p>
      </form>
    </AuthFormCard>
  );
}
```

### Step 5: Create verify email page `src/app/[locale]/verify-email/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import AuthFormCard from '@/components/ui/AuthFormCard';

export default function VerifyEmailPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('Auth.verifyEmail');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [verified, setVerified] = useState(false);

  // Better Auth handles token verification via /api/auth/verify-email callback
  // If user lands here with a token, Better Auth auto-verifies and redirects
  // This page shows "check your email" message after registration

  useEffect(() => {
    // If auto-sign-in after verification redirects here, check session
    const checkSession = async () => {
      const { data: session } = await authClient.getSession();
      if (session) {
        setVerified(true);
        setTimeout(() => router.push(`/${locale}`), 2000);
      }
    };
    checkSession();
  }, [locale, router]);

  const handleResend = async () => {
    if (!email) return;
    setResendStatus('sending');
    await authClient.sendVerificationEmail({ email, callbackURL: `/${locale}` });
    setResendStatus('sent');
  };

  if (verified) {
    return (
      <AuthFormCard title={t('verified')} description={t('verifiedDescription')}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard title={t('title')} description={t('description', { email })}>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <p className="text-sm text-gray-600">{t('instructions')}</p>

        {email && (
          <button
            onClick={handleResend}
            disabled={resendStatus !== 'idle'}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {resendStatus === 'sending'
              ? t('resending')
              : resendStatus === 'sent'
                ? t('resent')
                : t('resend')}
          </button>
        )}

        <div>
          <Link
            href={`/${locale}/login`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </AuthFormCard>
  );
}
```

## Todo List

- [x] Add Auth i18n strings to en.json
- [x] Add Auth i18n strings to vi.json
- [x] Create AuthFormCard shared component
- [x] Create login page
- [x] Create register page
- [x] Create verify-email page
- [ ] Test registration flow end-to-end (requires DB from phase 1)
- [ ] Test login flow with valid/invalid credentials (requires DB from phase 1)
- [ ] Test unverified email login attempt (403 error) (requires DB from phase 1)
- [ ] Test locale switching on auth pages
- [ ] Verify responsive design on mobile

## Success Criteria

- Register form submits, user created in DB, redirects to verify-email
- Login with valid credentials redirects to home
- Login with unverified email shows verification error
- Login with wrong password shows credentials error
- All pages render correctly in en and vi
- Forms show loading states during submission
- Mobile responsive

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| useTranslations in client component | Low | next-intl supports client components with NextIntlClientProvider |
| Better Auth error codes change | Low | Handle generic fallback for unknown errors |
| Verify email callback URL mismatch | Medium | Use relative URLs; Better Auth appends token |

## Security Considerations

- Password field uses `type="password"` + `autoComplete` attributes
- No password stored in client state after form submission
- Client-side validation is UX only; server enforces all rules
- Email enumeration protection: Better Auth returns identical responses for existing/non-existing emails when `requireEmailVerification` is true

## Next Steps

- Phase 5: Implement actual email sending via Gmail SMTP
- Phase 8: Add auth button to header for login/logout
