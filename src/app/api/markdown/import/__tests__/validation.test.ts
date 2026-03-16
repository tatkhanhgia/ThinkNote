import { describe, it, expect } from 'vitest'
import { FileValidator } from '@/lib/validation'
import { MarkdownProcessor } from '@/lib/markdown/MarkdownProcessor'

describe('API Validation Logic', () => {
  describe('File Name Validation', () => {
    it('should accept valid Markdown file names', () => {
      const validNames = [
        'document.md',
        'my-article.markdown',
        'test_file.md',
        'article-with-numbers-123.md'
      ]

      validNames.forEach(name => {
        const result = FileValidator.validateFileName(name)
        expect(result.isValid).toBe(true)
      })
    })

    it('should reject invalid file names', () => {
      const invalidNames = [
        'file<invalid>.md',
        'file|pipe.md',
        'file:colon.md',
        'file"quote.md',
        'file?question.md',
        'file*asterisk.md',
        '../traversal.md',
        'file\\backslash.md'
      ]

      invalidNames.forEach(name => {
        const result = FileValidator.validateFileName(name)
        expect(result.isValid).toBe(false)
      })
    })

    it('should reject reserved system names', () => {
      const reservedNames = [
        'CON.md',
        'PRN.md',
        'AUX.md',
        'NUL.md',
        'COM1.md',
        'LPT1.md'
      ]

      reservedNames.forEach(name => {
        const result = FileValidator.validateFileName(name)
        expect(result.isValid).toBe(false)
      })
    })
  })

  describe('File Type Validation', () => {
    it('should accept valid Markdown extensions', () => {
      const validFiles = [
        'document.md',
        'article.markdown'
      ]

      validFiles.forEach(fileName => {
        const result = FileValidator.validateFileType(fileName)
        expect(result.isValid).toBe(true)
      })
    })

    it('should reject invalid file extensions', () => {
      const invalidFiles = [
        'document.txt',
        'article.doc',
        'file.pdf',
        'image.jpg',
        'script.js'
      ]

      invalidFiles.forEach(fileName => {
        const result = FileValidator.validateFileType(fileName)
        expect(result.isValid).toBe(false)
      })
    })
  })

  describe('File Size Validation', () => {
    it('should accept files within size limit', () => {
      const validSizes = [
        1024,           // 1KB
        1024 * 1024,    // 1MB
        3 * 1024 * 1024 // 3MB
      ]

      validSizes.forEach(size => {
        const result = FileValidator.validateFileSize(size)
        expect(result.isValid).toBe(true)
      })
    })

    it('should reject files that are too large', () => {
      const invalidSizes = [
        6 * 1024 * 1024,  // 6MB
        10 * 1024 * 1024, // 10MB
        100 * 1024 * 1024 // 100MB
      ]

      invalidSizes.forEach(size => {
        const result = FileValidator.validateFileSize(size)
        expect(result.isValid).toBe(false)
      })
    })

    it('should warn for files close to size limit', () => {
      const warningSize = 4.5 * 1024 * 1024 // 4.5MB (close to 5MB limit)
      const result = FileValidator.validateFileSize(warningSize)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should reject empty files', () => {
      const result = FileValidator.validateFileSize(0)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File appears to be empty')
    })
  })

  describe('Markdown Content Validation', () => {
    it('should accept valid Markdown content', () => {
      const validContent = `# Test Document

This is a test document with:

- Lists
- **Bold text**
- *Italic text*
- [Links](https://example.com)

\`\`\`javascript
console.log('Code blocks');
\`\`\`

## Section 2

More content here.`

      const result = MarkdownProcessor.validateMarkdownContent(validContent)
      expect(result.isValid).toBe(true)
    })

    it('should accept Markdown with frontmatter', () => {
      const contentWithFrontmatter = `---
title: Test Document
author: John Doe
date: 2023-01-01
---

# Test Document

Content here.`

      const result = MarkdownProcessor.validateMarkdownContent(contentWithFrontmatter)
      expect(result.isValid).toBe(true)
    })

    it('should reject empty content', () => {
      const emptyContent = ''
      const result = MarkdownProcessor.validateMarkdownContent(emptyContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Content cannot be empty')
    })

    it('should reject content with only whitespace', () => {
      const whitespaceContent = '   \n\n   \t   \n'
      const result = MarkdownProcessor.validateMarkdownContent(whitespaceContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Content cannot be empty')
    })

    it('should detect unbalanced code blocks', () => {
      const unbalancedContent = `# Test

\`\`\`javascript
console.log('Missing closing block');

More content here.`

      const result = MarkdownProcessor.validateMarkdownContent(unbalancedContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unbalanced code blocks detected')
    })

    it('should warn about very long lines', () => {
      const longLineContent = `# Test

${'a'.repeat(1500)}

Normal content.`

      const result = MarkdownProcessor.validateMarkdownContent(longLineContent)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('very long')
    })

    it('should warn about potentially malformed links', () => {
      const malformedLinkContent = `# Test

This has a [malformed link](incomplete

More content.`

      const result = MarkdownProcessor.validateMarkdownContent(malformedLinkContent)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('malformed links')
    })
  })

  describe('Metadata Extraction', () => {
    it('should extract metadata from frontmatter', () => {
      const contentWithMetadata = `---
title: Test Article
author: John Doe
date: 2023-01-01
tags: [test, markdown]
category: documentation
---

# Test Article

Content here.`

      const metadata = MarkdownProcessor.extractMetadata(contentWithMetadata)
      
      expect(metadata).toMatchObject({
        title: 'Test Article',
        author: 'John Doe',
        tags: ['test', 'markdown'],
        category: 'documentation'
      })
      expect(metadata.date).toBeDefined()
    })

    it('should return empty metadata for content without frontmatter', () => {
      const contentWithoutMetadata = `# Test Article

Just content, no frontmatter.`

      const metadata = MarkdownProcessor.extractMetadata(contentWithoutMetadata)
      expect(metadata).toEqual({})
    })

    it('should handle invalid frontmatter gracefully', () => {
      const invalidFrontmatter = `---
invalid: yaml: content: here
---

# Test Article

Content here.`

      const metadata = MarkdownProcessor.extractMetadata(invalidFrontmatter)
      expect(metadata).toEqual({})
    })
  })
})