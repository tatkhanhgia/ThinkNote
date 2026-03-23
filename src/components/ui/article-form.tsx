'use client';

/**
 * Full article creation/editing form.
 * Wraps TipTap editor + metadata fields with auto-save every 30s.
 * ArticleEditor loaded via dynamic import (ssr:false) to avoid hydration issues.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import CategoryTagInput from './category-tag-input';

const ArticleEditor = dynamic(() => import('./article-editor'), { ssr: false, loading: () => <div className="min-h-[400px] border border-gray-200 rounded-lg bg-gray-50 animate-pulse" /> });

export interface ArticleFormData {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  locale?: string;
  categories?: string[];
  tags?: string[];
  gradientFrom?: string;
  gradientTo?: string;
}

interface ArticleFormProps {
  initialData?: ArticleFormData;
  locale: string;
}

export default function ArticleForm({ initialData, locale }: ArticleFormProps) {
  const router = useRouter();
  const [articleId, setArticleId] = useState(initialData?.id);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [articleLocale, setArticleLocale] = useState(initialData?.locale ?? locale);
  const [categories, setCategories] = useState<string[]>(initialData?.categories ?? []);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [gradientFrom, setGradientFrom] = useState(initialData?.gradientFrom ?? '');
  const [gradientTo, setGradientTo] = useState(initialData?.gradientTo ?? '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPayload = useCallback(() => ({
    title, description, content, locale: articleLocale,
    categories, tags,
    gradientFrom: gradientFrom || undefined,
    gradientTo: gradientTo || undefined,
  }), [title, description, content, articleLocale, categories, tags, gradientFrom, gradientTo]);

  const saveArticle = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError('');
    try {
      let res;
      if (articleId) {
        res = await fetch(`/api/articles/${articleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      } else {
        res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
        if (res.ok) {
          const data = await res.json();
          setArticleId(data.article.id);
        }
      }
      if (res?.ok) setLastSaved(new Date());
      else setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [articleId, buildPayload, title]);

  // Auto-save 30s after last change (only when title exists)
  useEffect(() => {
    if (!title.trim()) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveArticle(), 30_000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, description, content, categories, tags, saveArticle]);

  const handleSubmitForReview = async () => {
    if (!articleId) { await saveArticle(); }
    if (!articleId && !title.trim()) { setError('Please add a title before submitting.'); return; }
    setSubmitting(true);
    setError('');
    try {
      // Ensure latest saved before submit
      const saveRes = await fetch(`/api/articles/${articleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      if (!saveRes.ok) { setError('Failed to save before submitting.'); return; }
      const res = await fetch(`/api/articles/${articleId}/submit`, { method: 'POST' });
      if (res.ok) router.push(`/${locale}/articles/my`);
      else { const d = await res.json(); setError(d.error ?? 'Submission failed.'); }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of the article..." rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none" />
      </div>

      {/* Locale */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={articleLocale} onChange={(e) => setArticleLocale(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card color start</label>
          <input type="color" value={gradientFrom || '#3b82f6'} onChange={(e) => setGradientFrom(e.target.value)} className="w-full h-[38px] px-1 py-0.5 border border-gray-300 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card color end</label>
          <input type="color" value={gradientTo || '#8b5cf6'} onChange={(e) => setGradientTo(e.target.value)} className="w-full h-[38px] px-1 py-0.5 border border-gray-300 rounded-lg cursor-pointer" />
        </div>
      </div>

      {/* Categories + Tags */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CategoryTagInput label="Categories" placeholder="Add category..." value={categories} onChange={setCategories} />
        <CategoryTagInput label="Tags" placeholder="Add tag..." value={tags} onChange={setTags} />
      </div>

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
          <button type="button" onClick={saveArticle} disabled={saving || !title.trim()} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={handleSubmitForReview} disabled={submitting || !title.trim()} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
