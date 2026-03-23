import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfileForm from '@/components/ui/profile-form';
import ChangePasswordForm from '@/components/ui/change-password-form';

export default async function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('Profile');

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <div className="space-y-8">
        <ProfileForm
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image || '',
            role: (session.user as { role?: string }).role || 'user',
            createdAt: session.user.createdAt.toISOString(),
          }}
          locale={locale}
        />

        <hr className="border-gray-200" />

        <ChangePasswordForm locale={locale} />
      </div>
    </div>
  );
}
