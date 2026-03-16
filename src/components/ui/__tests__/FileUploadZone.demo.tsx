'use client';

import React, { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import FileUploadZone from '../FileUploadZone';

// Demo messages for testing
const messages = {
  'markdown-import': {
    uploadZone: {
      ariaLabel: 'File upload zone for Markdown files',
      dragAndDrop: 'Drag and drop your Markdown file here',
      dropHere: 'Drop your file here',
      orClickToSelect: 'or click to select a file',
      supportedFormats: 'Supported formats: {formats} (max {maxSize}MB)',
      releaseToUpload: 'Release to upload file'
    },
    errors: {
      invalidFileType: 'Invalid file type. Please select a Markdown file ({allowed})',
      fileTooLarge: 'File is too large. Maximum size is {maxSize}MB',
      emptyFile: 'File is empty. Please select a valid Markdown file',
      multipleFiles: 'Please select only one file at a time'
    }
  }
};

const FileUploadZoneDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    console.log('File selected:', file);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSelectedFile(null);
    console.error('Upload error:', errorMessage);
  };

  const resetDemo = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FileUploadZone Demo
          </h1>
          <p className="text-gray-600">
            Test the drag & drop functionality and file validation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <FileUploadZone
            onFileSelect={handleFileSelect}
            onError={handleError}
            className="mb-4"
          />

          {/* Status Display */}
          <div className="mt-6 space-y-4">
            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">✅ File Selected</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Name:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p><strong>Type:</strong> {selectedFile.type || 'text/markdown'}</p>
                  <p><strong>Last Modified:</strong> {new Date(selectedFile.lastModified).toLocaleString()}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!selectedFile && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Instructions</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Drag and drop a .md or .markdown file</li>
                  <li>• Or click the zone to select a file</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Only Markdown files are accepted</li>
                </ul>
              </div>
            )}
          </div>

          {/* Reset Button */}
          {(selectedFile || error) && (
            <div className="mt-6 text-center">
              <button
                onClick={resetDemo}
                className="btn-primary"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>

        {/* Test Cases */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases to Try</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">✅ Valid Files</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Any .md file</li>
                <li>• Any .markdown file</li>
                <li>• Files under 5MB</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">❌ Invalid Files</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• .txt, .docx, .pdf files</li>
                <li>• Files over 5MB</li>
                <li>• Empty files (0 bytes)</li>
                <li>• Multiple files at once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
};

export default FileUploadZoneDemo;