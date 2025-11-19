import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import NotificationSystem, { Notification } from '../NotificationSystem'
import { afterEach } from 'node:test'

const messages = {
  notifications: {
    dismiss: 'Dismiss notification'
  }
}

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('NotificationSystem', () => {
  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render nothing when no notifications', () => {
    const { container } = renderWithIntl(
      <NotificationSystem notifications={[]} onDismiss={mockOnDismiss} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render success notification', () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully'
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
  })

  it('should render error notification', () => {
    const notification: Notification = {
      id: '1',
      type: 'error',
      title: 'Error',
      message: 'Something went wrong'
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render warning notification', () => {
    const notification: Notification = {
      id: '1',
      type: 'warning',
      title: 'Warning',
      message: 'Please be careful'
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Please be careful')).toBeInTheDocument()
  })

  it('should render info notification', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      title: 'Info',
      message: 'Here is some information'
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByText('Here is some information')).toBeInTheDocument()
  })

  it('should render notification actions', () => {
    const mockAction = vi.fn()
    const notification: Notification = {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
      actions: [
        {
          label: 'Undo',
          onClick: mockAction,
          variant: 'primary'
        }
      ]
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    const undoButton = screen.getByText('Undo')
    expect(undoButton).toBeInTheDocument()

    fireEvent.click(undoButton)
    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('should call onDismiss when dismiss button is clicked', () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed'
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    const dismissButton = screen.getByLabelText('Dismiss notification')
    fireEvent.click(dismissButton)

    expect(mockOnDismiss).toHaveBeenCalledWith('1')
  })

  it('should auto-dismiss non-persistent notifications', async () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
      duration: 1000
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    // Fast-forward time
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('1')
    }, { timeout: 2000 })
  })

  it('should not auto-dismiss persistent notifications', async () => {
    const notification: Notification = {
      id: '1',
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
      persistent: true
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    // Fast-forward time
    vi.advanceTimersByTime(10000)

    // Should not be dismissed
    expect(mockOnDismiss).not.toHaveBeenCalled()
  })

  it('should render multiple notifications', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Success 1',
        message: 'First success'
      },
      {
        id: '2',
        type: 'error',
        title: 'Error 1',
        message: 'First error'
      }
    ]

    renderWithIntl(
      <NotificationSystem notifications={notifications} onDismiss={mockOnDismiss} />
    )

    expect(screen.getByText('Success 1')).toBeInTheDocument()
    expect(screen.getByText('First success')).toBeInTheDocument()
    expect(screen.getByText('Error 1')).toBeInTheDocument()
    expect(screen.getByText('First error')).toBeInTheDocument()
  })

  it('should handle notifications with zero duration', () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
      duration: 0
    }

    renderWithIntl(
      <NotificationSystem notifications={[notification]} onDismiss={mockOnDismiss} />
    )

    // Fast-forward time
    vi.advanceTimersByTime(10000)

    // Should not be auto-dismissed
    expect(mockOnDismiss).not.toHaveBeenCalled()
  })
})