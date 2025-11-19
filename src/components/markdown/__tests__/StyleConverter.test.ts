/**
 * @jest-environment jsdom
 */

import { StyleConverter } from '../StyleConverter';

// Mock DOM methods for testing
const mockElement = (tagName: string, innerHTML = '', attributes: Record<string, string> = {}) => {
  const element = document.createElement(tagName);
  element.innerHTML = innerHTML;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

describe('StyleConverter', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('convertHtmlContent', () => {
    it('should apply project-specific classes to basic HTML elements', () => {
      const html = '<h1>Title</h1><p>Paragraph</p><a href="#">Link</a>';
      const result = StyleConverter.convertHtmlContent(html, { applyProseClasses: false });
      
      expect(result).toContain('heading-xl');
      expect(result).toContain('text-gray-600');
      expect(result).toContain('text-primary-600');
    });

    it('should wrap content in prose classes when applyProseClasses is true', () => {
      const html = '<p>Test content</p>';
      const result = StyleConverter.convertHtmlContent(html, { applyProseClasses: true });
      
      expect(result).toContain('prose prose-lg max-w-none');
    });

    it('should preserve original classes when preserveOriginalClasses is true', () => {
      const html = '<p class="existing-class">Test</p>';
      const result = StyleConverter.convertHtmlContent(html, { 
        preserveOriginalClasses: true,
        applyProseClasses: false 
      });
      
      expect(result).toContain('existing-class');
      expect(result).toContain('text-gray-600');
    });

    it('should apply custom mappings when provided', () => {
      const html = '<p>Test</p>';
      const customMappings = { 'p': 'custom-paragraph-class' };
      const result = StyleConverter.convertHtmlContent(html, { 
        customMappings,
        applyProseClasses: false 
      });
      
      expect(result).toContain('custom-paragraph-class');
    });

    it('should handle function-based mappings for code elements', () => {
      const html = '<code>inline code</code><pre><code>block code</code></pre>';
      const result = StyleConverter.convertHtmlContent(html, { applyProseClasses: false });
      
      // Inline code should have different classes than block code
      expect(result).toContain('bg-gray-100'); // inline code
      expect(result).toContain('bg-gray-900'); // pre block
    });

    it('should handle nested elements correctly', () => {
      const html = '<div><h2>Heading</h2><p>Text with <strong>bold</strong> and <em>italic</em></p></div>';
      const result = StyleConverter.convertHtmlContent(html, { applyProseClasses: false });
      
      expect(result).toContain('heading-lg');
      expect(result).toContain('font-semibold');
      expect(result).toContain('italic');
    });

    it('should handle empty or whitespace-only content', () => {
      expect(() => StyleConverter.convertHtmlContent('')).not.toThrow();
      expect(() => StyleConverter.convertHtmlContent('   ')).not.toThrow();
      expect(() => StyleConverter.convertHtmlContent('<div></div>')).not.toThrow();
    });
  });

  describe('convertInlineStyles', () => {
    it('should convert basic inline styles to Tailwind classes', () => {
      const html = '<p style="text-align: center; font-weight: bold;">Centered bold text</p>';
      const result = StyleConverter.convertInlineStyles(html);
      
      expect(result).toContain('text-center');
      expect(result).toContain('font-bold');
      expect(result).not.toContain('style=');
    });

    it('should handle multiple style declarations', () => {
      const html = '<span style="font-style: italic; text-decoration: underline;">Text</span>';
      const result = StyleConverter.convertInlineStyles(html);
      
      expect(result).toContain('italic');
      expect(result).toContain('underline');
    });

    it('should preserve existing classes when converting styles', () => {
      const html = '<p class="existing" style="text-align: center;">Text</p>';
      const result = StyleConverter.convertInlineStyles(html);
      
      expect(result).toContain('existing');
      expect(result).toContain('text-center');
    });

    it('should handle unsupported styles gracefully', () => {
      const html = '<p style="unknown-property: value;">Text</p>';
      const result = StyleConverter.convertInlineStyles(html);
      
      // Should not crash - unsupported styles are left as-is
      expect(result).toContain('Text');
      expect(() => StyleConverter.convertInlineStyles(html)).not.toThrow();
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove dangerous script elements', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>';
      const result = StyleConverter.sanitizeHtml(html);
      
      expect(result).toContain('Safe content');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should remove dangerous event handlers', () => {
      const html = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = StyleConverter.sanitizeHtml(html);
      
      expect(result).toContain('Click me');
      expect(result).not.toContain('onclick');
    });

    it('should sanitize dangerous href attributes', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = StyleConverter.sanitizeHtml(html);
      
      expect(result).toContain('Link');
      expect(result).not.toContain('javascript:');
    });

    it('should preserve safe HTML elements and attributes', () => {
      const html = '<p class="safe">Safe <strong>content</strong> with <a href="https://example.com">link</a></p>';
      const result = StyleConverter.sanitizeHtml(html);
      
      expect(result).toContain('class="safe"');
      expect(result).toContain('<strong>');
      expect(result).toContain('href="https://example.com"');
    });

    it('should remove form elements', () => {
      const html = '<p>Text</p><form><input type="text"><button>Submit</button></form>';
      const result = StyleConverter.sanitizeHtml(html);
      
      expect(result).toContain('Text');
      expect(result).not.toContain('form');
      expect(result).not.toContain('input');
      expect(result).not.toContain('button');
    });
  });

  describe('applyResponsiveClasses', () => {
    it('should add responsive classes to images', () => {
      const html = '<img src="test.jpg" alt="Test">';
      const result = StyleConverter.applyResponsiveClasses(html);
      
      expect(result).toContain('w-full');
      expect(result).toContain('md:w-auto');
      expect(result).toContain('max-w-full');
    });

    it('should wrap tables in overflow containers', () => {
      const html = '<table><tr><td>Cell</td></tr></table>';
      const result = StyleConverter.applyResponsiveClasses(html);
      
      expect(result).toContain('overflow-x-auto');
      expect(result).toContain('<table>');
    });

    it('should add break-words to headings', () => {
      const html = '<h1>Very long heading that might need to break</h1>';
      const result = StyleConverter.applyResponsiveClasses(html);
      
      expect(result).toContain('break-words');
    });

    it('should preserve existing classes when adding responsive classes', () => {
      const html = '<img class="existing-class" src="test.jpg">';
      const result = StyleConverter.applyResponsiveClasses(html);
      
      expect(result).toContain('existing-class');
      expect(result).toContain('w-full');
    });
  });

  describe('convertToProjectFormat', () => {
    it('should apply complete conversion pipeline', () => {
      const html = '<h1>Title</h1><p style="text-align: center;">Paragraph</p><script>alert("xss")</script>';
      const result = StyleConverter.convertToProjectFormat(html);
      
      // Should apply styling
      expect(result).toContain('heading-xl');
      expect(result).toContain('text-gray-600'); // paragraph styling
      
      // Should sanitize
      expect(result).not.toContain('script');
      
      // Should wrap in prose
      expect(result).toContain('prose');
    });

    it('should handle complex nested content', () => {
      const html = `
        <div>
          <h2>Section Title</h2>
          <p>Paragraph with <strong>bold</strong> text.</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
          <blockquote>Quote text</blockquote>
          <pre><code>Code block</code></pre>
        </div>
      `;
      
      const result = StyleConverter.convertToProjectFormat(html);
      
      expect(result).toContain('heading-lg');
      expect(result).toContain('list-disc');
      expect(result).toContain('border-l-4');
      expect(result).toContain('bg-gray-900');
    });
  });

  describe('validateConversion', () => {
    it('should validate successful conversion', () => {
      const original = '<h1>Title</h1><p>Content</p>';
      const converted = '<div class="prose"><h1 class="heading-xl">Title</h1><p class="text-gray-600">Content</p></div>';
      
      const validation = StyleConverter.validateConversion(original, converted);
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect missing elements', () => {
      const original = '<h1>Title</h1><p>Content</p>';
      const converted = '<div class="prose"><h1 class="heading-xl">Title</h1></div>'; // Missing paragraph
      
      const validation = StyleConverter.validateConversion(original, converted);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('p elements'))).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const original = '<invalid-html>';
      const converted = '<div>valid</div>';
      
      const validation = StyleConverter.validateConversion(original, converted);
      
      // Updated logic handles malformed HTML gracefully
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should allow minor element count differences', () => {
      const original = '<p>Content</p>';
      const converted = '<div class="prose"><p class="styled">Content</p></div>'; // Added wrapper
      
      const validation = StyleConverter.validateConversion(original, converted);
      
      // Should be valid as the difference is within acceptable range
      expect(validation.isValid).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedHtml = '<p>Unclosed paragraph<div>Nested incorrectly</p></div>';
      
      expect(() => StyleConverter.convertToProjectFormat(malformedHtml)).not.toThrow();
    });

    it('should handle very large content', () => {
      const largeContent = '<p>' + 'A'.repeat(10000) + '</p>';
      
      expect(() => StyleConverter.convertToProjectFormat(largeContent)).not.toThrow();
    });

    it('should handle special characters and Unicode', () => {
      const unicodeHtml = '<p>Special chars: áéíóú 中文 🚀 ñ</p>';
      const result = StyleConverter.convertToProjectFormat(unicodeHtml);
      
      expect(result).toContain('áéíóú');
      expect(result).toContain('中文');
      expect(result).toContain('🚀');
    });

    it('should handle empty attributes', () => {
      const html = '<p class="" style="">Content</p>';
      const result = StyleConverter.convertToProjectFormat(html);
      
      expect(result).toContain('Content');
      expect(result).toContain('text-gray-600');
    });
  });
});