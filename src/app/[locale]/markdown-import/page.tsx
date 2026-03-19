'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadZone from '../../../components/ui/FileUploadZone';
import MarkdownPreview from '../../../components/ui/MarkdownPreview';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';
import { MarkdownProcessor, type MarkdownMetadata } from '../../../lib/markdown/MarkdownProcessor';
import { MarkdownErrorHandler } from '../../../lib/markdown/MarkdownErrorHandler';
import { ErrorHandler } from '../../../lib/error-handling';
import { UndoManager } from '../../../lib/undo';
import { toast } from 'sonner';

interface ImportState {
  file: File | null;
  isProcessing: boolean;
  originalContent: string;
  previewContent: string;
  convertedContent: string;
  error: string | null;
  errorSuggestions: string[];
  step: 'upload' | 'preview' | 'processing' | 'complete';
  metadata: MarkdownMetadata | null;
  fileName: string;
  displayName: string;
  autoTranslate: boolean;
  autoFormat: boolean;
  formatChanges: string[];
  translatedPath: string;
  translationWarnings: string[];
  showFormatChanges: boolean;
}

export default function ImportMarkdownPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [state, setState] = useState<ImportState>({
    file: null,
    isProcessing: false,
    originalContent: '',
    previewContent: '',
    convertedContent: '',
    error: null,
    errorSuggestions: [],
    step: 'upload',
    metadata: null,
    fileName: '',
    displayName: '',
    autoTranslate: true,
    autoFormat: true,
    formatChanges: [],
    translatedPath: '',
    translationWarnings: [],
    showFormatChanges: false,
  });

  const handleFileSelect = useCallback(async (file: File) => {
    console.log('File selected:', file.name, file.size);

    // File validation is now handled by FileUploadZone
    console.log('File selected for processing:', file.name, file.size);

    setState(prev => ({
      ...prev,
      file,
      isProcessing: true,
      error: null,
      errorSuggestions: [],
      fileName: file.name, // Full filename with extension for API
      displayName: file.name.replace(/\.[^/.]+$/, '') // Display name without extension
    }));

    try {
      await ErrorHandler.withRetry(async () => {
        console.log('Reading file content...');
        // Read file content
        const content = await readFileContent(file);
        console.log('File content length:', content.length);

        // Validate content
        console.log('Starting content validation...');
        const validation = MarkdownProcessor.validateMarkdownContent(content);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
          console.error('Validation failed:', validation.errors);
          
          // Use the first error code to get localized error message
          const primaryErrorCode = validation.errorCodes[0] || 'PROCESSING_ERROR';
          const markdownError = MarkdownErrorHandler.createError(primaryErrorCode, validation.errors[0]);
          const formattedError = MarkdownErrorHandler.formatError(markdownError, locale);
          
          throw new Error(formattedError.message);
        }
        
        if (validation.warnings.length > 0) {
          console.warn('Validation warnings:', validation.warnings);
        }
        
        console.log('Content validation passed');

        // Extract metadata only (don't convert to HTML)
        console.log('Extracting metadata...');
        const metadataResult = await MarkdownProcessor.extractMetadataOnly(content);
        console.log('Metadata extraction completed');

        setState(prev => ({
          ...prev,
          isProcessing: false,
          originalContent: content,
          previewContent: content, // Keep original markdown for preview
          convertedContent: content, // Keep original markdown
          metadata: metadataResult.metadata,
          step: 'preview'
        }));
        console.log('State updated to preview step');
      }, { maxAttempts: 2 });
    } catch (error) {
      console.error('File processing error:', error);
      
      // Parse error and get suggestions
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = MarkdownErrorHandler.parseValidationError(errorMessage);
      const markdownError = MarkdownErrorHandler.createError(errorCode, errorMessage);
      const formattedError = MarkdownErrorHandler.formatError(markdownError, locale);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: formattedError.message,
        errorSuggestions: formattedError.suggestions
      }));
    }
  }, []);

  const handleError = useCallback((error: string) => {
    console.log('handleError called with:', error);
    
    // Parse error and get suggestions
    const errorCode = MarkdownErrorHandler.parseValidationError(error);
    const errorDetails = MarkdownErrorHandler.parseErrorDetails(error);
    const markdownError = MarkdownErrorHandler.createError(errorCode, errorDetails);
    const formattedError = MarkdownErrorHandler.formatError(markdownError, locale);
    
    console.log('Formatted error:', formattedError);
    
    setState(prev => ({ 
      ...prev, 
      error: formattedError.message,
      errorSuggestions: formattedError.suggestions
    }));
  }, [locale]);

  const handleConfirmImport = useCallback(async () => {
    if (!state.file || !state.convertedContent) return;

    setState(prev => ({ ...prev, isProcessing: true, step: 'processing' }));

    try {
      const result = await ErrorHandler.withRetry(async () => {
        console.log('Making API call to /api/markdown/import...');
        
        const requestBody = {
          fileName: state.fileName,
          content: state.originalContent,
          metadata: state.metadata,
          locale: locale,
          autoTranslate: state.autoTranslate,
          autoFormat: state.autoFormat,
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('/api/markdown/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('API success response:', result);
        return result;
      }, { maxAttempts: 3 });

      if (result.success && result.filePath) {
        setState(prev => ({
          ...prev,
          step: 'complete',
          isProcessing: false,
          formatChanges: result.formatChanges ?? [],
          translatedPath: result.translatedFilePath ?? '',
          translationWarnings: result.translationWarnings ?? [],
        }));

        // Show security warnings if any
        if (result.securityWarnings && result.securityWarnings.length > 0) {
          toast.error(locale === 'vi' ? 'Cảnh báo bảo mật' : 'Security Warning', {
            description: locale === 'vi'
              ? `Phát hiện các vấn đề bảo mật: ${result.securityWarnings.join(', ')}`
              : `Security issues detected: ${result.securityWarnings.join(', ')}`
          });
        }

        // Create undo action (includes translated file for deletion)
        const undoId = UndoManager.addAction(
          UndoManager.createFileImportUndo(result.filePath, result.fileName || state.fileName, result.translatedFilePath)
        );

        // Show success notification with undo option
        toast.success(locale === 'vi' ? 'Import thành công' : 'Import successful', {
          description: locale === 'vi'
            ? `File "${result.fileName || state.fileName}" đã được import thành công vào ${result.filePath}${result.processingTime ? ` (${Math.round(result.processingTime)}ms)` : ''}`
            : `File "${result.fileName || state.fileName}" has been successfully imported to ${result.filePath}${result.processingTime ? ` (${Math.round(result.processingTime)}ms)` : ''}`,
          action: {
            label: locale === 'vi' ? 'Hoàn tác' : 'Undo',
            onClick: async () => {
              try {
                const success = await UndoManager.undoAction(undoId);
                if (success) {
                  toast.success(locale === 'vi' ? 'Đã hoàn tác' : 'Undone');
                } else {
                  toast.error(locale === 'vi' ? 'Hoàn tác thất bại' : 'Undo failed');
                }
              } catch (error) {
                toast.error(locale === 'vi' ? 'Hoàn tác thất bại' : 'Undo failed', {
                  description: error instanceof Error ? error.message : (locale === 'vi' ? 'Lỗi không xác định' : 'Unknown error')
                });
              }
            }
          }
        });

        // Navigate back after success
        setTimeout(() => {
          router.push(`/${locale}`);
        }, 3000);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      
      // Parse error and get localized message
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = MarkdownErrorHandler.parseValidationError(errorMessage);
      const errorDetails = MarkdownErrorHandler.parseErrorDetails(errorMessage);
      const markdownError = MarkdownErrorHandler.createError(errorCode, errorDetails);
      const formattedError = MarkdownErrorHandler.formatError(markdownError, locale);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: formattedError.message,
        errorSuggestions: formattedError.suggestions,
        step: 'preview'
      }));

      // Show error notification with localized message
      toast.error(locale === 'vi' ? 'Lỗi import' : 'Import error', {
        description: formattedError.message,
        action: {
          label: locale === 'vi' ? 'Thử lại' : 'Try again',
          onClick: () => handleConfirmImport()
        }
      });
    }
  }, [state.file, state.convertedContent, state.fileName, state.metadata, state.originalContent, router]);

  const handleFileNameChange = useCallback((newName: string) => {
    // Update both display name and full filename
    const fileExtension = state.file ? state.file.name.substring(state.file.name.lastIndexOf('.')) : '.md';
    setState(prev => ({ 
      ...prev, 
      displayName: newName,
      fileName: newName + fileExtension
    }));
  }, [state.file]);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('FILE_READ_ERROR'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('FILE_READ_ERROR'));
      };
      
      reader.onabort = () => {
        reject(new Error('FILE_READ_ERROR'));
      };
      
      try {
        reader.readAsText(file, 'UTF-8');
      } catch (error) {
        reject(new Error('FILE_READ_ERROR'));
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleReset = () => {
    setState({
      file: null,
      isProcessing: false,
      originalContent: '',
      previewContent: '',
      convertedContent: '',
      error: null,
      errorSuggestions: [],
      step: 'upload',
      metadata: null,
      fileName: '',
      displayName: '',
      autoTranslate: true,
      autoFormat: true,
      formatChanges: [],
      translatedPath: '',
      translationWarnings: [],
      showFormatChanges: false,
    });
  };

  function renderStepContent() {
    switch (state.step) {
      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  {locale === 'vi' ? 'Import File Markdown' : 'Import Markdown File'}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {locale === 'vi' 
                    ? 'Chọn file Markdown (.md hoặc .markdown) để import vào hệ thống. File sẽ được xử lý và tối ưu hóa tự động để phù hợp với dự án.'
                    : 'Select a Markdown file (.md or .markdown) to import into the system. The file will be processed and optimized automatically to fit the project.'
                  }
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <FileUploadZone
                  onFileSelect={handleFileSelect}
                  onError={handleError}
                  disabled={state.isProcessing}
                />
              </div>

              {state.error && (
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                          {locale === 'vi' ? 'Lỗi xử lý file' : 'File Processing Error'}
                        </h3>
                        <p className="text-red-800 mb-4">{state.error}</p>
                        
                        {state.errorSuggestions.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-red-900 mb-2">
                              {locale === 'vi' ? 'Gợi ý khắc phục:' : 'Suggestions:'}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                              {state.errorSuggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => state.file && handleFileSelect(state.file)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                          >
                            {locale === 'vi' ? 'Thử lại' : 'Try Again'}
                          </button>
                          <button
                            onClick={() => setState(prev => ({ ...prev, error: null, errorSuggestions: [] }))}
                            className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                          >
                            {locale === 'vi' ? 'Đóng' : 'Dismiss'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.isProcessing && (
                <div className="mt-12 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-lg">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {locale === 'vi' ? 'Đang xử lý file' : 'Processing file'}
                    </h3>
                    <p className="text-gray-600 text-center max-w-md text-lg">
                      {locale === 'vi' 
                        ? 'Đang phân tích cấu trúc, xử lý nội dung và tối ưu hóa Markdown...'
                        : 'Analyzing structure, processing content and optimizing Markdown...'
                      }
                    </p>
                    <div className="mt-6 flex items-center space-x-3 text-blue-600">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {locale === 'vi' ? 'Vui lòng đợi trong giây lát' : 'Please wait a moment'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col xl:flex-row min-h-[calc(100vh-280px)]">
            {/* Top/Left Section - File Info */}
            <div className="flex-shrink-0 xl:w-96 border-b xl:border-b-0 xl:border-r border-gray-200 bg-gradient-to-b from-gray-50 to-blue-50/30 p-4 sm:p-6 overflow-y-auto max-h-80 xl:max-h-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                {/* File Name Input */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <label htmlFor="fileName" className="block text-sm font-semibold text-gray-900 mb-3">
                    {locale === 'vi' ? 'Tên file' : 'File name'}
                  </label>
                  <input
                    id="fileName"
                    type="text"
                    value={state.displayName}
                    onChange={(e) => handleFileNameChange(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder={locale === 'vi' ? 'Nhập tên file' : 'Enter file name'}
                  />
                </div>

                {/* File Stats */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {locale === 'vi' ? 'Thông tin file' : 'File information'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        {locale === 'vi' ? 'Kích thước:' : 'Size:'}
                      </span>
                      <span className="font-semibold text-gray-900">{state.file ? formatFileSize(state.file.size) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        {locale === 'vi' ? 'Dòng:' : 'Lines:'}
                      </span>
                      <span className="font-semibold text-gray-900">{state.originalContent ? state.originalContent.split('\n').length.toLocaleString() : 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">
                        {locale === 'vi' ? 'Ký tự:' : 'Characters:'}
                      </span>
                      <span className="font-semibold text-gray-900">{state.originalContent ? state.originalContent.length.toLocaleString() : 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Options */}
              <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  {locale === 'vi' ? 'Tùy chọn import' : 'Import Options'}
                </h4>
                <label className="flex items-center space-x-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.autoFormat}
                    onChange={e => setState(prev => ({ ...prev, autoFormat: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {locale === 'vi' ? 'Tự động định dạng markdown' : 'Auto-format markdown'}
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.autoTranslate}
                    onChange={e => setState(prev => ({ ...prev, autoTranslate: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {locale === 'vi' ? 'Tự động dịch sang tiếng Anh' : 'Auto-translate to Vietnamese'}
                  </span>
                </label>
              </div>

              {/* Metadata Display */}
              {state.metadata && Object.keys(state.metadata).length > 0 && (
                <div className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Metadata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
                    {Object.entries(state.metadata).map(([key, value]) => (
                      <div key={key} className="bg-white/60 rounded-xl p-3 sm:p-4 border border-blue-200/50">
                        <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">{key}</div>
                        <div className="text-sm text-gray-800 break-words">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom/Right Section - Preview */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {locale === 'vi' ? 'Xem trước nội dung' : 'Content preview'}
                </h3>
                <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">
                    {locale === 'vi' ? 'Xem trước' : 'Preview'}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white">
                <MarkdownPreview
                  content={state.originalContent}
                  className="p-4 sm:p-6 lg:p-8 min-h-full max-w-none"
                  applyProjectStyling={true}
                />
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="max-w-lg text-center">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-10 mx-auto"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {locale === 'vi' ? 'Đang import file' : 'Importing file'}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {locale === 'vi' 
                  ? 'Đang lưu file và áp dụng các tối ưu hóa. Vui lòng đợi trong giây lát...'
                  : 'Saving file and applying optimizations. Please wait a moment...'
                }
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center justify-center space-x-3 text-blue-600">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-lg font-medium">
                    {locale === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="max-w-lg w-full text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-xl">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'vi' ? 'Import thành công!' : 'Import successful!'}
              </h2>
              <div className="space-y-3 mt-4 text-left">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-sm text-green-800">
                  <div className="font-semibold mb-2">
                    {locale === 'vi' ? 'File đã lưu:' : 'Files saved:'}
                  </div>
                  <div className="font-mono text-xs">{state.fileName}</div>
                  {state.translatedPath && (
                    <div className="font-mono text-xs mt-1 text-blue-700">
                      {state.translatedPath} ({locale === 'vi' ? 'đã dịch' : 'translated'})
                    </div>
                  )}
                </div>
                {state.translationWarnings.length > 0 && (
                  <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 text-sm text-yellow-800">
                    <div className="font-semibold mb-2">
                      {locale === 'vi' ? 'Cảnh báo dịch:' : 'Translation warnings:'}
                    </div>
                    {state.translationWarnings.map((w, i) => <div key={i} className="text-xs">{w}</div>)}
                  </div>
                )}
                {state.formatChanges.length > 0 && (
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 text-sm">
                    <button
                      className="font-semibold text-blue-800 w-full text-left flex justify-between"
                      onClick={() => setState(prev => ({ ...prev, showFormatChanges: !prev.showFormatChanges }))}
                    >
                      <span>
                        {state.formatChanges.length} {locale === 'vi' ? 'thay đổi định dạng' : 'format change(s) applied'}
                      </span>
                      <span>{state.showFormatChanges ? '▲' : '▼'}</span>
                    </button>
                    {state.showFormatChanges && (
                      <ul className="mt-2 space-y-1">
                        {state.formatChanges.map((c, i) => <li key={i} className="text-xs text-blue-700">• {c}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  function getStepIndex(step: ImportState['step']): number {
    const steps = ['upload', 'preview', 'processing', 'complete'];
    return steps.indexOf(step);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {locale === 'vi' ? 'Import Markdown' : 'Import Markdown'}
                </h1>
              </div>
            </div>
            {state.step === 'preview' && (
              <button
                onClick={handleReset}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="hidden sm:inline">
                  {locale === 'vi' ? 'Chọn file khác' : 'Choose another file'}
                </span>
                <span className="sm:hidden">
                  {locale === 'vi' ? 'File khác' : 'Other file'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {['upload', 'preview', 'processing', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm
                    ${getStepIndex(state.step) > index
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200'
                      : getStepIndex(state.step) === index
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200 ring-4 ring-blue-100'
                        : 'bg-white text-gray-500 border-2 border-gray-300'
                    }
                  `}>
                    {getStepIndex(state.step) > index ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${getStepIndex(state.step) >= index ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step === 'upload' && (locale === 'vi' ? 'Chọn file' : 'Select file')}
                    {step === 'preview' && (locale === 'vi' ? 'Xem trước' : 'Preview')}
                    {step === 'processing' && (locale === 'vi' ? 'Xử lý' : 'Processing')}
                    {step === 'complete' && (locale === 'vi' ? 'Hoàn thành' : 'Complete')}
                  </span>
                </div>
                {index < 3 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-1 rounded-full transition-all duration-500 ${getStepIndex(state.step) > index
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gray-200'
                      }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto pb-24">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      {state.step === 'preview' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setState(prev => ({ ...prev, step: 'upload' }))}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                disabled={state.isProcessing}
              >
                {locale === 'vi' ? 'Quay lại' : 'Go back'}
              </button>
              <button
                onClick={handleConfirmImport}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={state.isProcessing || !state.displayName.trim()}
              >
                {state.isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{locale === 'vi' ? 'Đang import...' : 'Importing...'}</span>
                  </div>
                ) : (
                  locale === 'vi' ? 'Import File' : 'Import File'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}