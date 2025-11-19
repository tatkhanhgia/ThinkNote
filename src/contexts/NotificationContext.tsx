'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationSystem, { Notification, NotificationAction } from '../components/ui/NotificationSystem';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => string
  showSuccess: (title: string, message: string, actions?: NotificationAction[]) => string
  showError: (title: string, message: string, actions?: NotificationAction[]) => string
  showWarning: (title: string, message: string, actions?: NotificationAction[]) => string
  showInfo: (title: string, message: string, actions?: NotificationAction[]) => string
  dismissNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const showSuccess = useCallback((title: string, message: string, actions?: NotificationAction[]) => {
    return showNotification({
      type: 'success',
      title,
      message,
      actions,
      duration: 5000
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, actions?: NotificationAction[]) => {
    return showNotification({
      type: 'error',
      title,
      message,
      actions,
      persistent: true
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, actions?: NotificationAction[]) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      actions,
      duration: 7000
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, actions?: NotificationAction[]) => {
    return showNotification({
      type: 'info',
      title,
      message,
      actions,
      duration: 5000
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};