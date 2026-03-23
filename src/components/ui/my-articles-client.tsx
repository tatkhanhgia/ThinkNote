'use client';

/**
 * User "My Articles" dashboard — lists own articles with status tabs and action buttons.
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArticleStatusBadge } from './article-status-badge';
import type { ArticleStatus } from '@prisma/client';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  locale: string;
  createdAt: string;
  reviewNote?: string | null;
}

const TABS: { label: string; value: ArticleStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function MyArticlesClient({ userId, locale }: { userId: string; locale: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tab, setTab] = useState<ArticleStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ authorId: userId, limit: '100' });
    if (tab !== 'ALL') qs.set('status', tab);
    const res = await fetch(`/api/articles?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }, [userId, tab]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  const handleSubmit = async (id: string) => {
    await fetch(`/api/articles/${id}/submit`, { method: 'POST' });
    fetchArticles();
  };

  return (
    <div>
      {/* Tab filter */}
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
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-4">No articles yet.</p>
          <Link href={`/${locale}/articles/create`} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Write your first article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 truncate">{a.title || '(Untitled)'}</span>
                  <ArticleStatusBadge status={a.status} />
                </div>
                <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()} · {a.locale.toUpperCase()}</p>
                {a.status === 'REJECTED' && a.reviewNote && (
                  <p className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded"><span className="font-medium">Review note:</span> {a.reviewNote}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(a.status === 'DRAFT' || a.status === 'REJECTED') && (
                  <Link href={`/${locale}/articles/${a.slug}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Edit</Link>
                )}
                {a.status === 'PUBLISHED' && (
                  <Link href={`/${locale}/articles/${a.slug}`} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">View</Link>
                )}
                {a.status === 'DRAFT' && (
                  <button onClick={() => handleSubmit(a.id)} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Submit</button>
                )}
                {(a.status === 'DRAFT' || a.status === 'REJECTED') && (
                  <button onClick={() => handleDelete(a.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
