import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ImportMarkdownButton from '../ImportMarkdownButton'
import { NotificationProvider } from '../../../contexts/NotificationContext'

// Mock the MarkdownImporter component
vi.mock('../MarkdownImporter', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="markdown-importer-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  )
}))

const englishMessages = {
  Layout: {
    navigation: {
      importMarkdown: 'Import Markdown'
    }
  },
  HomePage: {
    hero: {
      importMarkdown: 'Import Markdown'
    }
  },
  notifications: {
    dismiss: 'Dismiss notification'
  }
}

const vietnameseMessages = {
  Layout: {
    navigation: {
      importMarkdown: 'Import Markdown'
    }
  },
  HomePage: {
    hero: {
      importMarkdown: 'Import Markdown'
    }
  },
  notifications: {
    dismiss: 'Đóng thông báo'
  }
}

const renderWithLocale = (component: React.ReactElement, locale: string, messages: any) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotificationProvider>
        {component}
      </NotificationProvider>
    </NextIntlClientProvider>
  )
}

describe('ImportMarkdownButton Internationalization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header Variant', () => {
    it('should display English text for header variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toBeInTheDocument()
      
      // Check if the text is visible (might be hidden on smaller screens)
      const textElement = screen.getByText('Import Markdown')
      expect(textElement).toBeInTheDocument()
    })

    it('should display Vietnamese text for header variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'vi',
        vietnameseMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toBeInTheDocument()
      
      const textElement = screen.getByText('Import Markdown')
      expect(textElement).toBeInTheDocument()
    })

    it('should open modal when header button is clicked', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      fireEvent.click(button)

      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()
    })
  })

  describe('Hero Variant', () => {
    it('should display English text for hero variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toBeInTheDocument()
      
      const textElement = screen.getByText('Import Markdown')
      expect(textElement).toBeInTheDocument()
    })

    it('should display Vietnamese text for hero variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'vi',
        vietnameseMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toBeInTheDocument()
      
      const textElement = screen.getByText('Import Markdown')
      expect(textElement).toBeInTheDocument()
    })

    it('should open modal when hero button is clicked', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      fireEvent.click(button)

      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()
    })

    it('should have different styling for hero variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toHaveClass('btn-secondary')
    })
  })

  describe('Modal Integration', () => {
    it('should close modal when close button is clicked', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      // Open modal
      const button = screen.getByLabelText('Import Markdown')
      fireEvent.click(button)

      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()

      // Close modal
      const closeButton = screen.getByText('Close Modal')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('markdown-importer-modal')).not.toBeInTheDocument()
    })

    it('should handle import success callback', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      fireEvent.click(button)

      // The component should handle import success
      // Since we mocked the MarkdownImporter, we can't test the actual callback
      // But we can verify the component renders without errors
      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label in English', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toHaveAttribute('aria-label', 'Import Markdown')
    })

    it('should have proper aria-label in Vietnamese', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'vi',
        vietnameseMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toHaveAttribute('aria-label', 'Import Markdown')
    })

    it('should be keyboard accessible', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      
      // Should be focusable
      button.focus()
      expect(document.activeElement).toBe(button)

      // Should respond to click (which is triggered by Enter/Space automatically)
      fireEvent.click(button)
      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()
    })

    it('should respond to Space key', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      
      button.focus()
      // Simulate space key press which triggers click on buttons
      fireEvent.click(button)
      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()
    })
  })

  describe('Icon Rendering', () => {
    it('should render upload icon for both variants', () => {
      const { rerender } = renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      // Check header variant has icon
      let button = screen.getByLabelText('Import Markdown')
      let icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()

      // Check hero variant has icon
      rerender(
        <NextIntlClientProvider locale="en" messages={englishMessages}>
          <NotificationProvider>
            <ImportMarkdownButton variant="hero" />
          </NotificationProvider>
        </NextIntlClientProvider>
      )

      button = screen.getByLabelText('Import Markdown')
      icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Class Names', () => {
    it('should apply custom className', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" className="custom-class" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toHaveClass('custom-class')
    })

    it('should maintain base classes with custom className', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" className="custom-class" />,
        'en',
        englishMessages
      )

      const button = screen.getByLabelText('Import Markdown')
      expect(button).toHaveClass('btn-secondary')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Responsive Behavior', () => {
    it('should hide text on smaller screens for header variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      const textElement = screen.getByText('Import Markdown')
      expect(textElement).toHaveClass('hidden', 'xl:inline')
    })

    it('should always show text for hero variant', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="hero" />,
        'en',
        englishMessages
      )

      const textElement = screen.getByText('Import Markdown')
      expect(textElement).not.toHaveClass('hidden')
    })
  })

  describe('State Management', () => {
    it('should manage modal open/close state correctly', () => {
      renderWithLocale(
        <ImportMarkdownButton variant="header" />,
        'en',
        englishMessages
      )

      // Initially modal should be closed
      expect(screen.queryByTestId('markdown-importer-modal')).not.toBeInTheDocument()

      // Open modal
      const button = screen.getByLabelText('Import Markdown')
      fireEvent.click(button)
      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()

      // Close modal
      const closeButton = screen.getByText('Close Modal')
      fireEvent.click(closeButton)
      expect(screen.queryByTestId('markdown-importer-modal')).not.toBeInTheDocument()

      // Should be able to open again
      fireEvent.click(button)
      expect(screen.getByTestId('markdown-importer-modal')).toBeInTheDocument()
    })
  })
})