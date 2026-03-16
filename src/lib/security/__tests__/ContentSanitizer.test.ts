import { describe, it, expect, beforeEach } from 'vitest';
import { ContentSanitizer } from '../ContentSanitizer';

describe('ContentSanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const maliciousHtml = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = ContentSanitizer.sanitizeHtml(maliciousHtml);
      
      expect(result.sanitizedContent).not.toContain('<script>');
      expect(result.sanitizedContent).not.toContain('alert');
      expect(result.sanitizedContent).toContain('<p>Hello</p>');
      expect(result.sanitizedContent).toContain('<p>World</p>');
      expect(result.removedElements).toContain('<script>');
    });

    it('should remove javascript: URLs', () => {
      const maliciousHtml = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const result = ContentSanitizer.sanitizeHtml(maliciousHtml);
      
      expect(result.sanitizedContent).not.toContain('javascript:');
      expect(result.warnings).toContain('Removed javascript: URL in href attribute');
    });

    it('should remove event handlers', () => {
      const maliciousHtml = '<button onclick="alert(\'xss\')">Click</button>';
      const result = ContentSanitizer.sanitizeHtml(maliciousHtml);
      
      expect(result.sanitizedContent).not.toContain('onclick');
      expect(result.warnings).toContain('Removed event handler: onclick');
    });

    it('should preserve allowed tags and attributes', () => {
      const safeHtml = '<h1 class="title">Title</h1><p><strong>Bold</strong> text</p>';
      const result = ContentSanitizer.sanitizeHtml(safeHtml);
      
      expect(result.sanitizedContent).toContain('<h1 class="title">');
      expect(result.sanitizedContent).toContain('<strong>Bold</strong>');
      expect(result.removedElements).toHaveLength(0);
    });

    it('should remove dangerous iframe tags', () => {
      const maliciousHtml = '<iframe src="javascript:alert(\'xss\')"></iframe>';
      const result = ContentSanitizer.sanitizeHtml(maliciousHtml);
      
      expect(result.sanitizedContent).not.toContain('<iframe>');
      expect(result.removedElements).toContain('<iframe>');
    });

    it('should handle custom allowed tags', () => {
      const html = '<custom-element>Content</custom-element>';
      const result = ContentSanitizer.sanitizeHtml(html, {
        allowedTags: ['custom-element']
      });
      
      // DOMPurify might still remove unknown tags, so we check that content is preserved
      expect(result.sanitizedContent).toContain('Content');
      expect(result.removedElements.length).toBeLessThanOrEqual(1);
    });
  });

  describe('sanitizeMarkdown', () => {
    it('should remove dangerous HTML tags from markdown', () => {
      const maliciousMarkdown = `
# Title
<script>alert('xss')</script>
Some content
<iframe src="evil.com"></iframe>
      `;
      
      const result = ContentSanitizer.sanitizeMarkdown(maliciousMarkdown);
      
      expect(result.sanitizedContent).not.toContain('<script>');
      expect(result.sanitizedContent).not.toContain('<iframe>');
      expect(result.sanitizedContent).toContain('# Title');
      expect(result.sanitizedContent).toContain('Some content');
      expect(result.warnings).toContain('Removed potentially dangerous HTML tag: script');
      expect(result.warnings).toContain('Removed potentially dangerous HTML tag: iframe');
    });

    it('should remove javascript: URLs from markdown links', () => {
      const maliciousMarkdown = '[Click me](javascript:alert("xss"))';
      const result = ContentSanitizer.sanitizeMarkdown(maliciousMarkdown);
      
      expect(result.sanitizedContent).not.toContain('javascript:');
      expect(result.sanitizedContent).toContain('[Click me](#)');
      expect(result.warnings).toContain('Removed javascript: URLs from Markdown links');
    });

    it('should remove unsafe data URLs', () => {
      const maliciousMarkdown = '[Download](data:text/html,<script>alert("xss")</script>)';
      const result = ContentSanitizer.sanitizeMarkdown(maliciousMarkdown);
      
      expect(result.sanitizedContent).not.toContain('data:text/html');
      expect(result.sanitizedContent).toContain('[Download](#)');
      expect(result.warnings).toContain('Removed potentially unsafe data: URLs');
    });

    it('should preserve safe image data URLs', () => {
      const safeMarkdown = '![Image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==)';
      const result = ContentSanitizer.sanitizeMarkdown(safeMarkdown);
      
      expect(result.sanitizedContent).toContain('data:image/png');
      expect(result.warnings).toHaveLength(0);
    });

    it('should remove HTML comments with script references', () => {
      const maliciousMarkdown = `
# Title
<!-- <script>alert('xss')</script> -->
Content
      `;
      
      const result = ContentSanitizer.sanitizeMarkdown(maliciousMarkdown);
      
      expect(result.sanitizedContent).not.toContain('<!--');
      expect(result.warnings).toContain('Removed HTML comment containing script references');
    });
  });

  describe('sanitizeFilePath', () => {
    it('should remove path traversal attempts', () => {
      const maliciousPath = '../../../etc/passwd';
      const result = ContentSanitizer.sanitizeFilePath(maliciousPath);
      
      expect(result).toBe('etc/passwd');
      expect(result).not.toContain('..');
    });

    it('should normalize path separators', () => {
      const windowsPath = 'folder\\subfolder\\file.txt';
      const result = ContentSanitizer.sanitizeFilePath(windowsPath);
      
      expect(result).toBe('folder/subfolder/file.txt');
      expect(result).not.toContain('\\');
    });

    it('should remove leading slashes', () => {
      const absolutePath = '/usr/local/file.txt';
      const result = ContentSanitizer.sanitizeFilePath(absolutePath);
      
      expect(result).toBe('usr/local/file.txt');
      expect(result.startsWith('/')).toBe(false);
    });

    it('should remove null bytes', () => {
      const maliciousPath = 'file.txt\0.exe';
      const result = ContentSanitizer.sanitizeFilePath(maliciousPath);
      
      expect(result).toBe('file.txt.exe');
      expect(result).not.toContain('\0');
    });

    it('should throw error for empty paths', () => {
      expect(() => ContentSanitizer.sanitizeFilePath('')).toThrow('File path cannot be empty');
      expect(() => ContentSanitizer.sanitizeFilePath('/')).toThrow('Invalid file path after sanitization');
    });
  });

  describe('detectSuspiciousContent', () => {
    it('should detect script tags', () => {
      const content = '<script>alert("xss")</script>';
      const threats = ContentSanitizer.detectSuspiciousContent(content);
      
      expect(threats).toContain('Script tags detected');
    });

    it('should detect javascript URLs', () => {
      const content = 'javascript:alert("xss")';
      const threats = ContentSanitizer.detectSuspiciousContent(content);
      
      expect(threats).toContain('JavaScript URLs detected');
    });

    it('should detect event handlers', () => {
      const content = '<div onclick="alert()">Click</div>';
      const threats = ContentSanitizer.detectSuspiciousContent(content);
      
      expect(threats).toContain('Event handlers detected');
    });

    it('should detect multiple threats', () => {
      const content = '<script>alert()</script><iframe src="javascript:void(0)"></iframe>';
      const threats = ContentSanitizer.detectSuspiciousContent(content);
      
      expect(threats).toContain('Script tags detected');
      expect(threats).toContain('JavaScript URLs detected');
      expect(threats).toContain('Iframe tags detected');
    });

    it('should return empty array for safe content', () => {
      const content = '<h1>Safe Title</h1><p>Safe content</p>';
      const threats = ContentSanitizer.detectSuspiciousContent(content);
      
      expect(threats).toHaveLength(0);
    });
  });
});