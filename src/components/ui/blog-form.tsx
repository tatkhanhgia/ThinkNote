'use client';

/**
 * Blog post creation/editing form for admin.
 * Wraps TipTap editor + blog-specific fields (mood, date).
 * No categories/gradients — simplified from ArticleForm.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';
import CategoryTagInput from './category-tag-input';

const ArticleEditor = dynamic(() => import('./article-editor'), {
  ssr: false,
  loading: () => <div className="min-h-[400px] border border-gray-200 rounded-lg bg-gray-50 animate-pulse" />,
});

export interface BlogFormData {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  locale?: string;
  mood?: string;
  tags?: string[];
  coverImage?: string;
  status?: string;
  publishedAt?: string;
}

interface BlogFormProps {
  initialData?: BlogFormData;
  locale: string;
}

export default function BlogForm({ initialData, locale }: BlogFormProps) {
  const router = useRouter();
  const [postId, setPostId] = useState(initialData?.id);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [postLocale, setPostLocale] = useState(initialData?.locale ?? locale);
  const [mood, setMood] = useState(initialData?.mood ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPayload = useCallback(() => ({
    title, description, content, locale: postLocale,
    mood: mood || undefined,
    tags,
    coverImage: coverImage || undefined,
  }), [title, description, content, postLocale, mood, tags, coverImage]);

  const savePost = useCallback(async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!title.trim()) return;
    const isPublish = status === 'PUBLISHED';
    if (isPublish) setPublishing(true); else setSaving(true);
    setError('');
    try {
      let res;
      const payload = { ...buildPayload(), status };
      if (postId) {
        res = await fetch(`/api/blog/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setPostId(data.post.id);
        }
      }
      if (res?.ok) {
        setLastSaved(new Date());
        if (isPublish) router.push(`/${locale}/admin/blog`);
      } else {
        setError('Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }, [postId, buildPayload, title, locale, router]);

  // Auto-save 30s after last change
  useEffect(() => {
    if (!title.trim() || initialData?.status === 'PUBLISHED') return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => savePost('DRAFT'), 30_000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, description, content, mood, tags, savePost, initialData?.status]);

  const moodEntries = Object.entries(BLOG_MOODS) as [BlogMood, typeof BLOG_MOODS[BlogMood]][];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter blog title..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your blog post..." rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none" />
      </div>

      {/* Mood + Locale */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select a mood...</option>
            {moodEntries.map(([key, m]) => (
              <option key={key} value={key}>{m.icon} {locale === 'vi' ? m.vi : m.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={postLocale} onChange={(e) => setPostLocale(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="en">English</option>
            <option value="vi">Tieng Viet</option>
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
        <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
      </div>

      {/* Tags */}
      <CategoryTagInput label="Tags" placeholder="Add tag..." value={tags} onChange={setTags} />

      {/* Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <ArticleEditor content={content} onChange={setContent} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-400">
          {saving ? 'Saving...' : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved'}
        </span>
        <div className="flex gap-3">
          <button type="button" onClick={() => savePost('DRAFT')} disabled={saving || !title.trim()} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={() => savePost('PUBLISHED')} disabled={publishing || !title.trim()} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
            {publishing ? 'Publishing...' : initialData?.status === 'PUBLISHED' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
