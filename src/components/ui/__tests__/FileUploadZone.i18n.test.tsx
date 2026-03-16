import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import FileUploadZone from '../FileUploadZone'

const englishMessages = {
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
}

const vietnameseMessages = {
  'markdown-import': {
    uploadZone: {
      ariaLabel: 'Vùng tải lên file cho các file Markdown',
      dragAndDrop: 'Kéo và thả file Markdown của bạn vào đây',
      dropHere: 'Thả file của bạn vào đây',
      orClickToSelect: 'hoặc nhấp để chọn file',
      supportedFormats: 'Định dạng hỗ trợ: {formats} (tối đa {maxSize}MB)',
      releaseToUpload: 'Thả để tải lên file'
    },
    errors: {
      invalidFileType: 'Loại file không hợp lệ. Vui lòng chọn file Markdown ({allowed})',
      fileTooLarge: 'File quá lớn. Kích thước tối đa là {maxSize}MB',
      emptyFile: 'File trống. Vui lòng chọn file Markdown hợp lệ',
      multipleFiles: 'Vui lòng chỉ chọn một file tại một thời điểm'
    }
  }
}

const renderWithLocale = (component: React.ReactElement, locale: string, messages: any) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('FileUploadZone Internationalization', () => {
  const mockOnFileSelect = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('English Locale', () => {
    it('should display English upload zone text', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Drag and drop your Markdown file here')).toBeInTheDocument()
      expect(screen.getByText('or click to select a file')).toBeInTheDocument()
      expect(screen.getByText('Supported formats: .md, .markdown (max 5MB)')).toBeInTheDocument()
      expect(screen.getByLabelText('File upload zone for Markdown files')).toBeInTheDocument()
    })

    it('should display English drag active text', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')

      // Simulate drag enter
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'text/markdown' }]
        }
      })

      expect(screen.getByText('Drop your file here')).toBeInTheDocument()
      expect(screen.getByText('Release to upload file')).toBeInTheDocument()
    })

    it('should display English error messages', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')

      // Test invalid file type
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [invalidFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('Invalid file type. Please select a Markdown file (.md, .markdown)')
    })

    it('should display English file size error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          maxSize={1024} // 1KB for testing
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')

      // Create a large file (2KB)
      const largeContent = 'x'.repeat(2048)
      const largeFile = new File([largeContent], 'test.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [largeFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('File is too large. Maximum size is 0MB')
    })

    it('should display English empty file error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')

      // Create empty file
      const emptyFile = new File([''], 'test.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [emptyFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('File is empty. Please select a valid Markdown file')
    })

    it('should display English multiple files error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')

      // Create multiple files
      const file1 = new File(['content1'], 'test1.md', { type: 'text/markdown' })
      const file2 = new File(['content2'], 'test2.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [file1, file2] }
      })

      expect(mockOnError).toHaveBeenCalledWith('Please select only one file at a time')
    })
  })

  describe('Vietnamese Locale', () => {
    it('should display Vietnamese upload zone text', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Kéo và thả file Markdown của bạn vào đây')).toBeInTheDocument()
      expect(screen.getByText('hoặc nhấp để chọn file')).toBeInTheDocument()
      expect(screen.getByText('Định dạng hỗ trợ: .md, .markdown (tối đa 5MB)')).toBeInTheDocument()
      expect(screen.getByLabelText('Vùng tải lên file cho các file Markdown')).toBeInTheDocument()
    })

    it('should display Vietnamese drag active text', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')

      // Simulate drag enter
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'text/markdown' }]
        }
      })

      expect(screen.getByText('Thả file của bạn vào đây')).toBeInTheDocument()
      expect(screen.getByText('Thả để tải lên file')).toBeInTheDocument()
    })

    it('should display Vietnamese error messages', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')

      // Test invalid file type
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [invalidFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('Loại file không hợp lệ. Vui lòng chọn file Markdown (.md, .markdown)')
    })

    it('should display Vietnamese file size error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          maxSize={1024} // 1KB for testing
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')

      // Create a large file (2KB)
      const largeContent = 'x'.repeat(2048)
      const largeFile = new File([largeContent], 'test.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [largeFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('File quá lớn. Kích thước tối đa là 0MB')
    })

    it('should display Vietnamese empty file error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')

      // Create empty file
      const emptyFile = new File([''], 'test.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [emptyFile] }
      })

      expect(mockOnError).toHaveBeenCalledWith('File trống. Vui lòng chọn file Markdown hợp lệ')
    })

    it('should display Vietnamese multiple files error', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')

      // Create multiple files
      const file1 = new File(['content1'], 'test1.md', { type: 'text/markdown' })
      const file2 = new File(['content2'], 'test2.md', { type: 'text/markdown' })
      
      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [file1, file2] }
      })

      expect(mockOnError).toHaveBeenCalledWith('Vui lòng chỉ chọn một file tại một thời điểm')
    })
  })

  describe('Custom Max Size Localization', () => {
    it('should display correct max size in English', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          maxSize={10 * 1024 * 1024} // 10MB
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Supported formats: .md, .markdown (max 10MB)')).toBeInTheDocument()
    })

    it('should display correct max size in Vietnamese', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          maxSize={10 * 1024 * 1024} // 10MB
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Định dạng hỗ trợ: .md, .markdown (tối đa 10MB)')).toBeInTheDocument()
    })
  })

  describe('Accessibility Localization', () => {
    it('should have correct aria-label in English', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')
      expect(uploadZone).toBeInTheDocument()
    })

    it('should have correct aria-label in Vietnamese', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'vi',
        vietnameseMessages
      )

      const uploadZone = screen.getByLabelText('Vùng tải lên file cho các file Markdown')
      expect(uploadZone).toBeInTheDocument()
    })

    it('should support keyboard navigation with localized labels', () => {
      renderWithLocale(
        <FileUploadZone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
        />,
        'en',
        englishMessages
      )

      const uploadZone = screen.getByLabelText('File upload zone for Markdown files')
      
      // Should be focusable
      expect(uploadZone).toHaveAttribute('tabIndex', '0')
      
      // Should respond to keyboard events
      fireEvent.keyDown(uploadZone, { key: 'Enter' })
      fireEvent.keyDown(uploadZone, { key: ' ' })
      
      // Should not throw errors
      expect(uploadZone).toBeInTheDocument()
    })
  })
})