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

const messages = {
  'markdown-import': {
    modal: {
      title: 'Import Markdown File',
      description: 'Upload and convert your Markdown files',
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
    errors: {
      title: 'Error'
    },
    notifications: {
      success: {
        title: 'Import Successful',
        message: 'File {fileName} has been imported to {filePath}',
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
    },
    errorDetails: {
      networkError: {
        title: 'Connection Problem',
        message: 'Unable to connect to the server'
      },
      validationError: {
        title: 'Invalid File',
        message: 'The selected file is not valid'
      },
      processingError: {
        title: 'Processing Failed',
        message: 'Failed to process the Markdown content'
      },
      serverError: {
        title: 'Server Error',
        message: 'The server encountered an error'
      },
      unknownError: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred'
      }
    }
  },
  notifications: {
    dismiss: 'Dismiss notification'
  }
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('MarkdownImporter Error Handling', () => {
  const mockOnClose = vi.fn()
  const mockOnImportSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display error when file validation fails', async () => {
    const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
    
    vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
      isValid: false,
      errors: ['Invalid Markdown syntax'],
      warnings: []
    })

    renderWithProviders(
      <MarkdownImporter locale="en"
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
      />
    )

    // Create a mock file
    const file = new File(['# Invalid content'], 'test.md', { type: 'text/markdown' })

    // Simulate file selection
    const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: '# Invalid content'
    }
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

    // Trigger file drop
    fireEvent.drop(fileInput!, {
      dataTransfer: {
        files: [file]
      }
    })

    // Simulate FileReader completion
    setTimeout(() => {
      mockFileReader.onload({ target: { result: '# Invalid content' } })
    }, 0)

    await waitFor(() => {
      expect(screen.getByText('Invalid File')).toBeInTheDocument()
      expect(screen.getByText('The selected file is not valid')).toBeInTheDocument()
    })
  })

  it('should display error when processing fails', async () => {
    const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
    
    vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    })

    vi.mocked(MarkdownProcessor.processMarkdownFile).mockRejectedValue(
      new Error('Failed to parse Markdown content')
    )

    renderWithProviders(
      <MarkdownImporter locale="en"
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
      />
    )

    const file = new File(['# Valid content'], 'test.md', { type: 'text/markdown' })

    const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
    
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: '# Valid content'
    }
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

    fireEvent.drop(fileInput!, {
      dataTransfer: {
        files: [file]
      }
    })

    setTimeout(() => {
      mockFileReader.onload({ target: { result: '# Valid content' } })
    }, 0)

    await waitFor(() => {
      expect(screen.getByText('Processing Failed')).toBeInTheDocument()
      expect(screen.getByText('Failed to process the Markdown content')).toBeInTheDocument()
    })
  })

  it('should display error when API call fails', async () => {
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

    // Mock failed API response
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    } as Response)

    renderWithProviders(
      <MarkdownImporter locale="en"
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
      />
    )

    // Simulate successful file processing to get to preview step
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
      dataTransfer: {
        files: [file]
      }
    })

    setTimeout(() => {
      mockFileReader.onload({ target: { result: '# Test content' } })
    }, 0)

    // Wait for preview step
    await waitFor(() => {
      expect(screen.getByText('Step 2: Preview and configure')).toBeInTheDocument()
    })

    // Click import button
    const importButton = screen.getByText('Import File')
    fireEvent.click(importButton)

    // Wait for error notification
    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument()
    })
  })

  it('should show retry button for retryable errors', async () => {
    const { MarkdownProcessor } = await import('../../../lib/markdown/MarkdownProcessor')
    
    vi.mocked(MarkdownProcessor.validateMarkdownContent).mockReturnValue({
      isValid: false,
      errors: ['Network error'],
      warnings: []
    })

    renderWithProviders(
      <MarkdownImporter locale="en"
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
      />
    )

    const file = new File(['# Test'], 'test.md', { type: 'text/markdown' })
    const fileInput = screen.getByRole('button', { name: /drag and drop/i }).closest('div')
    
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: '# Test'
    }
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any)

    fireEvent.drop(fileInput!, {
      dataTransfer: {
        files: [file]
      }
    })

    setTimeout(() => {
      mockFileReader.onload({ target: { result: '# Test' } })
    }, 0)

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    // Test retry functionality
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    // Should attempt to process the file again
    expect(MarkdownProcessor.validateMarkdownContent).toHaveBeenCalledTimes(2)
  })

  it('should show success notification with undo option', async () => {
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

    // Mock successful API response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        filePath: 'imported/test.md',
        fileName: 'test.md'
      })
    } as Response)

    renderWithProviders(
      <MarkdownImporter locale="en"
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
      />
    )

    // Simulate successful file processing
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
      dataTransfer: {
        files: [file]
      }
    })

    setTimeout(() => {
      mockFileReader.onload({ target: { result: '# Test content' } })
    }, 0)

    // Wait for preview step
    await waitFor(() => {
      expect(screen.getByText('Step 2: Preview and configure')).toBeInTheDocument()
    })

    // Click import button
    const importButton = screen.getByText('Import File')
    fireEvent.click(importButton)

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText('Import Successful')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
    })
  })
})