'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import AuthFormCard from '@/components/ui/auth-form-card';

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

  useEffect(() => {
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
    if (!email || resendStatus !== 'idle') return;
    setResendStatus('sending');
    await authClient.sendVerificationEmail({
      email,
      callbackURL: `/${locale}`,
    });
    setResendStatus('sent');
  };

  if (verified) {
    return (
      <AuthFormCard title={t('verified')} description={t('verifiedDescription')}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
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
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="text-sm text-gray-600">{t('instructions')}</p>

        {email && (
          <button
            onClick={handleResend}
            disabled={resendStatus !== 'idle'}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
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
