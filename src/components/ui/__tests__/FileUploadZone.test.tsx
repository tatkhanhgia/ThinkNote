import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import FileUploadZone from '../FileUploadZone';

// Mock translations
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

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

// Helper function to create mock files
const createMockFile = (name: string, size: number, type: string = 'text/markdown'): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper function to create drag event
const createDragEvent = (type: string, files: File[] = []) => {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files,
      items: files.map(file => ({ kind: 'file', type: file.type })),
      types: ['Files']
    }
  });
  return event;
};

describe('FileUploadZone', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnError = vi.fn();

  const defaultProps = {
    onFileSelect: mockOnFileSelect,
    onError: mockOnError
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the upload zone with correct initial state', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop your Markdown file here')).toBeInTheDocument();
      expect(screen.getByText('or click to select a file')).toBeInTheDocument();
      expect(screen.getByText(/Supported formats: \.md, \.markdown/)).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      expect(uploadZone).toHaveClass('custom-class');
    });

    it('renders in disabled state', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} disabled={true} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      expect(uploadZone).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(uploadZone).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('File Validation', () => {
    it('accepts valid .md files', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const validFile = createMockFile('test.md', 1024);
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });

    it('accepts valid .markdown files', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const validFile = createMockFile('test.markdown', 1024);
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });

    it('rejects files with invalid extensions', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const invalidFile = createMockFile('test.txt', 1024, 'text/plain');
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('Invalid file type')
        );
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      });
    });

    it('rejects files that are too large', async () => {
      const maxSize = 1024; // 1KB for testing
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} maxSize={maxSize} />
        </TestWrapper>
      );

      const largeFile = createMockFile('large.md', maxSize + 1);
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('File is too large')
        );
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      });
    });

    it('rejects empty files', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const emptyFile = createMockFile('empty.md', 0);
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [emptyFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('File is empty')
        );
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('handles drag enter correctly', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const file = createMockFile('test.md', 1024);
      
      fireEvent(uploadZone, createDragEvent('dragenter', [file]));

      expect(uploadZone).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('handles drag leave correctly', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const file = createMockFile('test.md', 1024);
      
      // Enter drag state
      fireEvent(uploadZone, createDragEvent('dragenter', [file]));
      expect(uploadZone).toHaveClass('border-primary-500');
      
      // Leave drag state
      fireEvent(uploadZone, createDragEvent('dragleave', []));
      expect(uploadZone).not.toHaveClass('border-primary-500');
    });

    it('handles file drop correctly', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const validFile = createMockFile('test.md', 1024);
      
      fireEvent(uploadZone, createDragEvent('drop', [validFile]));

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });

    it('handles multiple files drop with error', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const file1 = createMockFile('test1.md', 1024);
      const file2 = createMockFile('test2.md', 1024);
      
      fireEvent(uploadZone, createDragEvent('drop', [file1, file2]));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('Please select only one file')
        );
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      });
    });

    it('shows visual feedback during drag', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const file = createMockFile('test.md', 1024);
      
      fireEvent(uploadZone, createDragEvent('dragenter', [file]));

      expect(screen.getByText('Drop your file here')).toBeInTheDocument();
      expect(screen.getByText('Release to upload file')).toBeInTheDocument();
    });
  });

  describe('Click to Upload', () => {
    it('opens file dialog on click', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const input = uploadZone.querySelector('input[type="file"]') as HTMLInputElement;
      
      const clickSpy = vi.spyOn(input, 'click');
      
      fireEvent.click(uploadZone);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('opens file dialog on Enter key', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const input = uploadZone.querySelector('input[type="file"]') as HTMLInputElement;
      
      const clickSpy = vi.spyOn(input, 'click');
      
      fireEvent.keyDown(uploadZone, { key: 'Enter' });
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('opens file dialog on Space key', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const input = uploadZone.querySelector('input[type="file"]') as HTMLInputElement;
      
      const clickSpy = vi.spyOn(input, 'click');
      
      fireEvent.keyDown(uploadZone, { key: ' ' });
      
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('does not process files when disabled', async () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} disabled={true} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const validFile = createMockFile('test.md', 1024);
      
      fireEvent(uploadZone, createDragEvent('drop', [validFile]));

      await waitFor(() => {
        expect(mockOnFileSelect).not.toHaveBeenCalled();
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });

    it('does not open file dialog when disabled', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} disabled={true} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      const input = uploadZone.querySelector('input[type="file"]') as HTMLInputElement;
      
      const clickSpy = vi.spyOn(input, 'click');
      
      fireEvent.click(uploadZone);
      
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Custom Props', () => {
    it('respects custom accept prop', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} accept=".txt,.md" />
        </TestWrapper>
      );

      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', '.txt,.md');
    });

    it('respects custom maxSize prop', async () => {
      const customMaxSize = 2 * 1024 * 1024; // 2MB
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} maxSize={customMaxSize} />
        </TestWrapper>
      );

      const largeFile = createMockFile('large.md', customMaxSize + 1);
      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('File is too large. Maximum size is 2MB')
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      expect(uploadZone).toHaveAttribute('aria-label', 'File upload zone for Markdown files');
      expect(uploadZone).toHaveAttribute('tabIndex', '0');
    });

    it('has proper focus management', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const uploadZone = screen.getByRole('button');
      uploadZone.focus();
      expect(uploadZone).toHaveFocus();
    });

    it('hides file input from screen readers', () => {
      render(
        <TestWrapper>
          <FileUploadZone {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-hidden', 'true');
      expect(input).toHaveClass('hidden');
    });
  });
});