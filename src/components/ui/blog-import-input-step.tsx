'use client';

/**
 * Step 1 of blog import wizard: paste markdown or upload .md file.
 */
import { useState } from 'react';
import FileUploadZone from './FileUploadZone';

interface BlogImportInputStepProps {
  onNext: (content: string) => void;
}

export default function BlogImportInputStep({ onNext }: BlogImportInputStepProps) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      setContent(text);
      setError('');
    } catch {
      setError('Failed to read file');
    }
  };

  const handleNext = () => {
    if (!content.trim()) {
      setError('Please provide markdown content');
      return;
    }
    onNext(content);
  };

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setMode('paste')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${mode === 'paste' ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
          Paste Markdown
        </button>
        <button onClick={() => setMode('upload')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${mode === 'upload' ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
          Upload File
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {mode === 'paste' ? (
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setError(''); }}
          placeholder="Paste your markdown content here (with or without frontmatter)..."
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none"
        />
      ) : (
        <div>
          <FileUploadZone onFileSelect={handleFileSelect} onError={setError} />
          {content && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              File loaded ({content.length.toLocaleString()} characters)
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleNext} disabled={!content.trim()} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}
