'use client';

/**
 * Admin blog management panel — list, filter, delete blog posts.
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  mood: string | null;
  locale: string;
  createdAt: string;
  publishedAt: string | null;
  author: { name: string };
}

type TabValue = 'ALL' | 'DRAFT' | 'PUBLISHED';

const TABS: { label: string; value: TabValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
];

export default function AdminBlogClient({ locale }: { locale: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tab, setTab] = useState<TabValue>('ALL');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: '100' });
    if (tab !== 'ALL') qs.set('status', tab);
    const res = await fetch(`/api/blog?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.pagination?.total ?? 0);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    setDeleting(null);
    if (!res.ok) {
      alert('Failed to delete blog post. Please try again.');
      return;
    }
    fetchPosts();
  };

  const moodDisplay = (mood: string | null) => {
    if (!mood) return null;
    const m = BLOG_MOODS[mood as BlogMood];
    return m ? `${m.icon} ${locale === 'vi' ? m.vi : m.en}` : mood;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Blog Posts</h2>
          <p className="text-sm text-gray-500">{total} total posts</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/admin/blog/import`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Import Markdown
          </Link>
          <Link href={`/${locale}/admin/blog/create`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Create Blog Post
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.value ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <p className="text-center py-12 text-gray-400">No blog posts found.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-medium text-gray-800 truncate">{p.title || '(Untitled)'}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                  {p.mood && <span className="text-xs text-gray-500">{moodDisplay(p.mood)}</span>}
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{p.locale}</span>
                </div>
                <p className="text-xs text-gray-400">
                  by {p.author.name} · {new Date(p.publishedAt || p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/${locale}/admin/blog/edit/${p.id}`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Edit
                </Link>
                <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors">
                  {deleting === p.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
