'use client';

/**
 * Step 2 of blog import wizard: configure metadata + preview markdown.
 */
import { useState } from 'react';
import { BLOG_MOODS, type BlogMood } from '@/lib/blog-moods';
import type { ExtractedBlogMeta } from '@/lib/blog-import-utils';
import CategoryTagInput from './category-tag-input';

interface BlogImportConfigureStepProps {
  extracted: ExtractedBlogMeta;
  rawContent: string;
  locale: string;
  onBack: () => void;
  onImport: (metadata: ImportMetadata) => Promise<void>;
}

export interface ImportMetadata {
  title: string;
  description: string;
  mood: string;
  tags: string[];
  coverImage: string;
  date: string;
  locale: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function BlogImportConfigureStep({
  extracted, rawContent, locale, onBack, onImport,
}: BlogImportConfigureStepProps) {
  const [title, setTitle] = useState(extracted.title);
  const [description, setDescription] = useState(extracted.description);
  const [mood, setMood] = useState(extracted.mood);
  const [tags, setTags] = useState<string[]>(extracted.tags);
  const [coverImage, setCoverImage] = useState(extracted.coverImage);
  const [date, setDate] = useState(extracted.date);
  const [postLocale, setPostLocale] = useState(locale);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const moodEntries = Object.entries(BLOG_MOODS) as [BlogMood, typeof BLOG_MOODS[BlogMood]][];

  const handleImport = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setImporting(true);
    setError('');
    try {
      await onImport({ title, description, mood, tags, coverImage, date, locale: postLocale, status });
    } catch {
      setError('Import failed. Please try again.');
      setImporting(false);
    }
  };

  // Truncate preview to avoid rendering huge content
  const previewText = rawContent.length > 3000 ? rawContent.slice(0, 3000) + '\n\n... (truncated)' : rawContent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Markdown Preview</h3>
        <pre className="w-full h-[500px] overflow-auto p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 whitespace-pre-wrap">
          {previewText}
        </pre>
      </div>

      {/* Right: Metadata form */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Metadata</h3>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog post title..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          {extracted.title && !extracted.mood && <p className="text-xs text-amber-600 mt-1">Auto-extracted from content</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
        </div>

        {/* Mood + Locale */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Select mood...</option>
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

        {/* Date + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="PUBLISHED">Publish Now</option>
              <option value="DRAFT">Save as Draft</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        {/* Tags */}
        <CategoryTagInput label="Tags" placeholder="Add tag..." value={tags} onChange={setTags} />

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button onClick={onBack} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button onClick={handleImport} disabled={importing || !title.trim()} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
            {importing ? 'Importing...' : 'Import Blog Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
