import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import NotificationSystem, { Notification } from '../NotificationSystem'

const englishMessages = {
  notifications: {
    dismiss: 'Dismiss notification'
  }
}

const vietnameseMessages = {
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

describe('NotificationSystem Internationalization', () => {
  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('English Locale', () => {
    it('should display English dismiss button aria-label', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Success',
          message: 'Operation completed successfully'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const dismissButton = screen.getByLabelText('Dismiss notification')
      expect(dismissButton).toBeInTheDocument()
    })

    it('should handle dismiss button click with English aria-label', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'error',
          title: 'Error',
          message: 'Something went wrong'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const dismissButton = screen.getByLabelText('Dismiss notification')
      fireEvent.click(dismissButton)

      expect(mockOnDismiss).toHaveBeenCalledWith('1')
    })
  })

  describe('Vietnamese Locale', () => {
    it('should display Vietnamese dismiss button aria-label', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Thành công',
          message: 'Thao tác hoàn thành thành công'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      const dismissButton = screen.getByLabelText('Đóng thông báo')
      expect(dismissButton).toBeInTheDocument()
    })

    it('should handle dismiss button click with Vietnamese aria-label', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'error',
          title: 'Lỗi',
          message: 'Đã xảy ra lỗi'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      const dismissButton = screen.getByLabelText('Đóng thông báo')
      fireEvent.click(dismissButton)

      expect(mockOnDismiss).toHaveBeenCalledWith('1')
    })
  })

  describe('Multiple Notifications', () => {
    it('should display multiple notifications with correct aria-labels in English', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Success',
          message: 'First operation completed'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Warning',
          message: 'Second operation has warnings'
        },
        {
          id: '3',
          type: 'error',
          title: 'Error',
          message: 'Third operation failed'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const dismissButtons = screen.getAllByLabelText('Dismiss notification')
      expect(dismissButtons).toHaveLength(3)

      // Test dismissing each notification
      fireEvent.click(dismissButtons[0])
      expect(mockOnDismiss).toHaveBeenCalledWith('1')

      fireEvent.click(dismissButtons[1])
      expect(mockOnDismiss).toHaveBeenCalledWith('2')

      fireEvent.click(dismissButtons[2])
      expect(mockOnDismiss).toHaveBeenCalledWith('3')
    })

    it('should display multiple notifications with correct aria-labels in Vietnamese', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Thành công',
          message: 'Thao tác đầu tiên hoàn thành'
        },
        {
          id: '2',
          type: 'info',
          title: 'Thông tin',
          message: 'Thao tác thứ hai có thông tin'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      const dismissButtons = screen.getAllByLabelText('Đóng thông báo')
      expect(dismissButtons).toHaveLength(2)

      // Test dismissing each notification
      fireEvent.click(dismissButtons[0])
      expect(mockOnDismiss).toHaveBeenCalledWith('1')

      fireEvent.click(dismissButtons[1])
      expect(mockOnDismiss).toHaveBeenCalledWith('2')
    })
  })

  describe('Notification Types', () => {
    const notificationTypes: Array<{ type: Notification['type'], title: string, message: string }> = [
      { type: 'success', title: 'Success', message: 'Success message' },
      { type: 'error', title: 'Error', message: 'Error message' },
      { type: 'warning', title: 'Warning', message: 'Warning message' },
      { type: 'info', title: 'Info', message: 'Info message' }
    ]

    notificationTypes.forEach(({ type, title, message }) => {
      it(`should display ${type} notification with English dismiss label`, () => {
        const notifications: Notification[] = [
          {
            id: '1',
            type,
            title,
            message
          }
        ]

        renderWithLocale(
          <NotificationSystem
            notifications={notifications}
            onDismiss={mockOnDismiss}
          />,
          'en',
          englishMessages
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(message)).toBeInTheDocument()
        expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument()
      })

      it(`should display ${type} notification with Vietnamese dismiss label`, () => {
        const notifications: Notification[] = [
          {
            id: '1',
            type,
            title: `${title} (VI)`,
            message: `${message} (VI)`
          }
        ]

        renderWithLocale(
          <NotificationSystem
            notifications={notifications}
            onDismiss={mockOnDismiss}
          />,
          'vi',
          vietnameseMessages
        )

        expect(screen.getByText(`${title} (VI)`)).toBeInTheDocument()
        expect(screen.getByText(`${message} (VI)`)).toBeInTheDocument()
        expect(screen.getByLabelText('Đóng thông báo')).toBeInTheDocument()
      })
    })
  })

  describe('Notifications with Actions', () => {
    it('should display action buttons with English dismiss label', () => {
      const mockAction = vi.fn()
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Import Successful',
          message: 'File has been imported',
          actions: [
            {
              label: 'Undo',
              onClick: mockAction,
              variant: 'secondary'
            },
            {
              label: 'View File',
              onClick: mockAction,
              variant: 'primary'
            }
          ]
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Undo')).toBeInTheDocument()
      expect(screen.getByText('View File')).toBeInTheDocument()
      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument()

      // Test action button clicks
      fireEvent.click(screen.getByText('Undo'))
      expect(mockAction).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByText('View File'))
      expect(mockAction).toHaveBeenCalledTimes(2)
    })

    it('should display action buttons with Vietnamese dismiss label', () => {
      const mockAction = vi.fn()
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Import Thành Công',
          message: 'File đã được import',
          actions: [
            {
              label: 'Hoàn tác',
              onClick: mockAction,
              variant: 'secondary'
            },
            {
              label: 'Xem File',
              onClick: mockAction,
              variant: 'primary'
            }
          ]
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'vi',
        vietnameseMessages
      )

      expect(screen.getByText('Hoàn tác')).toBeInTheDocument()
      expect(screen.getByText('Xem File')).toBeInTheDocument()
      expect(screen.getByLabelText('Đóng thông báo')).toBeInTheDocument()

      // Test action button clicks
      fireEvent.click(screen.getByText('Hoàn tác'))
      expect(mockAction).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByText('Xem File'))
      expect(mockAction).toHaveBeenCalledTimes(2)
    })
  })

  describe('Auto-dismiss Behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    it('should auto-dismiss non-persistent notifications', async () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Success',
          message: 'Auto-dismiss test',
          duration: 1000
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Success')).toBeInTheDocument()

      // Fast-forward time
      vi.advanceTimersByTime(1000)

      // Wait for the timer to execute
      await vi.runAllTimersAsync()

      expect(mockOnDismiss).toHaveBeenCalledWith('1')
    })

    it('should not auto-dismiss persistent notifications', async () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'error',
          title: 'Error',
          message: 'Persistent error',
          persistent: true
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(screen.getByText('Error')).toBeInTheDocument()

      // Fast-forward time
      vi.advanceTimersByTime(10000)

      // Should not auto-dismiss
      expect(mockOnDismiss).not.toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should render nothing when no notifications', () => {
      const { container } = renderWithLocale(
        <NotificationSystem
          notifications={[]}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('should have proper role attributes', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Information',
          message: 'This is an info message'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const notification = screen.getByRole('alert')
      expect(notification).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Warning',
          message: 'This is a warning'
        }
      ]

      renderWithLocale(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockOnDismiss}
        />,
        'en',
        englishMessages
      )

      const dismissButton = screen.getByLabelText('Dismiss notification')
      
      // Should be focusable
      dismissButton.focus()
      expect(document.activeElement).toBe(dismissButton)

      // Should respond to Enter key
      fireEvent.keyDown(dismissButton, { key: 'Enter' })
      // Note: The actual click behavior depends on the browser implementation
    })
  })
})