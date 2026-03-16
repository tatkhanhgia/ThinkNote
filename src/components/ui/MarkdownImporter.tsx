'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import FileUploadZone from './FileUploadZone';
import MarkdownPreview from './MarkdownPreview';
import ErrorDisplay from './ErrorDisplay';
import { MarkdownProcessor, type MarkdownMetadata } from '../../lib/markdown/MarkdownProcessor';
import { ErrorHandler } from '../../lib/error-handling';
import { UndoManager } from '../../lib/undo';
import { useNotifications } from '../../contexts/NotificationContext';

interface MarkdownImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (filePath: string) => void;
}

interface ImportState {
  file: File | null;
  isProcessing: boolean;
  originalContent: string;
  previewContent: string;
  convertedContent: string;
  error: string | null;
  step: 'upload' | 'preview' | 'processing' | 'complete';
  metadata: MarkdownMetadata | null;
  fileName: string;
}

export const MarkdownImporter: React.FC<MarkdownImporterProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const t = useTranslations('markdown-import');
  const tNotifications = useTranslations('markdown-import.notifications');
  const modalRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useNotifications();

  const [state, setState] = useState<ImportState>({
    file: null,
    isProcessing: false,
    originalContent: '',
    previewContent: '',
    convertedContent: '',
    error: null,
    step: 'upload',
    metadata: null,
    fileName: ''
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setState({
        file: null,
        isProcessing: false,
        originalContent: '',
        previewContent: '',
        convertedContent: '',
        error: null,
        step: 'upload',
        metadata: null,
        fileName: ''
      });
    }
  }, [isOpen]);



  const handleFileSelect = useCallback(async (file: File) => {
    console.log('File selected:', file.name, file.size);

    setState(prev => ({
      ...prev,
      file,
      isProcessing: true,
      error: null,
      fileName: file.name.replace(/\.[^/.]+$/, '') // Remove extension
    }));

    try {
      await ErrorHandler.withRetry(async () => {
        console.log('Reading file content...');
        // Read file content as base64
        const base64Content = await readFileContent(file);
        console.log('File content base64 length:', base64Content.length);

        // Decode base64 to text for validation and preview
        const textContent = decodeBase64ToText(base64Content);
        console.log('Decoded text content length:', textContent.length);

        // Validate content
        const validation = MarkdownProcessor.validateMarkdownContent(textContent);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        console.log('Content validation passed');

        // Extract metadata only (don't convert to HTML)
        console.log('Extracting metadata...');
        const metadataResult = await MarkdownProcessor.extractMetadataOnly(textContent);
        console.log('Metadata extraction completed');

        setState(prev => ({
          ...prev,
          isProcessing: false,
          originalContent: base64Content, // Store base64 for sending to API
          previewContent: textContent, // Store decoded text for preview
          convertedContent: base64Content, // Store base64 for sending
          metadata: metadataResult.metadata,
          step: 'preview'
        }));
        console.log('State updated to preview step');
      }, { maxAttempts: 2 });
    } catch (error) {
      console.error('File processing error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  }, []);

  const handleError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const handleCancel = useCallback(() => {
    console.log('handleCancel called');
    // Clean up any temporary data
    setState({
      file: null,
      isProcessing: false,
      originalContent: '',
      previewContent: '',
      convertedContent: '',
      error: null,
      step: 'upload',
      metadata: null,
      fileName: ''
    });
    onClose();
  }, [onClose]);

  // Handle basic modal behavior
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !isOpen) return;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Basic escape key handling
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleCancel]);

  const handleConfirmImport = useCallback(async () => {
    if (!state.file || !state.convertedContent) return;

    setState(prev => ({ ...prev, isProcessing: true, step: 'processing' }));

    try {
      const result = await ErrorHandler.withRetry(async () => {
        const response = await fetch('/api/markdown/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: state.fileName,
            content: state.originalContent, // Send base64 encoded content
            isBase64: true, // Flag to indicate base64 encoding
            metadata: state.metadata,
            locale: 'vi' // Default to Vietnamese, can be made dynamic later
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      }, { maxAttempts: 3 });

      if (result.success && result.filePath) {
        setState(prev => ({ ...prev, step: 'complete', isProcessing: false }));

        // Show security warnings if any
        if (result.securityWarnings && result.securityWarnings.length > 0) {
          showError(
            tNotifications('security.title'),
            tNotifications('security.message', {
              warnings: result.securityWarnings.join(', ')
            })
          );
        }

        // Create undo action
        const undoId = UndoManager.addAction(
          UndoManager.createFileImportUndo(result.filePath, result.fileName || state.fileName)
        );

        // Show success notification with undo option
        showSuccess(
          tNotifications('success.title'),
          tNotifications('success.message', {
            fileName: result.fileName || state.fileName,
            filePath: result.filePath,
            processingTime: result.processingTime ? `${Math.round(result.processingTime)}ms` : ''
          }),
          [{
            label: tNotifications('success.undoLabel'),
            onClick: async () => {
              try {
                const success = await UndoManager.undoAction(undoId);
                if (success) {
                  showSuccess(
                    tNotifications('undo.success'),
                    ''
                  );
                } else {
                  showError(
                    tNotifications('undo.failed'),
                    ''
                  );
                }
              } catch (error) {
                showError(
                  tNotifications('undo.failed'),
                  error instanceof Error ? error.message : 'Unknown error'
                );
              }
            },
            variant: 'secondary' as const
          }]
        );

        // Close modal after a moment
        setTimeout(() => {
          onImportSuccess(result.filePath!);
          handleCancel();
        }, 2000);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : String(error),
        step: 'preview'
      }));

      // Show error notification
      const errorInfo = ErrorHandler.formatErrorForUser(error);
      showError(
        tNotifications('error.title'),
        errorInfo.message,
        errorInfo.canRetry ? [{
          label: tNotifications('error.retryLabel'),
          onClick: () => handleConfirmImport(),
          variant: 'primary' as const
        }] : undefined
      );
    }
  }, [state.file, state.convertedContent, state.fileName, state.metadata, state.originalContent, onImportSuccess, handleCancel, showSuccess, showError, tNotifications]);

  const handleFileNameChange = useCallback((newName: string) => {
    setState(prev => ({ ...prev, fileName: newName }));
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer instead of text
    });
  };

  const decodeBase64ToText = (base64: string): string => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      console.error('Failed to decode base64:', error);
      return '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) {
    console.log('Modal is closed');
    return null;
  }

  console.log('Modal is rendering, step:', state.step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal - Near full page size */}
      <div
        ref={modalRef}
        className="relative w-full h-full max-w-[98vw] max-h-[98vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('modal.title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {t('modal.description')}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 hover:shadow-md group"
            aria-label={t('modal.close')}
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator - Compact */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['upload', 'preview', 'processing', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm
                    ${getStepIndex(state.step) > index
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200'
                      : getStepIndex(state.step) === index
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200 ring-2 sm:ring-4 ring-blue-100'
                        : 'bg-white text-gray-500 border-2 border-gray-300'
                    }
                  `}>
                    {getStepIndex(state.step) > index ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-1 sm:mt-2 text-xs font-medium ${getStepIndex(state.step) >= index ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {t(`steps.${step}.title`)}
                  </span>
                </div>
                {index < 3 && (
                  <div className="flex-1 mx-2 sm:mx-4">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {renderStepContent()}
        </div>

        {/* Footer - Compact */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
            disabled={state.isProcessing}
          >
            {t('modal.cancel')}
          </button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {state.step === 'preview' && (
              <>
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 'upload' }))}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
                  disabled={state.isProcessing}
                >
                  {t('modal.back')}
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={state.isProcessing || !state.fileName.trim()}
                >
                  {state.isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('modal.importing')}</span>
                    </div>
                  ) : (
                    t('modal.import')
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderStepContent() {
    switch (state.step) {
      case 'upload':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Chọn file Markdown để import</h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Hỗ trợ file .md và .markdown. File sẽ được xử lý và tối ưu hóa tự động để phù hợp với dự án.
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    <FileUploadZone
                      onFileSelect={handleFileSelect}
                      onError={handleError}
                      disabled={state.isProcessing}
                    />
                  </div>
                </div>

                {state.error && (
                  <div className="mt-6">
                    <ErrorDisplay
                      error={state.error}
                      onRetry={() => state.file && handleFileSelect(state.file)}
                      onDismiss={() => setState(prev => ({ ...prev, error: null }))}
                    />
                  </div>
                )}

                {state.isProcessing && (
                  <div className="mt-8 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Đang xử lý file</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Đang phân tích cấu trúc, xử lý nội dung và tối ưu hóa Markdown...
                    </p>
                    <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Vui lòng đợi trong giây lát</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Top/Left Section - File Info */}
            <div className="flex-shrink-0 lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-b from-gray-50 to-blue-50/30 p-4 overflow-y-auto max-h-60 lg:max-h-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* File Name Input */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label htmlFor="fileName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Tên file
                  </label>
                  <input
                    id="fileName"
                    type="text"
                    value={state.fileName}
                    onChange={(e) => handleFileNameChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Nhập tên file"
                  />
                </div>

                {/* File Stats */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin file</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Kích thước:</span>
                      <span className="font-medium">{state.file ? formatFileSize(state.file.size) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dòng:</span>
                      <span className="font-medium">{state.previewContent ? state.previewContent.split('\n').length.toLocaleString() : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ký tự:</span>
                      <span className="font-medium">{state.previewContent ? state.previewContent.length.toLocaleString() : 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Display */}
              {state.metadata && Object.keys(state.metadata).length > 0 && (
                <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Metadata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {Object.entries(state.metadata).map(([key, value]) => (
                      <div key={key} className="bg-white/60 rounded-lg p-3 border border-blue-200/50">
                        <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">{key}</div>
                        <div className="text-sm text-gray-800 mt-1 break-words">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom/Right Section - Preview (Takes most space) */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Xem trước nội dung</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">Preview</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white">
                <MarkdownPreview
                  content={state.previewContent}
                  className="p-4 sm:p-6 min-h-full max-w-none"
                  applyProjectStyling={true}
                />
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8 mx-auto"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Đang import file</h3>
              <p className="text-lg text-gray-600 mb-6">
                Đang lưu file và áp dụng các tối ưu hóa. Vui lòng đợi trong giây lát...
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium">Đang xử lý...</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Import thành công!</h3>
              <p className="text-lg text-gray-600 mb-6">
                File Markdown đã được import và sẵn sàng sử dụng.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">File đã được lưu thành công</span>
                </div>
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
};

export default MarkdownImporter;