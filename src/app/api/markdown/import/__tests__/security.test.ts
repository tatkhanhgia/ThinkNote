import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the file system operations
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined)
  };
});

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false)
  };
});

// Mock the path module
vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
    dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/')),
    basename: vi.fn((path, ext) => {
      const name = path.split('/').pop() || '';
      return ext ? name.replace(ext, '') : name;
    }),
    extname: vi.fn((path) => {
      const parts = path.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    })
  };
});

// Mock process.cwd()
vi.mock('process', () => ({
  cwd: vi.fn().mockReturnValue('/mock/project')
}));

describe('API Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Path Traversal Protection', () => {
    it('should reject path traversal attempts in targetPath', async () => {
      const maliciousRequest = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: '# Test',
          targetPath: '../../../etc'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(maliciousRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('path traversal detected');
    });

    it('should reject path traversal attempts in fileName', async () => {
      const maliciousRequest = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: '../../../passwd.md',
          content: '# Test'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(maliciousRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid file name');
    });

    it('should sanitize relative paths correctly', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: '# Test',
          targetPath: 'folder/../subfolder'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      // Should succeed after sanitization
      expect(data.success).toBe(true);
    });
  });

  describe('Content Security', () => {
    it('should detect and warn about malicious script content', async () => {
      const maliciousContent = `
# Test Document
<script>alert('xss')</script>
Some content here
      `;

      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: maliciousContent
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.securityWarnings).toBeDefined();
      expect(data.securityWarnings).toContain('Script tags detected');
    });

    it('should detect javascript: URLs', async () => {
      const maliciousContent = `
# Test Document
[Click me](javascript:alert('xss'))
      `;

      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: maliciousContent
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.securityWarnings).toBeDefined();
      expect(data.securityWarnings).toContain('JavaScript URLs detected');
    });

    it('should detect iframe tags', async () => {
      const maliciousContent = `
# Test Document
<iframe src="http://evil.com"></iframe>
      `;

      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: maliciousContent
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.securityWarnings).toBeDefined();
      expect(data.securityWarnings).toContain('Iframe tags detected');
    });

    it('should allow safe content without warnings', async () => {
      const safeContent = `
# Test Document

This is a **safe** markdown document with:

- Lists
- [Safe links](https://example.com)
- \`code blocks\`

## Subheading

Normal paragraph content.
      `;

      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: safeContent
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.securityWarnings).toBeUndefined();
    });
  });

  describe('File Size Limits', () => {
    it('should reject requests with large content-length header', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: 'small content'
        }),
        headers: {
          'content-type': 'application/json',
          'content-length': '11000000' // 11MB
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Request body too large');
    });

    it('should process normal sized content', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: '# Normal content'
        }),
        headers: {
          'content-type': 'application/json',
          'content-length': '100'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('File Name Validation', () => {
    it('should reject dangerous file names', async () => {
      const dangerousNames = [
        'test<script>.md',
        'test|pipe.md',
        'test?.md',
        'test*.md',
        'CON.md',
        'PRN.md',
        'test\x00.md'
      ];

      for (const fileName of dangerousNames) {
        const request = new NextRequest('http://localhost/api/markdown/import', {
          method: 'POST',
          body: JSON.stringify({
            fileName,
            content: '# Test'
          }),
          headers: {
            'content-type': 'application/json'
          }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid file name');
      }
    });

    it('should accept safe file names', async () => {
      const safeNames = [
        'test.md',
        'my-document.md',
        'document_v2.md',
        'test123.markdown'
      ];

      for (const fileName of safeNames) {
        const request = new NextRequest('http://localhost/api/markdown/import', {
          method: 'POST',
          body: JSON.stringify({
            fileName,
            content: '# Test'
          }),
          headers: {
            'content-type': 'application/json'
          }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject empty file name', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: '',
          content: '# Test'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('File name and content are required');
    });

    it('should reject empty content', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: ''
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('File name and content are required');
    });

    it('should reject non-markdown file extensions', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.txt',
          content: '# Test'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid file type');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Server error');
    });

    it('should include processing time in response', async () => {
      const request = new NextRequest('http://localhost/api/markdown/import', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.md',
          content: '# Test document'
        }),
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.processingTime).toBeDefined();
      expect(typeof data.processingTime).toBe('number');
      expect(data.processingTime).toBeGreaterThan(0);
    });
  });
});