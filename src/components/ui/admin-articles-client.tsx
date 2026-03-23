'use client';

/**
 * Admin article moderation panel — list articles by status, approve or reject with optional reason.
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArticleStatusBadge } from './article-status-badge';
import ArticleRejectDialog from './article-reject-dialog';
import type { ArticleStatus } from '@prisma/client';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  locale: string;
  createdAt: string;
  author: { name: string };
}

const TABS: { label: string; value: ArticleStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All', value: 'ALL' },
];

export default function AdminArticlesClient({ locale }: { locale: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tab, setTab] = useState<ArticleStatus | 'ALL'>('PENDING');
  const [stats, setStats] = useState({ pending: 0, published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Article | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: '100' });
    if (tab !== 'ALL') qs.set('status', tab);
    const [res, pendingRes, publishedRes, totalRes] = await Promise.all([
      fetch(`/api/articles?${qs}`),
      fetch('/api/articles?status=PENDING&limit=1'),
      fetch('/api/articles?status=PUBLISHED&limit=1'),
      fetch('/api/articles?limit=1'),
    ]);
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    const [p, pub, tot] = await Promise.all([pendingRes.json(), publishedRes.json(), totalRes.json()]);
    setStats({ pending: p.pagination?.total ?? 0, published: pub.pagination?.total ?? 0, total: tot.pagination?.total ?? 0 });
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const review = async (id: string, action: 'approve' | 'reject', note = '') => {
    setActionLoading(true);
    await fetch(`/api/articles/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, note }) });
    setActionLoading(false);
    setRejectTarget(null);
    fetchArticles();
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'amber' },
          { label: 'Published', value: stats.published, color: 'green' },
          { label: 'Total Articles', value: stats.total, color: 'blue' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 bg-${color}-50 border border-${color}-200 rounded-xl text-center`}>
            <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
            <p className={`text-xs text-${color}-600 mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.value ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <p className="text-center py-12 text-gray-400">No articles in this category.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-medium text-gray-800 truncate">{a.title || '(Untitled)'}</span>
                  <ArticleStatusBadge status={a.status} />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{a.locale}</span>
                </div>
                <p className="text-xs text-gray-400">by {a.author.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/${locale}/articles/${a.slug}`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Preview</Link>
                {a.status === 'PENDING' && (
                  <>
                    <button onClick={() => review(a.id, 'approve')} disabled={actionLoading} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50 transition-colors">Approve</button>
                    <button onClick={() => setRejectTarget(a)} disabled={actionLoading} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors">Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <ArticleRejectDialog
          articleTitle={rejectTarget.title}
          loading={actionLoading}
          onConfirm={(note) => review(rejectTarget.id, 'reject', note)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
