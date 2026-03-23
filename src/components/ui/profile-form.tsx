'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
    createdAt: string;
  };
  locale: string;
}

export default function ProfileForm({ user, locale }: ProfileFormProps) {
  const t = useTranslations('Profile');
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    const { error } = await authClient.updateUser({
      name,
      image: image || undefined,
    });

    setStatus(error ? 'error' : 'saved');
    if (!error) setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-500">
              {t('info.role')}: {user.role} &middot;{' '}
              {t('info.memberSince')}: {new Date(user.createdAt).toLocaleDateString(locale)}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('info.name')}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
            {t('info.avatar')}
          </label>
          <input
            id="avatar"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-400 mt-1">{t('info.avatarHelp')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'saving' ? t('actions.saving') : t('actions.save')}
          </button>
          {status === 'saved' && (
            <span className="text-sm text-green-600">{t('actions.saved')}</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">{t('actions.error')}</span>
          )}
        </div>
      </form>
    </div>
  );
}
