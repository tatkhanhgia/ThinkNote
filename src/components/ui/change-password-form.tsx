'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

export default function ChangePasswordForm({ locale: _locale }: { locale: string }) {
  const t = useTranslations('Profile.password');
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'changing' | 'changed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPw !== confirm) {
      setErrorMsg(t('mismatch'));
      return;
    }
    if (newPw.length < 8) {
      setErrorMsg(t('tooShort'));
      return;
    }

    setStatus('changing');

    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: newPw,
      revokeOtherSessions: true,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(t('wrongCurrent'));
      return;
    }

    setStatus('changed');
    setCurrent('');
    setNewPw('');
    setConfirm('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div>
          <label htmlFor="currentPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('current')}
          </label>
          <input
            id="currentPw"
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="current-password"
          />
        </div>

        <div>
          <label htmlFor="newPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('new')}
          </label>
          <input
            id="newPw"
            type="password"
            required
            minLength={8}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPw" className="block text-sm font-medium text-gray-700 mb-1">
            {t('confirm')}
          </label>
          <input
            id="confirmPw"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'changing'}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'changing' ? t('changing') : t('change')}
          </button>
          {status === 'changed' && (
            <span className="text-sm text-green-600">{t('changed')}</span>
          )}
        </div>
      </form>
    </div>
  );
}
