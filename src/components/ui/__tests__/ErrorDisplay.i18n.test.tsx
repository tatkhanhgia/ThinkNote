import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ErrorDisplay from '../ErrorDisplay'

const englishMessages = {
  'markdown-import': {
    errorDetails: {
      networkError: {
        title: 'Connection Problem',
        message: 'Unable to connect to the server',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if the problem persists'
        ]
      },
      validationError: {
        title: 'Invalid File',
        message: 'The selected file is not valid',
        suggestions: [
          'Ensure your file is a valid Markdown file (.md or .markdown)',
          'Check that the file is not corrupted',
          'Try with a different file'
        ]
      },
      processingError: {
        title: 'Processing Failed',
        message: 'Failed to process the Markdown content',
        suggestions: [
          'Check your Markdown syntax',
          'Remove any unsupported elements',
          'Try simplifying the content'
        ]
      },
      serverError: {
        title: 'Server Error',
        message: 'The server encountered an error',
        suggestions: [
          'Try again in a few moments',
          'Contact support if the problem persists'
        ]
      },
      fileSystemError: {
        title: 'File System Error',
        message: 'Unable to save the file',
        suggestions: [
          'Check file permissions',
          'Ensure sufficient disk space',
          'Contact administrator'
        ]
      },
      unknownError: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred',
        suggestions: [
          'Try again',
          'Refresh the page',
          'Contact support if the problem persists'
        ]
      }
    }
  }
}

const vietnameseMessages = {
  'markdown-import': {
    errorDetails: {
      networkError: {
        title: 'Lỗi Kết Nối',
        message: 'Không thể kết nối đến máy chủ',
        suggestions: [
          'Kiểm tra kết nối internet của bạn',
          'Thử lại sau vài phút',
          'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục'
        ]
      },
      validationError: {
        title: 'File Không Hợp Lệ',
        message: 'File được chọn không hợp lệ',
        suggestions: [
          'Đảm bảo file của bạn là file Markdown hợp lệ (.md hoặc .markdown)',
          'Kiểm tra file không bị hỏng',
          'Thử với file khác'
        ]
      },
      processingError: {
        title: 'Xử Lý Thất Bại',
        message: 'Không thể xử lý nội dung Markdown',
        suggestions: [
          'Kiểm tra cú pháp Markdown của bạn',
          'Loại bỏ các phần tử không được hỗ trợ',
          'Thử đơn giản hóa nội dung'
        ]
      },
      serverError: {
        title: 'Lỗi Máy Chủ',
        message: 'Máy chủ gặp lỗi',
        suggestions: [
          'Thử lại sau vài phút',
          'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục'
        ]
      },
      fileSystemError: {
        title: 'Lỗi Hệ Thống File',
        message: 'Không thể lưu file',
        suggestions: [
          'Kiểm tra quyền truy cập file',
          'Đảm bảo có đủ dung lượng đĩa',
          'Liên hệ quản trị viên'
        ]
      },
      unknownError: {
        title: 'Lỗi Không Xác Định',
        message: 'Đã xảy ra lỗi không mong muốn',
        suggestions: [
          'Thử lại',
          'Làm mới trang',
          'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục'
        ]
      }
    }
  }
}

// Mock the ErrorHandler
vi.mock('../../../lib/error-handling/ErrorHandler', () => ({
  ErrorHandler: {
    formatErrorForUser: vi.fn(),
    categorizeError: vi.fn()
  }
}))

