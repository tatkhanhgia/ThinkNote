import { describe, it, expect } from 'vitest';
import { ContentSanitizer } from '../ContentSanitizer';
import { MarkdownProcessor } from '../../markdown/MarkdownProcessor';

describe('Security Integration Tests', () => {
  describe('End-to-End Content Security', () => {
    it('should sanitize malicious content through the full pipeline', async () => {
      const maliciousMarkdown = `
# Test Document

This looks innocent but contains:

<script>
  // Malicious script
  fetch('/api/steal-data', {
    method: 'POST',
    body: JSON.stringify({ data: document.cookie })
  });
</script>

[Click me](javascript:alert('XSS'))

<iframe src="javascript:void(0)"></iframe>

<img src="x" onerror="alert('XSS')">

<!-- <script>alert('hidden')</script> -->
      `;

      // Process through the full pipeline
      const processed = await MarkdownProcessor.processMarkdownFile(maliciousMarkdown);

      // Verify all malicious content is removed
      expect(processed.html).not.toContain('<script>');
      expect(processed.html).not.toContain('javascript:');
      expect(processed.html).not.toContain('<iframe>');
      expect(processed.html).not.toContain('onerror');
      expect(processed.html).not.toContain('fetch(');
      expect(processed.html).not.toContain('document.cookie');

      // Verify safe content is preserved
      expect(processed.html).toContain('Test Document');
      expect(processed.html).toContain('This looks innocent');

      // Verify warnings are generated
      expect(processed.sanitizationWarnings).toBeDefined();
      expect(processed.sanitizationWarnings!.length).toBeGreaterThan(0);
    });

    it('should preserve safe markdown content', async () => {
      const safeMarkdown = `
# Safe Document

This is a **safe** markdown document with:

- Normal lists
- [Safe links](https://example.com)
- \`code blocks\`
- Images: ![Alt text](https://example.com/image.jpg)

## Code Example

\`\`\`javascript
function safeFunction() {
  console.log('This is safe');
  return 'Hello World';
}
\`\`\`

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
      `;

      const processed = await MarkdownProcessor.processMarkdownFile(safeMarkdown);

      // Verify content is preserved
      expect(processed.html).toContain('Safe Document');
      expect(processed.html).toContain('<strong>safe</strong>');
      expect(processed.html).toContain('<a href="https://example.com"');
      expect(processed.html).toContain('<code>code blocks</code>');
      expect(processed.html).toContain('<img');
      expect(processed.html).toContain('<blockquote');
      expect(processed.html).toContain('<table');

      // Verify no warnings for safe content
      expect(processed.sanitizationWarnings).toEqual([]);
    });

    it('should handle mixed safe and unsafe content', async () => {
      const mixedMarkdown = `
# Mixed Content Document

This is safe content.

<script>alert('unsafe')</script>

This is also safe.

[Safe link](https://example.com)
[Unsafe link](javascript:alert('xss'))

More safe content here.
      `;

      const processed = await MarkdownProcessor.processMarkdownFile(mixedMarkdown);

      // Verify unsafe content is removed
      expect(processed.html).not.toContain('<script>');
      expect(processed.html).not.toContain('javascript:');

      // Verify safe content is preserved
      expect(processed.html).toContain('Mixed Content Document');
      expect(processed.html).toContain('This is safe content');
      expect(processed.html).toContain('This is also safe');
      expect(processed.html).toContain('More safe content');
      expect(processed.html).toContain('href="https://example.com"');

      // Verify warnings are generated
      expect(processed.sanitizationWarnings).toBeDefined();
      expect(processed.sanitizationWarnings!.length).toBeGreaterThan(0);
    });
  });

  describe('Path Security', () => {
    it('should prevent path traversal attacks', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        'folder/../../../secret.txt',
        'normal/path/../../../../../../etc/passwd'
      ];

      maliciousPaths.forEach(path => {
        const sanitized = ContentSanitizer.sanitizeFilePath(path);
        
        // Should not contain path traversal sequences
        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toContain('\\');
        expect(sanitized.startsWith('/')).toBe(false);
        expect(sanitized).not.toMatch(/^[A-Z]:\\/);
        
        // Should not be empty (unless the original was malicious enough to be completely removed)
        if (sanitized.length > 0) {
          expect(sanitized).not.toContain('\0');
        }
      });
    });

    it('should preserve safe paths', () => {
      const safePaths = [
        'documents/readme.md',
        'folder/subfolder/file.txt',
        'my-project/docs/api.md',
        'src/components/Button.tsx'
      ];

      safePaths.forEach(path => {
        const sanitized = ContentSanitizer.sanitizeFilePath(path);
        
        // Should preserve the basic structure
        expect(sanitized).toContain(path.split('/').pop()); // filename should be preserved
        expect(sanitized).not.toContain('\\');
        expect(sanitized.startsWith('/')).toBe(false);
      });
    });
  });

  describe('Content Detection', () => {
    it('should detect all types of suspicious content', () => {
      const suspiciousContent = `
        <script>alert('xss')</script>
        <iframe src="evil.com"></iframe>
        <object data="malicious.swf"></object>
        <embed src="evil.swf"></embed>
        javascript:alert('xss')
        vbscript:msgbox('xss')
        data:text/html,<script>alert('xss')</script>
        <div onclick="alert('xss')">Click</div>
        <img onload="alert('xss')" src="x">
      `;

      const threats = ContentSanitizer.detectSuspiciousContent(suspiciousContent);

      expect(threats).toContain('Script tags detected');
      expect(threats).toContain('Iframe tags detected');
      expect(threats).toContain('Object tags detected');
      expect(threats).toContain('Embed tags detected');
      expect(threats).toContain('JavaScript URLs detected');
      expect(threats).toContain('VBScript URLs detected');
      expect(threats).toContain('HTML data URLs detected');
      expect(threats).toContain('Event handlers detected');
    });

    it('should not flag safe content as suspicious', () => {
      const safeContent = `
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> text</p>
        <a href="https://example.com">Safe link</a>
        <img src="https://example.com/image.jpg" alt="Safe image">
        <code>const x = 'safe code';</code>
        <blockquote>Safe quote</blockquote>
      `;

      const threats = ContentSanitizer.detectSuspiciousContent(safeContent);

      expect(threats).toHaveLength(0);
    });
  });

  describe('Performance with Security', () => {
    it('should handle large content with security measures efficiently', async () => {
      // Create large content (100KB)
      const largeContent = `# Large Document\n\n${'This is a paragraph with some content. '.repeat(1000)}\n\n<script>alert('should be removed')</script>\n\n${'More safe content here. '.repeat(1000)}`;

      const startTime = performance.now();
      const processed = await MarkdownProcessor.processMarkdownFile(largeContent);
      const endTime = performance.now();

      // Should complete in reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Should still sanitize properly
      expect(processed.html).not.toContain('<script>');
      expect(processed.html).toContain('Large Document');
      expect(processed.sanitizationWarnings).toBeDefined();
    });
  });
});