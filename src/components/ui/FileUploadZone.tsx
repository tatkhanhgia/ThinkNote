'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

interface DragState {
  isDragOver: boolean;
  isDragActive: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  onError,
  accept = '.md,.markdown',
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  className = ''
}) => {
  const t = useTranslations('markdown-import');
  const [dragState, setDragState] = useState<DragState>({
    isDragOver: false,
    isDragActive: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // File validation function
  const validateFile = useCallback((file: File): string | null => {
    console.log('=== FileUploadZone Validation Debug ===');
    console.log('Original file name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    // Check file type with better logic
    const allowedExtensions = ['.md', '.markdown'];
    const originalFileName = file.name;
    const fileName = originalFileName.toLowerCase();
    
    // Better extension detection
    let fileExtension = '';
    if (fileName.includes('.')) {
      const parts = fileName.split('.');
      if (parts.length > 1) {
        fileExtension = '.' + parts[parts.length - 1];
      }
    }
    
    console.log('Processed fileName:', fileName);
    console.log('Detected fileExtension:', fileExtension);
    console.log('Allowed extensions:', allowedExtensions);
    console.log('Extension check result:', allowedExtensions.includes(fileExtension));
    
    // Check if file is empty first
    if (file.size === 0) {
      console.log('❌ File is empty');
      return `EMPTY_CONTENT:${originalFileName}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      console.log('❌ File too large:', sizeMB, 'MB, max:', maxSizeMB, 'MB');
      return `FILE_TOO_LARGE:${sizeMB}MB:${maxSizeMB}MB`;
    }
    
    // Check file extension
    if (!fileExtension) {
      console.log('❌ No file extension detected');
      return `INVALID_FILE_TYPE:${originalFileName}:no-extension`;
    }
    
    if (!allowedExtensions.includes(fileExtension)) {
      console.log('❌ Invalid file extension:', fileExtension);
      return `INVALID_FILE_TYPE:${originalFileName}:${fileExtension}`;
    }

    console.log('✅ File validation passed');
    return null;
  }, [maxSize]);

  // Handle file processing
  const processFile = useCallback((file: File) => {
    if (disabled) return;

    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }

    onFileSelect(file);
  }, [disabled, validateFile, onError, onFileSelect]);

  // Drag event handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragState({
        isDragOver: true,
        isDragActive: true
      });
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setDragState({
        isDragOver: false,
        isDragActive: false
      });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragOver: false,
      isDragActive: false
    });
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      onError(t('errors.multipleFiles'));
      return;
    }

    if (files.length === 1) {
      processFile(files[0]);
    }
  }, [disabled, processFile, onError, t]);

  // Click handler for file input
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 1) {
      processFile(files[0]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFile]);

  // Dynamic styling based on state
  const getZoneClassName = () => {
    let baseClasses = `
      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
      transition-all duration-300 ease-in-out
      ${className}
    `;

    if (disabled) {
      baseClasses += ' opacity-50 cursor-not-allowed bg-gray-50';
    } else if (dragState.isDragActive) {
      baseClasses += ' border-primary-500 bg-primary-50 scale-105';
    } else if (dragState.isDragOver) {
      baseClasses += ' border-primary-400 bg-primary-25';
    } else {
      baseClasses += ' border-gray-300 hover:border-primary-400 hover:bg-gray-50';
    }

    return baseClasses.trim();
  };

  return (
    <div
      className={getZoneClassName()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={t('uploadZone.ariaLabel')}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      {/* Upload icon */}
      <div className="mb-4">
        <svg
          className={`mx-auto h-12 w-12 ${
            dragState.isDragActive ? 'text-primary-500' : 'text-gray-400'
          } transition-colors duration-200`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Upload text */}
      <div className="space-y-2">
        <p className={`text-lg font-medium ${
          dragState.isDragActive ? 'text-primary-600' : 'text-gray-700'
        }`}>
          {dragState.isDragActive 
            ? t('uploadZone.dropHere')
            : t('uploadZone.dragAndDrop')
          }
        </p>
        <p className="text-sm text-gray-500">
          {t('uploadZone.orClickToSelect')}
        </p>
        <p className="text-xs text-gray-400">
          {t('uploadZone.supportedFormats', { 
            formats: '.md, .markdown',
            maxSize: Math.round(maxSize / (1024 * 1024))
          })}
        </p>
      </div>

      {/* Visual feedback overlay */}
      {dragState.isDragActive && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-10 rounded-xl flex items-center justify-center">
          <div className="text-primary-600 font-semibold text-lg">
            {t('uploadZone.releaseToUpload')}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;