const renderWithLocale = (component: React.ReactElement, locale: string, messages: any) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('ErrorDisplay Internationalization', () => {
  const mockOnRetry = vi.fn()
  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('English Locale', () => {
    it('should display English network error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Connection Problem',
        message: 'Unable to connect to the server',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if the problem persists'
        ],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        retryable: true
      })

      const networkError = new Error('fetch failed')

      renderWithLocale(
        <ErrorDisplay
          error={networkError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Connection Problem')).toBeInTheDocument()
      expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument()
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
      expect(screen.getByText('Try again in a few moments')).toBeInTheDocument()
      expect(screen.getByText('Contact support if the problem persists')).toBeInTheDocument()
    })

    it('should display English validation error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Invalid File',
        message: 'The selected file is not valid',
        suggestions: [
          'Ensure your file is a valid Markdown file (.md or .markdown)',
          'Check that the file is not corrupted',
          'Try with a different file'
        ],
        canRetry: false
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'File validation failed',
        retryable: false
      })

      const validationError = new Error('Invalid file type')

      renderWithLocale(
        <ErrorDisplay
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Invalid File')).toBeInTheDocument()
      expect(screen.getByText('The selected file is not valid')).toBeInTheDocument()
      expect(screen.getByText('Ensure your file is a valid Markdown file (.md or .markdown)')).toBeInTheDocument()
      expect(screen.getByText('Check that the file is not corrupted')).toBeInTheDocument()
      expect(screen.getByText('Try with a different file')).toBeInTheDocument()
    })

    it('should display English processing error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Processing Failed',
        message: 'Failed to process the Markdown content',
        suggestions: [
          'Check your Markdown syntax',
          'Remove any unsupported elements',
          'Try simplifying the content'
        ],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'PROCESSING_ERROR',
        message: 'Failed to process Markdown content',
        retryable: true
      })

      const processingError = new Error('Failed to parse Markdown')

      renderWithLocale(
        <ErrorDisplay
          error={processingError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Processing Failed')).toBeInTheDocument()
      expect(screen.getByText('Failed to process the Markdown content')).toBeInTheDocument()
      expect(screen.getByText('Check your Markdown syntax')).toBeInTheDocument()
      expect(screen.getByText('Remove any unsupported elements')).toBeInTheDocument()
      expect(screen.getByText('Try simplifying the content')).toBeInTheDocument()
    })
  })

  describe('Vietnamese Locale', () => {
    it('should display Vietnamese network error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Lỗi Kết Nối',
        message: 'Không thể kết nối đến máy chủ',
        suggestions: [
          'Kiểm tra kết nối internet của bạn',
          'Thử lại sau vài phút',
          'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục'
        ],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        retryable: true
      })

      const networkError = new Error('fetch failed')

      renderWithLocale(
        <ErrorDisplay
          error={networkError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Lỗi Kết Nối')).toBeInTheDocument()
      expect(screen.getByText('Không thể kết nối đến máy chủ')).toBeInTheDocument()
      expect(screen.getByText('Kiểm tra kết nối internet của bạn')).toBeInTheDocument()
      expect(screen.getByText('Thử lại sau vài phút')).toBeInTheDocument()
      expect(screen.getByText('Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục')).toBeInTheDocument()
    })

    it('should display Vietnamese validation error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'File Không Hợp Lệ',
        message: 'File được chọn không hợp lệ',
        suggestions: [
          'Đảm bảo file của bạn là file Markdown hợp lệ (.md hoặc .markdown)',
          'Kiểm tra file không bị hỏng',
          'Thử với file khác'
        ],
        canRetry: false
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'File validation failed',
        retryable: false
      })

      const validationError = new Error('Invalid file type')

      renderWithLocale(
        <ErrorDisplay
          error={validationError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('File Không Hợp Lệ')).toBeInTheDocument()
      expect(screen.getByText('File được chọn không hợp lệ')).toBeInTheDocument()
      expect(screen.getByText('Đảm bảo file của bạn là file Markdown hợp lệ (.md hoặc .markdown)')).toBeInTheDocument()
      expect(screen.getByText('Kiểm tra file không bị hỏng')).toBeInTheDocument()
      expect(screen.getByText('Thử với file khác')).toBeInTheDocument()
    })

    it('should display Vietnamese processing error messages', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Xử Lý Thất Bại',
        message: 'Không thể xử lý nội dung Markdown',
        suggestions: [
          'Kiểm tra cú pháp Markdown của bạn',
          'Loại bỏ các phần tử không được hỗ trợ',
          'Thử đơn giản hóa nội dung'
        ],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'PROCESSING_ERROR',
        message: 'Failed to process Markdown content',
        retryable: true
      })

      const processingError = new Error('Failed to parse Markdown')

      renderWithLocale(
        <ErrorDisplay
          error={processingError}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Xử Lý Thất Bại')).toBeInTheDocument()
      expect(screen.getByText('Không thể xử lý nội dung Markdown')).toBeInTheDocument()
      expect(screen.getByText('Kiểm tra cú pháp Markdown của bạn')).toBeInTheDocument()
      expect(screen.getByText('Loại bỏ các phần tử không được hỗ trợ')).toBeInTheDocument()
      expect(screen.getByText('Thử đơn giản hóa nội dung')).toBeInTheDocument()
    })
  })

  describe('Error Type Coverage', () => {
    const errorTypes = [
      { code: 'NETWORK_ERROR', error: new Error('fetch failed') },
      { code: 'VALIDATION_ERROR', error: new Error('Invalid file type') },
      { code: 'PROCESSING_ERROR', error: new Error('Failed to parse') },
      { code: 'SERVER_ERROR', error: new Error('500 Internal Server Error') },
      { code: 'FILE_SYSTEM_ERROR', error: new Error('ENOENT: no such file') },
      { code: 'UNKNOWN_ERROR', error: new Error('Something went wrong') }
    ]

    errorTypes.forEach(({ code, error }) => {
      it(`should handle ${code} in English`, async () => {
        const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
        
        const errorKeyMap: Record<string, string> = {
          'NETWORK_ERROR': 'networkError',
          'VALIDATION_ERROR': 'validationError',
          'PROCESSING_ERROR': 'processingError',
          'SERVER_ERROR': 'serverError',
          'FILE_SYSTEM_ERROR': 'fileSystemError',
          'UNKNOWN_ERROR': 'unknownError'
        }
        const errorKey = errorKeyMap[code]
        
        vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
          title: englishMessages['markdown-import'].errorDetails[errorKey].title,
          message: englishMessages['markdown-import'].errorDetails[errorKey].message,
          suggestions: englishMessages['markdown-import'].errorDetails[errorKey].suggestions,
          canRetry: code !== 'VALIDATION_ERROR' && code !== 'FILE_SYSTEM_ERROR'
        })

        vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
          code,
          message: error.message,
          retryable: code !== 'VALIDATION_ERROR' && code !== 'FILE_SYSTEM_ERROR'
        })

        renderWithLocale(
          <ErrorDisplay
            error={error}
            onRetry={mockOnRetry}
            onDismiss={mockOnDismiss}
          />,
          'en',
          englishMessages
        )

        expect(screen.getByText(englishMessages['markdown-import'].errorDetails[errorKey].title)).toBeInTheDocument()
        expect(screen.getByText(englishMessages['markdown-import'].errorDetails[errorKey].message)).toBeInTheDocument()
      })

      it(`should handle ${code} in Vietnamese`, async () => {
        const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
        
        const errorKeyMap: Record<string, string> = {
          'NETWORK_ERROR': 'networkError',
          'VALIDATION_ERROR': 'validationError',
          'PROCESSING_ERROR': 'processingError',
          'SERVER_ERROR': 'serverError',
          'FILE_SYSTEM_ERROR': 'fileSystemError',
          'UNKNOWN_ERROR': 'unknownError'
        }
        const errorKey = errorKeyMap[code]
        
        vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
          title: vietnameseMessages['markdown-import'].errorDetails[errorKey].title,
          message: vietnameseMessages['markdown-import'].errorDetails[errorKey].message,
          suggestions: vietnameseMessages['markdown-import'].errorDetails[errorKey].suggestions,
          canRetry: code !== 'VALIDATION_ERROR' && code !== 'FILE_SYSTEM_ERROR'
        })

        vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
          code,
          message: error.message,
          retryable: code !== 'VALIDATION_ERROR' && code !== 'FILE_SYSTEM_ERROR'
        })

        renderWithLocale(
          <ErrorDisplay
            error={error}
            onRetry={mockOnRetry}
            onDismiss={mockOnDismiss}
          />,
          'vi',
          vietnameseMessages
        )

        expect(screen.getByText(vietnameseMessages['markdown-import'].errorDetails[errorKey].title)).toBeInTheDocument()
        expect(screen.getByText(vietnameseMessages['markdown-import'].errorDetails[errorKey].message)).toBeInTheDocument()
      })
    })
  })

  describe('Interactive Elements', () => {
    it('should handle retry button clicks with English labels', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Connection Problem',
        message: 'Unable to connect to the server',
        suggestions: ['Try again'],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        retryable: true
      })

      renderWithLocale(
        <ErrorDisplay
          error={new Error('network error')}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should handle dismiss button clicks with English labels', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Invalid File',
        message: 'The selected file is not valid',
        suggestions: ['Try with a different file'],
        canRetry: false
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'File validation failed',
        retryable: false
      })

      renderWithLocale(
        <ErrorDisplay
          error={new Error('validation error')}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const dismissButton = screen.getByText('Dismiss')
      fireEvent.click(dismissButton)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('should toggle technical details visibility', async () => {
      const { ErrorHandler } = await import('../../../lib/error-handling/ErrorHandler')
      
      vi.mocked(ErrorHandler.formatErrorForUser).mockReturnValue({
        title: 'Server Error',
        message: 'The server encountered an error',
        details: 'HTTP 500: Internal Server Error at /api/markdown/import',
        suggestions: ['Try again in a few moments'],
        canRetry: true
      })

      vi.mocked(ErrorHandler.categorizeError).mockReturnValue({
        code: 'SERVER_ERROR',
        message: 'Server encountered an error',
        retryable: true
      })

      renderWithLocale(
        <ErrorDisplay
          error={new Error('server error')}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      // Initially details should be hidden
      expect(screen.queryByText('HTTP 500: Internal Server Error at /api/markdown/import')).not.toBeInTheDocument()

      // Click to show details
      const showDetailsButton = screen.getByText('Show Technical Details')
      fireEvent.click(showDetailsButton)

      expect(screen.getByText('HTTP 500: Internal Server Error at /api/markdown/import')).toBeInTheDocument()
      expect(screen.getByText('Hide Technical Details')).toBeInTheDocument()

      // Click to hide details
      const hideDetailsButton = screen.getByText('Hide Technical Details')
      fireEvent.click(hideDetailsButton)

      expect(screen.queryByText('HTTP 500: Internal Server Error at /api/markdown/import')).not.toBeInTheDocument()
      expect(screen.getByText('Show Technical Details')).toBeInTheDocument()
    })
  })
})