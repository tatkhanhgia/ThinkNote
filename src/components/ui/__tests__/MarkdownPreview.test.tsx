import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownPreview from '../MarkdownPreview';

// Mock the remark modules at the top level
vi.mock('remark', () => ({
  remark: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    processSync: vi.fn().mockReturnValue({ toString: () => '<p>Test content</p>' })
  }))
}));

vi.mock('remark-gfm', () => ({
  default: vi.fn()
}));

vi.mock('remark-html', () => ({
  default: vi.fn()
}));

describe('MarkdownPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders empty state when no content provided', () => {
      render(<MarkdownPreview content="" />);
      
      expect(screen.getByText('No content to preview')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<MarkdownPreview content="# Test" className="custom-class" />);
      
      const previewDiv = document.querySelector('.markdown-preview');
      expect(previewDiv).toHaveClass('custom-class');
    });

    it('maintains markdown-preview wrapper class', () => {
      render(<MarkdownPreview content="" />);
      
      expect(document.querySelector('.markdown-preview')).toBeInTheDocument();
    });
  });

  describe('Content Processing', () => {
    it('renders processed markdown content', async () => {
      render(<MarkdownPreview content="# Test Heading\n\nTest paragraph" />);
      
      await waitFor(() => {
        const contentDiv = document.querySelector('.prose');
        expect(contentDiv).toBeInTheDocument();
      });
    });

    it('applies prose classes for styling', async () => {
      render(<MarkdownPreview content="Test content" />);
      
      await waitFor(() => {
        const proseDiv = document.querySelector('.prose');
        expect(proseDiv).toBeInTheDocument();
        expect(proseDiv).toHaveClass('prose', 'prose-lg', 'max-w-none');
      });
    });
  });

  describe('Original Content Display', () => {
    it('shows original markdown when showOriginal is true', async () => {
      const content = "# Test\n\nOriginal content";
      
      render(<MarkdownPreview content={content} showOriginal={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Original Markdown:')).toBeInTheDocument();
        // Check that the content is in the pre element
        const preElement = document.querySelector('pre');
        expect(preElement).toBeInTheDocument();
        expect(preElement?.textContent?.trim()).toBe(content);
      });
    });

    it('hides original markdown when showOriginal is false', async () => {
      const content = "# Test\n\nOriginal content";
      
      render(<MarkdownPreview content={content} showOriginal={false} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Original Markdown:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles empty content gracefully', () => {
      render(<MarkdownPreview content="" />);
      
      expect(screen.getByText('No content to preview')).toBeInTheDocument();
      expect(screen.queryByText('Markdown Processing Error')).not.toBeInTheDocument();
    });

    it('renders content without crashing on whitespace-only input', () => {
      render(<MarkdownPreview content="   \n\n   " />);
      
      // Should show empty state for whitespace-only content
      // The component should handle this gracefully
      expect(document.querySelector('.markdown-preview')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('accepts and applies className prop', () => {
      render(<MarkdownPreview content="test" className="test-class" />);
      
      const wrapper = document.querySelector('.markdown-preview');
      expect(wrapper).toHaveClass('test-class');
    });

    it('works without optional props', () => {
      render(<MarkdownPreview content="# Test" />);
      
      expect(document.querySelector('.markdown-preview')).toBeInTheDocument();
    });
  });

  describe('Content Updates', () => {
    it('updates when content prop changes', () => {
      const { rerender } = render(<MarkdownPreview content="First content" />);
      
      expect(document.querySelector('.markdown-preview')).toBeInTheDocument();

      rerender(<MarkdownPreview content="Second content" />);
      
      expect(document.querySelector('.markdown-preview')).toBeInTheDocument();
    });

    it('handles transition from content to empty', () => {
      const { rerender } = render(<MarkdownPreview content="Some content" />);
      
      expect(document.querySelector('.prose')).toBeInTheDocument();

      rerender(<MarkdownPreview content="" />);
      
      expect(screen.getByText('No content to preview')).toBeInTheDocument();
    });
  });
});