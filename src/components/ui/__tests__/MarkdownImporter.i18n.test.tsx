import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import MarkdownImporter from '../MarkdownImporter'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }
}))

// Mock the MarkdownProcessor
vi.mock('../../../lib/markdown/MarkdownProcessor', () => ({
  MarkdownProcessor: {
    validateMarkdownContent: vi.fn(),
    processMarkdownFile: vi.fn(),
    convertToProjectFormat: vi.fn()
  }
}))

// Mock fetch
global.fetch = vi.fn()

const englishMessages = {
  'markdown-import': {
    modal: {
      title: 'Import Markdown File',
      description: 'Upload and convert your Markdown files to match the project\'s styling',
      close: 'Close modal',
      cancel: 'Cancel',
      back: 'Back',
      import: 'Import File',
      importing: 'Importing...'
    },
    steps: {
      upload: { title: 'Step 1: Upload your Markdown file' },
      preview: { title: 'Step 2: Preview and configure' },
      processing: { title: 'Step 3: Processing file' },
      complete: { title: 'Step 4: Import complete' }
    },
    preview: {
      title: 'Preview',
      fileName: 'File Name',
      fileNamePlaceholder: 'Enter file name (without extension)',
      metadata: 'File Metadata'
    },
    processing: {
      title: 'Processing Your File',
      description: 'Converting Markdown and applying project styling...',
      analyzing: 'Analyzing file content...'
    },
    complete: {
      title: 'Import Successful!',
      description: 'Your Markdown file has been successfully imported and converted.'
    },
    notifications: {
      success: {
        title: 'Import Successful',
        message: 'File \'{fileName}\' has been imported to {filePath}',
        undoLabel: 'Undo'
      },
      error: {
        title: 'Import Failed',
        retryLabel: 'Retry'
      },
      undo: {
        success: 'Import has been undone successfully',
        failed: 'Failed to undo import'
      }
    }
  },
  notifications: {
    dismiss: 'Dismiss notification'
  }
}

const vietnameseMessages = {
  'markdown-import': {
    modal: {
      title: 'Import File Markdown',
      description: 'Tải lên và chuyển đổi file Markdown để phù hợp với styling của dự án',
      close: 'Đóng modal',
      cancel: 'Hủy bỏ',
      back: 'Quay lại',
      import: 'Import File',
      importing: 'Đang import...'
    },
    steps: {
      upload: { title: 'Bước 1: Tải lên file Markdown của bạn' },
      preview: { title: 'Bước 2: Xem trước và cấu hình' },
      processing: { title: 'Bước 3: Đang xử lý file' },
      complete: { title: 'Bước 4: Import hoàn tất' }
    },
    preview: {
      title: 'Xem trước',
      fileName: 'Tên File',
      fileNamePlaceholder: 'Nhập tên file (không có phần mở rộng)',
      metadata: 'Metadata của File'
    },
    processing: {
      title: 'Đang Xử Lý File Của Bạn',
      description: 'Đang chuyển đổi Markdown và áp dụng styling của dự án...',
      analyzing: 'Đang phân tích nội dung file...'
    },
    complete: {
      title: 'Import Thành Công!',
      description: 'File Markdown của bạn đã được import và chuyển đổi thành công.'
    },
    notifications: {
      success: {
        title: 'Import Thành Công',
        message: 'File \'{fileName}\' đã được import vào {filePath}',
        undoLabel: 'Hoàn tác'
      },
      error: {
        title: 'Import Thất Bại',
        retryLabel: 'Thử lại'
      },
      undo: {
        success: 'Đã hoàn tác import thành công',
        failed: 'Không thể hoàn tác import'
      }
    }
  },
  notifications: {
    dismiss: 'Đóng thông báo'
  }
}

