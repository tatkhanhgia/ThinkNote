'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorHandler } from '../../lib/error-handling';

interface ErrorDisplayProps {
  error: unknown
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const t = useTranslations('markdown-import.errorDetails');
  const [showDetails, setShowDetails] = useState(false);

  const errorInfo = ErrorHandler.formatErrorForUser(error);
  const errorDetails = ErrorHandler.categorizeError(error);

  const getErrorTranslationKey = (code: string): string => {
    const keyMap: Record<string, string> = {
      NETWORK_ERROR: 'networkError',
      VALIDATION_ERROR: 'validationError',
      PROCESSING_ERROR: 'processingError',
      SERVER_ERROR: 'serverError',
      FILE_SYSTEM_ERROR: 'fileSystemError',
      UNKNOWN_ERROR: 'unknownError'
    };
    return keyMap[code] || 'unknownError';
  };

  const translationKey = getErrorTranslationKey(errorDetails.code);

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {t(`${translationKey}.title`)}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {t(`${translationKey}.message`)}
          </p>

          {/* Suggestions */}
          <div className="mt-3">
            <h4 className="text-xs font-medium text-red-800 uppercase tracking-wide">
              Suggestions:
            </h4>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          {/* Error Details (Collapsible) */}
          {errorInfo.details && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
              >
                <span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
                <svg 
                  className={`w-3 h-3 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDetails && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 font-mono">
                  {errorInfo.details}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex space-x-2">
            {errorInfo.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;