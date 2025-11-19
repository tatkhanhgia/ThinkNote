/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { StyleConverter } from '../StyleConverter';
import MarkdownPreview from '../../ui/MarkdownPreview';

// Mock remark and related packages
vi.mock('remark', () => ({
  remark: () => ({
    use: vi.fn().mockReturnThis(),
    processSync: vi.fn((content) => ({
      toString: () => `<p>${content}</p>`
    }))
  })
}));

vi.mock('remark-gfm', () => ({}));
vi.mock('remark-html', () => ({}));

describe('StyleConverter Integration Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('Integration with MarkdownPreview', () => {
    it('should work with MarkdownPreview component output', () => {
      const markdownContent = `
# Main Title
This is a paragraph with **bold** and *italic* text.

## Subsection
- List item 1
- List item 2

\`\`\`javascript
const code = "example";
\`\`\`

> This is a blockquote

[Link text](https://example.com)
      `;

      // Simulate the HTML output that would come from remark processing
      const simulatedHtml = `
        <h1>Main Title</h1>
        <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <h2>Subsection</h2>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <pre><code class="language-javascript">const code = "example";</code></pre>
        <blockquote>
          <p>This is a blockquote</p>
        </blockquote>
        <p><a href="https://example.com">Link text</a></p>
      `;

      const convertedHtml = StyleConverter.convertToProjectFormat(simulatedHtml);

      // Verify that project-specific classes are applied
      expect(convertedHtml).toContain('heading-xl'); // h1 styling
      expect(convertedHtml).toContain('heading-lg'); // h2 styling
      expect(convertedHtml).toContain('text-gray-600'); // paragraph styling
      expect(convertedHtml).toContain('font-semibold'); // strong styling
      expect(convertedHtml).toContain('italic'); // em styling
      expect(convertedHtml).toContain('list-disc'); // ul styling
      expect(convertedHtml).toContain('bg-gray-900'); // pre styling
      expect(convertedHtml).toContain('border-l-4'); // blockquote styling
      expect(convertedHtml).toContain('text-primary-600'); // link styling
      expect(convertedHtml).toContain('prose prose-lg max-w-none'); // prose wrapper
    });

    it('should maintain content integrity during conversion', () => {
      const originalHtml = `
        <h1>Title</h1>
        <p>Paragraph with <a href="https://example.com">link</a></p>
        <ul><li>Item 1</li><li>Item 2</li></ul>
      `;

      const converted = StyleConverter.convertToProjectFormat(originalHtml);
      const validation = StyleConverter.validateConversion(originalHtml, converted);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should handle code blocks with syntax highlighting classes', () => {
      const htmlWithSyntaxHighlighting = `
        <pre><code class="language-typescript">
interface User {
  name: string;
  age: number;
}
        </code></pre>
      `;

      const converted = StyleConverter.convertToProjectFormat(htmlWithSyntaxHighlighting);

      // Should preserve language class while adding project styling
      expect(converted).toContain('language-typescript');
      expect(converted).toContain('bg-gray-900');
      expect(converted).toContain('text-gray-100');
    });

    it('should handle tables from markdown', () => {
      const tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      `;

      const converted = StyleConverter.convertToProjectFormat(tableHtml);

      expect(converted).toContain('w-full border-collapse');
      expect(converted).toContain('bg-gray-50'); // thead styling
      expect(converted).toContain('font-semibold'); // th styling
      expect(converted).toContain('overflow-x-auto'); // responsive wrapper
    });

    it('should handle images with proper responsive classes', () => {
      const imageHtml = '<p><img src="test.jpg" alt="Test image" title="Test"></p>';
      const converted = StyleConverter.convertToProjectFormat(imageHtml);

      expect(converted).toContain('rounded-xl');
      expect(converted).toContain('shadow-lg');
      expect(converted).toContain('w-full md:w-auto max-w-full');
    });

    it('should preserve markdown metadata and attributes', () => {
      const htmlWithAttributes = `
        <h1 id="main-title">Title</h1>
        <p class="lead">Introduction paragraph</p>
        <a href="https://example.com" target="_blank" rel="noopener">External link</a>
      `;

      const converted = StyleConverter.convertToProjectFormat(htmlWithAttributes, {
        preserveOriginalClasses: true
      });

      expect(converted).toContain('id="main-title"');
      expect(converted).toContain('class="lead');
      expect(converted).toContain('target="_blank"');
      expect(converted).toContain('rel="noopener"');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large markdown documents efficiently', () => {
      const largeContent = Array(100).fill(0).map((_, i) => `
        <h2>Section ${i}</h2>
        <p>This is paragraph ${i} with some content.</p>
        <ul>
          <li>Item 1 for section ${i}</li>
          <li>Item 2 for section ${i}</li>
        </ul>
      `).join('');

      const startTime = performance.now();
      const converted = StyleConverter.convertToProjectFormat(largeContent);
      const endTime = performance.now();

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(converted).toContain('heading-lg');
      expect(converted).toContain('prose');
    });

    it('should handle nested blockquotes and lists', () => {
      const nestedHtml = `
        <blockquote>
          <p>Outer quote</p>
          <blockquote>
            <p>Nested quote</p>
          </blockquote>
          <ul>
            <li>List in quote
              <ul>
                <li>Nested list item</li>
              </ul>
            </li>
          </ul>
        </blockquote>
      `;

      const converted = StyleConverter.convertToProjectFormat(nestedHtml);

      expect(converted).toContain('border-l-4');
      expect(converted).toContain('list-disc');
      // Should handle nesting without breaking
      expect(converted.split('<blockquote').length - 1).toBe(2); // Two blockquotes
    });

    it('should handle mixed content with inline styles and classes', () => {
      const mixedHtml = `
        <div class="custom-wrapper">
          <h1 style="color: blue;">Styled Title</h1>
          <p class="existing-class" style="text-align: center; font-weight: bold;">
            Mixed content with <span style="color: red;">colored text</span>
          </p>
        </div>
      `;

      const converted = StyleConverter.convertToProjectFormat(mixedHtml, {
        preserveOriginalClasses: true
      });

      expect(converted).toContain('custom-wrapper');
      expect(converted).toContain('existing-class');
      expect(converted).toContain('text-center');
      expect(converted).toContain('font-bold');
      expect(converted).not.toContain('style=');
    });

    it('should maintain accessibility attributes', () => {
      const accessibleHtml = `
        <img src="test.jpg" alt="Descriptive alt text" aria-describedby="caption">
        <p id="caption">Image caption</p>
        <a href="#section" aria-label="Go to section">Link</a>
        <h2 tabindex="0">Focusable heading</h2>
      `;

      const converted = StyleConverter.convertToProjectFormat(accessibleHtml);

      expect(converted).toContain('alt="Descriptive alt text"');
      expect(converted).toContain('aria-describedby="caption"');
      expect(converted).toContain('aria-label="Go to section"');
      expect(converted).toContain('tabindex="0"');
    });
  });

  describe('Custom Styling Options', () => {
    it('should apply custom mappings for specific use cases', () => {
      const html = '<p class="highlight">Special paragraph</p>';
      const customMappings = {
        'p': (element: Element) => {
          return element.classList.contains('highlight') 
            ? 'bg-yellow-100 border-l-4 border-yellow-500 p-4 text-yellow-800'
            : 'text-gray-600 mb-4';
        }
      };

      const converted = StyleConverter.convertToProjectFormat(html, {
        customMappings,
        preserveOriginalClasses: true
      });

      expect(converted).toContain('bg-yellow-100');
      expect(converted).toContain('border-yellow-500');
      expect(converted).toContain('highlight');
    });

    it('should handle conversion without prose wrapper', () => {
      const html = '<h1>Title</h1><p>Content</p>';
      const converted = StyleConverter.convertToProjectFormat(html, {
        applyProseClasses: false
      });

      expect(converted).not.toContain('prose');
      expect(converted).toContain('heading-xl');
      expect(converted).toContain('text-gray-600');
    });
  });

  describe('Security and Sanitization', () => {
    it('should remove XSS attempts while preserving content', () => {
      const maliciousHtml = `
        <h1>Safe Title</h1>
        <p onclick="alert('xss')">Paragraph with handler</p>
        <script>alert('xss')</script>
        <a href="javascript:alert('xss')">Malicious link</a>
        <a href="https://safe-site.com">Safe link</a>
      `;

      const converted = StyleConverter.convertToProjectFormat(maliciousHtml);

      expect(converted).toContain('Safe Title');
      expect(converted).toContain('Safe link');
      expect(converted).toContain('https://safe-site.com');
      expect(converted).not.toContain('onclick');
      expect(converted).not.toContain('script');
      expect(converted).not.toContain('javascript:');
    });

    it('should preserve safe HTML5 semantic elements', () => {
      const semanticHtml = `
        <article>
          <header>
            <h1>Article Title</h1>
          </header>
          <section>
            <h2>Section Title</h2>
            <p>Content</p>
          </section>
          <aside>
            <p>Sidebar content</p>
          </aside>
          <footer>
            <p>Footer content</p>
          </footer>
        </article>
      `;

      const converted = StyleConverter.convertToProjectFormat(semanticHtml);

      expect(converted).toContain('<article>');
      expect(converted).toContain('<header>');
      expect(converted).toContain('<section>');
      expect(converted).toContain('<aside>');
      expect(converted).toContain('<footer>');
    });
  });
});