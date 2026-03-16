export interface FocusableElement extends HTMLElement {
  focus(): void;
}

export interface KeyboardNavigationOptions {
  enableArrowKeys?: boolean;
  enableTabNavigation?: boolean;
  enableEnterActivation?: boolean;
  enableEscapeClose?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export interface AriaAttributes {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-pressed'?: boolean;
  'aria-current'?: string;
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-activedescendant'?: string;
  tabIndex?: number;
}

export class AccessibilityHelpers {
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): FocusableElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = container.querySelectorAll(focusableSelectors);
    return Array.from(elements) as FocusableElement[];
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      return () => {}; // No cleanup needed
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus the first element
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Set up keyboard navigation for a list of elements
   */
  static setupKeyboardNavigation(
    container: HTMLElement,
    options: KeyboardNavigationOptions = {}
  ): () => void {
    const {
      enableArrowKeys = true,
      enableTabNavigation = true,
      enableEnterActivation = true,
      enableEscapeClose = false,
      trapFocus = false,
      autoFocus = false
    } = options;

    const focusableElements = this.getFocusableElements(container);
    let currentIndex = 0;

    if (autoFocus && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (enableArrowKeys && (key === 'ArrowDown' || key === 'ArrowUp')) {
        event.preventDefault();
        
        if (key === 'ArrowDown') {
          currentIndex = (currentIndex + 1) % focusableElements.length;
        } else {
          currentIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        }
        
        focusableElements[currentIndex].focus();
      }

      if (enableEnterActivation && key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && focusableElements.includes(activeElement as FocusableElement)) {
          activeElement.click();
        }
      }

      if (enableEscapeClose && key === 'Escape') {
        // Dispatch custom escape event
        container.dispatchEvent(new CustomEvent('escape-pressed'));
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Set up focus trap if enabled
    let cleanupFocusTrap: (() => void) | null = null;
    if (trapFocus) {
      cleanupFocusTrap = this.trapFocus(container);
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (cleanupFocusTrap) {
        cleanupFocusTrap();
      }
    };
  }

  /**
   * Apply ARIA attributes to an element
   */
  static applyAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tabIndex') {
          element.tabIndex = value as number;
        } else {
          element.setAttribute(key, String(value));
        }
      }
    });
  }

  /**
   * Create an accessible button with proper ARIA attributes
   */
  static createAccessibleButton(
    text: string,
    onClick: () => void,
    options: {
      ariaLabel?: string;
      ariaDescribedBy?: string;
      disabled?: boolean;
      className?: string;
    } = {}
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;

    const ariaAttributes: AriaAttributes = {
      'aria-label': options.ariaLabel,
      'aria-describedby': options.ariaDescribedBy,
      'aria-disabled': options.disabled
    };

    this.applyAriaAttributes(button, ariaAttributes);

    if (options.className) {
      button.className = options.className;
    }

    if (options.disabled) {
      button.disabled = true;
    }

    return button;
  }

  /**
   * Announce text to screen readers
   */
  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only class
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Check if an element is visible to screen readers
   */
  static isVisibleToScreenReader(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    
    return !(
      element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true' ||
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      element.hidden
    );
  }

  /**
   * Generate unique IDs for ARIA relationships
   */
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up live region for dynamic content updates
   */
  static createLiveRegion(
    priority: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
  ): HTMLElement {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', String(atomic));
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    
    return liveRegion;
  }

  /**
   * Update live region content
   */
  static updateLiveRegion(liveRegion: HTMLElement, message: string): void {
    liveRegion.textContent = message;
  }

  /**
   * Check color contrast ratio (simplified)
   */
  static checkColorContrast(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): { ratio: number; passes: boolean } {
    // This is a simplified implementation
    // In a real application, you'd use a proper color contrast library
    const minRatio = level === 'AAA' ? 7 : 4.5;
    
    // Simplified calculation - in reality you'd need proper color parsing
    const ratio = 4.5; // Placeholder
    
    return {
      ratio,
      passes: ratio >= minRatio
    };
  }

  /**
   * Add skip link for keyboard navigation
   */
  static addSkipLink(
    targetId: string,
    linkText: string = 'Skip to main content'
  ): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = linkText;
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white';
    
    // Insert at the beginning of the body
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return skipLink;
  }

  /**
   * Manage focus restoration after modal closes
   */
  static createFocusManager(): {
    saveFocus: () => void;
    restoreFocus: () => void;
  } {
    let previouslyFocusedElement: HTMLElement | null = null;

    return {
      saveFocus: () => {
        previouslyFocusedElement = document.activeElement as HTMLElement;
      },
      restoreFocus: () => {
        if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
          previouslyFocusedElement.focus();
        }
      }
    };
  }
}

/**
 * React hook for accessibility features
 */
export const useAccessibility = () => {
  return {
    announceToScreenReader: AccessibilityHelpers.announceToScreenReader,
    generateId: AccessibilityHelpers.generateId,
    createFocusManager: AccessibilityHelpers.createFocusManager
  };
};