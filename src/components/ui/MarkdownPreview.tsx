'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { StyleConverter } from '../markdown/StyleConverter';
import { ChunkedProcessor } from '../../lib/performance/ChunkedProcessor';
import { ContentSanitizer } from '../../lib/security/ContentSanitizer';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  showOriginal?: boolean;
  applyProjectStyling?: boolean;
  preserveOriginalClasses?: boolean;
}

interface MarkdownError {
  message: string;
  line?: number;
  column?: number;
}

export default function MarkdownPreview({ 
  content, 
  className = '', 
  showOriginal = false,
  applyProjectStyling = true,
  preserveOriginalClasses = false
}: MarkdownPreviewProps) {
  const [error, setError] = useState<MarkdownError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>('');

  // Process content when it changes
  useEffect(() => {
    if (!content || !content.trim()) {
      setProcessedContent('');
      setError(null);
      return;
    }

    setIsProcessing(true);
    setError(null);

    const processContent = async () => {
      try {
        // First sanitize the markdown content
        const sanitizationResult = ContentSanitizer.sanitizeMarkdown(content);
        
        // Check if we should use chunked processing for large content
        if (ChunkedProcessor.shouldUseChunkedProcessing(content.length, 100000)) {
          // Process in chunks for very large content
          const chunkResult = await ChunkedProcessor.processInChunks(
            sanitizationResult.sanitizedContent,
            async (chunk) => {
              const processor = remark()
                .use(remarkGfm)
                .use(remarkHtml, { sanitize: false });
              
              const result = await processor.process(chunk);
              return String(result);
            },
            {
              chunkSize: 50000,
              delayBetweenChunks: 5
            }
          );
          
          let htmlContent = chunkResult.results.join('');
          
          // Apply project-specific styling if enabled
          if (applyProjectStyling) {
            htmlContent = StyleConverter.convertToProjectFormat(htmlContent, {
              preserveOriginalClasses,
              applyProseClasses: true
            });
          }
          
          // Final sanitization of HTML
          const htmlSanitization = ContentSanitizer.sanitizeHtml(htmlContent);
          
          setProcessedContent(htmlSanitization.sanitizedContent);
        } else {
          // Process normally for smaller content
          const processor = remark()
            .use(remarkGfm)
            .use(remarkHtml, { sanitize: false });

          const result = processor.processSync(sanitizationResult.sanitizedContent);
          let htmlContent = String(result);

          // Apply project-specific styling if enabled
          if (applyProjectStyling) {
            htmlContent = StyleConverter.convertToProjectFormat(htmlContent, {
              preserveOriginalClasses,
              applyProseClasses: true
            });
          }
          
          // Final sanitization of HTML
          const htmlSanitization = ContentSanitizer.sanitizeHtml(htmlContent);

          setProcessedContent(htmlSanitization.sanitizedContent);
        }
        
        setIsProcessing(false);
      } catch (err) {
        const markdownError: MarkdownError = {
          message: err instanceof Error ? err.message : 'Unknown error occurred while processing markdown',
          line: undefined,
          column: undefined
        };

        // Try to extract line/column info if available
        if (err instanceof Error && err.message.includes(':')) {
          const match = err.message.match(/(\d+):(\d+)/);
          if (match) {
            markdownError.line = parseInt(match[1], 10);
            markdownError.column = parseInt(match[2], 10);
          }
        }

        setError(markdownError);
        setIsProcessing(false);
        setProcessedContent('');
      }
    };

    processContent();
  }, [content, applyProjectStyling, preserveOriginalClasses]);

  // Reset error when content changes
  useEffect(() => {
    if (!content || content.trim() === '') {
      setError(null);
    }
  }, [content]);

  if (isProcessing) {
    return (
      <div className={`markdown-preview ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600">Processing markdown...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`markdown-preview ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Markdown Processing Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
                {error.line && error.column && (
                  <p className="mt-1 font-mono text-xs">
                    Line {error.line}, Column {error.column}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content || !content.trim()) {
    return (
      <div className={`markdown-preview ${className}`}>
        <div className="text-center p-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">No content to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`markdown-preview ${className}`}>
      {showOriginal && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Markdown:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
            {content}
          </pre>
        </div>
      )}
      
      <div className="markdown-content">
        <div 
          className={applyProjectStyling ? '' : 'prose prose-lg max-w-none'}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    </div>
  );
}

// Export types for use in other components
export type { MarkdownPreviewProps, MarkdownError };