const renderWithLocale = (component: React.ReactElement, locale: string, messages: any) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('MarkdownImporter Internationalization', () => {
  const mockOnClose = vi.fn()
  const mockOnImportSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('English Locale', () => {
    it('should display English text in modal header', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Import Markdown File')).toBeInTheDocument()
      expect(screen.getByText('Upload and convert your Markdown files to match the project\'s styling')).toBeInTheDocument()
    })

    it('should display English step titles', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Step 1: Upload your Markdown file')).toBeInTheDocument()
    })

    it('should display English button labels', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })
  })

  describe('Vietnamese Locale', () => {
    it('should display Vietnamese text in modal header', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Import File Markdown')).toBeInTheDocument()
      expect(screen.getByText('Tải lên và chuyển đổi file Markdown để phù hợp với styling của dự án')).toBeInTheDocument()
    })

    it('should display Vietnamese step titles', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Bước 1: Tải lên file Markdown của bạn')).toBeInTheDocument()
    })

    it('should display Vietnamese button labels', () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Hủy bỏ')).toBeInTheDocument()
      expect(screen.getByLabelText('Đóng modal')).toBeInTheDocument()
    })
  })

  describe('Preview Step Localization', () => {
    beforeEach(async () => {
      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      vi.mocked(MarkdownProcessor.processMarkdownFile).mockResolvedValue({
        html: '<h1>Test</h1>',
        metadata: { title: 'Test Article' },
        originalContent: '# Test'
      })

      vi.mocked(MarkdownProcessor.convertToProjectFormat).mockResolvedValue('<h1 class="heading-1">Test</h1>')
    })

    it('should display English preview labels', async () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      // Simulate file upload to get to preview step
      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Step 2: Preview and configure')).toBeInTheDocument()
        expect(screen.getByText('File Name')).toBeInTheDocument()
        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText('File Metadata')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter file name (without extension)')).toBeInTheDocument()
      })
    })

    it('should display Vietnamese preview labels', async () => {
      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      // Simulate file upload to get to preview step
      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /kéo và thả/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Bước 2: Xem trước và cấu hình')).toBeInTheDocument()
        expect(screen.getByText('Tên File')).toBeInTheDocument()
        expect(screen.getByText('Xem trước')).toBeInTheDocument()
        expect(screen.getByText('Metadata của File')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Nhập tên file (không có phần mở rộng)')).toBeInTheDocument()
      })
    })
  })

  describe('Processing Step Localization', () => {
    it('should display English processing messages', async () => {
      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      // Mock a slow processing to see the processing step
      vi.mocked(MarkdownProcessor.processMarkdownFile).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          html: '<h1>Test</h1>',
          metadata: {},
          originalContent: '# Test'
        }), 100))
      )

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      // Should show processing message
      await waitFor(() => {
        expect(screen.getByText('Analyzing file content...')).toBeInTheDocument()
      })
    })

    it('should display Vietnamese processing messages', async () => {
      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      // Mock a slow processing to see the processing step
      vi.mocked(MarkdownProcessor.processMarkdownFile).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          html: '<h1>Test</h1>',
          metadata: {},
          originalContent: '# Test'
        }), 100))
      )

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /kéo và thả/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      // Should show Vietnamese processing message
      await waitFor(() => {
        expect(screen.getByText('Đang phân tích nội dung file...')).toBeInTheDocument()
      })
    })
  })

  describe('Notification Localization', () => {
    beforeEach(async () => {
      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      vi.mocked(MarkdownProcessor.processMarkdownFile).mockResolvedValue({
        html: '<h1>Test</h1>',
        metadata: {},
        originalContent: '# Test'
      })

      vi.mocked(MarkdownProcessor.convertToProjectFormat).mockResolvedValue('<h1 class="heading-1">Test</h1>')
    })

    it('should display English success notification', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          filePath: 'imported/test.md',
          fileName: 'test.md'
        })
      } as Response)

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      // Simulate successful import
      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Step 2: Preview and configure')).toBeInTheDocument()
      })

      const importButton = screen.getByText('Import File')
      fireEvent.click(importButton)

      await waitFor(() => {
        expect(screen.getByText('Import Successful')).toBeInTheDocument()
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })
    })

    it('should display Vietnamese success notification', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          filePath: 'imported/test.md',
          fileName: 'test.md'
        })
      } as Response)

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      // Simulate successful import
      const file = new File(['# Test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /kéo và thả/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Bước 2: Xem trước và cấu hình')).toBeInTheDocument()
      })

      const importButton = screen.getByText('Import File')
      fireEvent.click(importButton)

      await waitFor(() => {
        expect(screen.getByText('Import Thành Công')).toBeInTheDocument()
        expect(screen.getByText('Hoàn tác')).toBeInTheDocument()
      })
    })
  })

  describe('Dynamic Content Localization', () => {
    it('should handle parameterized messages in English', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          filePath: 'imported/my-article.md',
          fileName: 'my-article.md'
        })
      } as Response)

      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      vi.mocked(MarkdownProcessor.processMarkdownFile).mockResolvedValue({
        html: '<h1>Test</h1>',
        metadata: {},
        originalContent: '# Test'
      })

      vi.mocked(MarkdownProcessor.convertToProjectFormat).mockResolvedValue('<h1 class="heading-1">Test</h1>')

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'en',
        englishMessages
      )

      // Complete the import process
      const file = new File(['# Test content'], 'my-article.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Step 2: Preview and configure')).toBeInTheDocument()
      })

      const importButton = screen.getByText('Import File')
      fireEvent.click(importButton)

      // Should show parameterized success message
      await waitFor(() => {
        expect(screen.getByText(/File 'my-article.md' has been imported to imported\/my-article.md/)).toBeInTheDocument()
      })
    })

    it('should handle parameterized messages in Vietnamese', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          filePath: 'imported/bai-viet-cua-toi.md',
          fileName: 'bai-viet-cua-toi.md'
        })
      } as Response)

      const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
      
      vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      vi.mocked(MarkdownProcessor.processMarkdownFile).mockResolvedValue({
        html: '<h1>Test</h1>',
        metadata: {},
        originalContent: '# Test'
      })

      vi.mocked(MarkdownProcessor.convertToProjectFormat).mockResolvedValue('<h1 class="heading-1">Test</h1>')

      renderWithLocale(
        <MarkdownImporter locale="en"
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />,
        'vi',
        vietnameseMessages
      )

      // Complete the import process
      const file = new File(['# Test content'], 'bai-viet-cua-toi.md', { type: 'text/markdown' })
      const fileInput = screen.getByRole('button', { name: /kéo và thả/i }).closest('div')
      
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: '# Test content'
      }
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

      fireEvent.drop(fileInput!, {
        dataTransfer: { files: [file] }
      })

      setTimeout(() => {
        mockFileReader.onload({ target: { result: '# Test content' } })
      }, 0)

      await waitFor(() => {
        expect(screen.getByText('Bước 2: Xem trước và cấu hình')).toBeInTheDocument()
      })

      const importButton = screen.getByText('Import File')
      fireEvent.click(importButton)

      // Should show parameterized success message in Vietnamese
      await waitFor(() => {
        expect(screen.getByText(/File 'bai-viet-cua-toi.md' đã được import vào imported\/bai-viet-cua-toi.md/)).toBeInTheDocument()
      })
    })
  })
})