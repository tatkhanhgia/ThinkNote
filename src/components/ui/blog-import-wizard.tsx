'use client';

/**
 * Multi-step blog import wizard: Input → Configure → Success.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractBlogMetadata, type ExtractedBlogMeta } from '@/lib/blog-import-utils';
import BlogImportInputStep from './blog-import-input-step';
import BlogImportConfigureStep, { type ImportMetadata } from './blog-import-configure-step';
import Link from 'next/link';

type Step = 'input' | 'configure' | 'success';

interface BlogImportWizardProps {
  locale: string;
}

export default function BlogImportWizard({ locale }: BlogImportWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [rawContent, setRawContent] = useState('');
  const [extracted, setExtracted] = useState<ExtractedBlogMeta | null>(null);
  const [importedTitle, setImportedTitle] = useState('');

  const handleInputNext = (content: string) => {
    setRawContent(content);
    setExtracted(extractBlogMetadata(content));
    setStep('configure');
  };

  const handleImport = async (metadata: ImportMetadata) => {
    const res = await fetch('/api/blog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: rawContent,
        locale: metadata.locale,
        metadata,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Import failed');
    }

    setImportedTitle(metadata.title);
    setStep('success');
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Input', 'Configure', 'Done'].map((label, i) => {
          const stepKeys: Step[] = ['input', 'configure', 'success'];
          const isActive = stepKeys.indexOf(step) >= i;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${isActive ? 'bg-blue-400' : 'bg-gray-200'}`} />}
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                  {i + 1}
                </span>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Steps */}
      {step === 'input' && (
        <BlogImportInputStep onNext={handleInputNext} />
      )}

      {step === 'configure' && extracted && (
        <BlogImportConfigureStep
          extracted={extracted}
          rawContent={rawContent}
          locale={locale}
          onBack={() => setStep('input')}
          onImport={handleImport}
        />
      )}

      {step === 'success' && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">&#10003;</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Import Successful!</h3>
          <p className="text-gray-500 mb-6">&ldquo;{importedTitle}&rdquo; has been imported.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setStep('input'); setRawContent(''); setExtracted(null); }} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Import Another
            </button>
            <Link href={`/${locale}/admin/blog`} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Back to Blog List
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
