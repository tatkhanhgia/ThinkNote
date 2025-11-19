import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccessibilityHelpers } from '../AccessibilityHelpers';

// Mock DOM methods
const mockFocus = vi.fn();
const mockClick = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockSetAttribute = vi.fn();
const mockDispatchEvent = vi.fn();

// Mock HTMLElement
const createMockElement = (tagName: string = 'div') => ({
  tagName: tagName.toUpperCase(),
  focus: mockFocus,
  click: mockClick,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  querySelectorAll: mockQuerySelectorAll,
  setAttribute: mockSetAttribute,
  dispatchEvent: mockDispatchEvent,
  hasAttribute: vi.fn().mockReturnValue(false),
  getAttribute: vi.fn().mockReturnValue(null),
  hidden: false,
  tabIndex: 0,
  textContent: '',
  className: ''
});

// Mock document
const mockDocument = {
  activeElement: null,
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    insertBefore: vi.fn(),
    firstChild: null
  }
};

// Mock window
const mockWindow = {
  getComputedStyle: vi.fn().mockReturnValue({
    display: 'block',
    visibility: 'visible'
  })
};

// Setup global mocks
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('AccessibilityHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocument.activeElement = null;
  });

  describe('getFocusableElements', () => {
    it('should find focusable elements', () => {
      const container = createMockElement();
      const focusableElements = [
        createMockElement('button'),
        createMockElement('input'),
        createMockElement('a')
      ];
      
      mockQuerySelectorAll.mockReturnValue(focusableElements);

      const result = AccessibilityHelpers.getFocusableElements(container as any);

      expect(mockQuerySelectorAll).toHaveBeenCalledWith(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
      );
      expect(result).toEqual(focusableElements);
    });

    it('should return empty array when no focusable elements found', () => {
      const container = createMockElement();
      mockQuerySelectorAll.mockReturnValue([]);

      const result = AccessibilityHelpers.getFocusableElements(container as any);

      expect(result).toEqual([]);
    });
  });

  describe('trapFocus', () => {
    it('should set up focus trap with multiple elements', () => {
      const container = createMockElement();
      const firstElement = createMockElement('button');
      const lastElement = createMockElement('input');
      
      mockQuerySelectorAll.mockReturnValue([firstElement, lastElement]);

      const cleanup = AccessibilityHelpers.trapFocus(container as any);

      expect(mockFocus).toHaveBeenCalledWith(); // First element should be focused
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Test cleanup
      cleanup();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should return no-op cleanup for containers with no focusable elements', () => {
      const container = createMockElement();
      mockQuerySelectorAll.mockReturnValue([]);

      const cleanup = AccessibilityHelpers.trapFocus(container as any);

      expect(mockFocus).not.toHaveBeenCalled();
      expect(mockAddEventListener).not.toHaveBeenCalled();
      
      // Should not throw
      cleanup();
    });
  });

  describe('setupKeyboardNavigation', () => {
    it('should set up keyboard navigation with default options', () => {
      const container = createMockElement();
      const focusableElements = [
        createMockElement('button'),
        createMockElement('input')
      ];
      
      mockQuerySelectorAll.mockReturnValue(focusableElements);

      const cleanup = AccessibilityHelpers.setupKeyboardNavigation(container as any);

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

      cleanup();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should focus first element when autoFocus is enabled', () => {
      const container = createMockElement();
      const focusableElements = [createMockElement('button')];
      
      mockQuerySelectorAll.mockReturnValue(focusableElements);

      AccessibilityHelpers.setupKeyboardNavigation(container as any, {
        autoFocus: true
      });

      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe('applyAriaAttributes', () => {
    it('should apply ARIA attributes to element', () => {
      const element = createMockElement();
      const attributes = {
        'aria-label': 'Test label',
        'aria-expanded': true,
        'tabIndex': 0
      };

      AccessibilityHelpers.applyAriaAttributes(element as any, attributes);

      expect(mockSetAttribute).toHaveBeenCalledWith('aria-label', 'Test label');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
      expect(element.tabIndex).toBe(0);
    });

    it('should skip undefined and null values', () => {
      const element = createMockElement();
      const attributes = {
        'aria-label': undefined,
        'aria-expanded': null,
        'aria-hidden': false
      };

      AccessibilityHelpers.applyAriaAttributes(element as any, attributes);

      expect(mockSetAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
      expect(mockSetAttribute).not.toHaveBeenCalledWith('aria-label', expect.anything());
      expect(mockSetAttribute).not.toHaveBeenCalledWith('aria-expanded', expect.anything());
    });
  });

  describe('createAccessibleButton', () => {
    it('should create button with accessibility features', () => {
      const mockButton = createMockElement('button');
      mockDocument.createElement.mockReturnValue(mockButton);
      
      const onClick = vi.fn();
      const button = AccessibilityHelpers.createAccessibleButton(
        'Click me',
        onClick,
        {
          ariaLabel: 'Custom label',
          disabled: true,
          className: 'btn-primary'
        }
      );

      expect(mockDocument.createElement).toHaveBeenCalledWith('button');
      expect(button.textContent).toBe('Click me');
      expect(button.onclick).toBe(onClick);
      expect(button.disabled).toBe(true);
      expect(button.className).toBe('btn-primary');
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      const mockAnnouncement = createMockElement('div');
      mockDocument.createElement.mockReturnValue(mockAnnouncement);

      AccessibilityHelpers.announceToScreenReader('Test message', 'assertive');

      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockAnnouncement.textContent).toBe('Test message');
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnnouncement);
    });

    it('should use polite priority by default', () => {
      const mockAnnouncement = createMockElement('div');
      mockDocument.createElement.mockReturnValue(mockAnnouncement);

      AccessibilityHelpers.announceToScreenReader('Test message');

      expect(mockSetAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    });
  });

  describe('isVisibleToScreenReader', () => {
    it('should return false for aria-hidden elements', () => {
      const element = createMockElement();
      element.hasAttribute = vi.fn().mockReturnValue(true);
      element.getAttribute = vi.fn().mockReturnValue('true');

      const result = AccessibilityHelpers.isVisibleToScreenReader(element as any);

      expect(result).toBe(false);
    });

    it('should return false for display:none elements', () => {
      const element = createMockElement();
      mockWindow.getComputedStyle.mockReturnValue({
        display: 'none',
        visibility: 'visible'
      });

      const result = AccessibilityHelpers.isVisibleToScreenReader(element as any);

      expect(result).toBe(false);
    });

    it('should return false for visibility:hidden elements', () => {
      const element = createMockElement();
      mockWindow.getComputedStyle.mockReturnValue({
        display: 'block',
        visibility: 'hidden'
      });

      const result = AccessibilityHelpers.isVisibleToScreenReader(element as any);

      expect(result).toBe(false);
    });

    it('should return false for hidden elements', () => {
      const element = createMockElement();
      element.hidden = true;

      const result = AccessibilityHelpers.isVisibleToScreenReader(element as any);

      expect(result).toBe(false);
    });

    it('should return true for visible elements', () => {
      const element = createMockElement();
      mockWindow.getComputedStyle.mockReturnValue({
        display: 'block',
        visibility: 'visible'
      });

      const result = AccessibilityHelpers.isVisibleToScreenReader(element as any);

      expect(result).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs with prefix', () => {
      const id1 = AccessibilityHelpers.generateId('test');
      const id2 = AccessibilityHelpers.generateId('test');

      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should use default prefix', () => {
      const id = AccessibilityHelpers.generateId();

      expect(id).toMatch(/^aria-\d+-[a-z0-9]+$/);
    });
  });

  describe('createLiveRegion', () => {
    it('should create live region with specified priority', () => {
      const mockLiveRegion = createMockElement('div');
      mockDocument.createElement.mockReturnValue(mockLiveRegion);

      const liveRegion = AccessibilityHelpers.createLiveRegion('assertive', false);

      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-atomic', 'false');
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockLiveRegion);
      expect(liveRegion).toBe(mockLiveRegion);
    });

    it('should use default values', () => {
      const mockLiveRegion = createMockElement('div');
      mockDocument.createElement.mockReturnValue(mockLiveRegion);

      AccessibilityHelpers.createLiveRegion();

      expect(mockSetAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockSetAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
    });
  });

  describe('updateLiveRegion', () => {
    it('should update live region content', () => {
      const liveRegion = createMockElement('div');

      AccessibilityHelpers.updateLiveRegion(liveRegion as any, 'Updated message');

      expect(liveRegion.textContent).toBe('Updated message');
    });
  });

  describe('checkColorContrast', () => {
    it('should return contrast check result', () => {
      const result = AccessibilityHelpers.checkColorContrast('#000000', '#ffffff', 'AA');

      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('passes');
      expect(typeof result.ratio).toBe('number');
      expect(typeof result.passes).toBe('boolean');
    });

    it('should use AA level by default', () => {
      const result = AccessibilityHelpers.checkColorContrast('#000000', '#ffffff');

      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('passes');
    });
  });

  describe('addSkipLink', () => {
    it('should create and add skip link', () => {
      const mockSkipLink = createMockElement('a');
      mockDocument.createElement.mockReturnValue(mockSkipLink);

      const skipLink = AccessibilityHelpers.addSkipLink('main-content', 'Skip to content');

      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
      expect(mockSkipLink.href).toBe('#main-content');
      expect(mockSkipLink.textContent).toBe('Skip to content');
      expect(mockDocument.body.insertBefore).toHaveBeenCalledWith(mockSkipLink, null);
    });

    it('should use default link text', () => {
      const mockSkipLink = createMockElement('a');
      mockDocument.createElement.mockReturnValue(mockSkipLink);

      AccessibilityHelpers.addSkipLink('main-content');

      expect(mockSkipLink.textContent).toBe('Skip to main content');
    });
  });

  describe('createFocusManager', () => {
    it('should save and restore focus', () => {
      const mockElement = createMockElement('button');
      mockDocument.activeElement = mockElement;

      const focusManager = AccessibilityHelpers.createFocusManager();

      focusManager.saveFocus();
      focusManager.restoreFocus();

      expect(mockFocus).toHaveBeenCalled();
    });

    it('should handle null activeElement', () => {
      mockDocument.activeElement = null;

      const focusManager = AccessibilityHelpers.createFocusManager();

      focusManager.saveFocus();
      focusManager.restoreFocus();

      // Should not throw
      expect(mockFocus).not.toHaveBeenCalled();
    });
  });
});