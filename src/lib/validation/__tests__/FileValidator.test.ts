import { describe, it, expect } from 'vitest'
import { FileValidator } from '../FileValidator'

// Mock File class for testing
class MockFile implements File {
  name: string
  size: number
  type: string
  lastModified: number
  webkitRelativePath: string = ''

  constructor(name: string, size: number, type: string = 'text/markdown') {
    this.name = name
    this.size = size
    this.type = type
    this.lastModified = Date.now()
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new Error('Not implemented')
  }

  slice(): Blob {
    throw new Error('Not implemented')
  }

  stream(): ReadableStream<Uint8Array> {
    throw new Error('Not implemented')
  }

  text(): Promise<string> {
    throw new Error('Not implemented')
  }
}

describe('FileValidator', () => {
  describe('validateFileType', () => {
    it('should accept valid markdown extensions', () => {
      const result1 = FileValidator.validateFileType('test.md')
      const result2 = FileValidator.validateFileType('test.markdown')
      
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
      expect(result1.errors).toHaveLength(0)
      expect(result2.errors).toHaveLength(0)
    })

    it('should reject invalid file extensions', () => {
      const result = FileValidator.validateFileType('test.txt')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("File type '.txt' is not allowed. Allowed types: .md, .markdown")
    })

    it('should handle case insensitive extensions', () => {
      const result1 = FileValidator.validateFileType('test.MD')
      const result2 = FileValidator.validateFileType('test.MARKDOWN')
      
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
    })

    it('should reject empty filename', () => {
      const result = FileValidator.validateFileType('')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File name is required')
    })

    it('should accept custom allowed extensions', () => {
      const result = FileValidator.validateFileType('test.txt', ['.txt', '.md'])
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const result = FileValidator.validateFileSize(1024 * 1024) // 1MB
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject files exceeding size limit', () => {
      const result = FileValidator.validateFileSize(6 * 1024 * 1024) // 6MB (default limit is 5MB)
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('File size (6 MB) exceeds maximum allowed size (5 MB)')
    })

    it('should warn about files close to size limit', () => {
      const result = FileValidator.validateFileSize(4.5 * 1024 * 1024) // 4.5MB (close to 5MB limit)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings[0]).toContain('File size (4.5 MB) is close to the maximum limit')
    })

    it('should reject empty files', () => {
      const result = FileValidator.validateFileSize(0)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File appears to be empty')
    })

    it('should accept custom size limits', () => {
      const result = FileValidator.validateFileSize(2 * 1024 * 1024, 1024 * 1024) // 2MB file, 1MB limit
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('exceeds maximum allowed size')
    })
  })

  describe('validateMimeType', () => {
    it('should accept valid MIME types', () => {
      const result1 = FileValidator.validateMimeType('text/markdown')
      const result2 = FileValidator.validateMimeType('text/plain')
      
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
    })

    it('should warn about unexpected MIME types but not fail', () => {
      const result = FileValidator.validateMimeType('application/pdf')
      
      expect(result.isValid).toBe(true) // Should still pass
      expect(result.warnings[0]).toContain("Unexpected MIME type 'application/pdf'")
    })

    it('should handle empty MIME type', () => {
      const result = FileValidator.validateMimeType('')
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('MIME type could not be determined')
    })
  })

  describe('validateFile', () => {
    it('should validate a valid markdown file', () => {
      const file = new MockFile('test.md', 1024, 'text/markdown')
      const result = FileValidator.validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject file with invalid extension', () => {
      const file = new MockFile('test.txt', 1024, 'text/plain')
      const result = FileValidator.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain("File type '.txt' is not allowed")
    })

    it('should reject oversized file', () => {
      const file = new MockFile('test.md', 6 * 1024 * 1024, 'text/markdown')
      const result = FileValidator.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('exceeds maximum allowed size')
    })

    it('should accumulate multiple validation issues', () => {
      const file = new MockFile('test.txt', 6 * 1024 * 1024, 'application/pdf')
      const result = FileValidator.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1) // Should have both type and size errors
    })

    it('should respect custom validation options', () => {
      const file = new MockFile('test.txt', 2 * 1024 * 1024, 'text/plain')
      const result = FileValidator.validateFile(file, {
        allowedExtensions: ['.txt'],
        maxSizeBytes: 1024 * 1024 // 1MB
      })
      
      expect(result.isValid).toBe(false) // Should fail on size
      expect(result.errors[0]).toContain('exceeds maximum allowed size')
    })
  })

  describe('validateFileName', () => {
    it('should accept valid filenames', () => {
      const result = FileValidator.validateFileName('my-document.md')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject dangerous characters', () => {
      const result = FileValidator.validateFileName('file<name>.md')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File name contains invalid characters')
    })

    it('should reject reserved names', () => {
      const result = FileValidator.validateFileName('CON.md')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File name uses a reserved system name')
    })

    it('should reject path traversal attempts', () => {
      const result1 = FileValidator.validateFileName('../test.md')
      const result2 = FileValidator.validateFileName('folder/test.md')
      
      expect(result1.isValid).toBe(false)
      expect(result2.isValid).toBe(false)
      expect(result1.errors).toContain('File name cannot contain path separators or traversal sequences')
    })

    it('should reject overly long filenames', () => {
      const longName = 'a'.repeat(256) + '.md'
      const result = FileValidator.validateFileName(longName)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File name is too long (maximum 255 characters)')
    })

    it('should warn about leading/trailing whitespace', () => {
      const result = FileValidator.validateFileName(' test.md ')
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('File name has leading or trailing whitespace')
    })

    it('should warn about hidden files', () => {
      const result = FileValidator.validateFileName('.hidden-file.md')
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('File name starts with a dot (hidden file)')
    })

    it('should accept .md and .markdown extensions starting with dot', () => {
      const result1 = FileValidator.validateFileName('.md')
      const result2 = FileValidator.validateFileName('.markdown')
      
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
      expect(result1.warnings).toHaveLength(0)
      expect(result2.warnings).toHaveLength(0)
    })
  })

  describe('isMarkdownFile', () => {
    it('should identify markdown files correctly', () => {
      expect(FileValidator.isMarkdownFile('test.md')).toBe(true)
      expect(FileValidator.isMarkdownFile('test.markdown')).toBe(true)
      expect(FileValidator.isMarkdownFile('test.MD')).toBe(true)
      expect(FileValidator.isMarkdownFile('test.txt')).toBe(false)
      expect(FileValidator.isMarkdownFile('test')).toBe(false)
    })
  })
})