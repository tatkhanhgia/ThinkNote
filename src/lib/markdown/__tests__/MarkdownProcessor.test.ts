import { describe, it, expect } from 'vitest'
import { MarkdownProcessor } from '../MarkdownProcessor'

describe('MarkdownProcessor', () => {
  describe('parseMarkdown', () => {
    it('should convert basic markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a **bold** text.'
      const result = await MarkdownProcessor.parseMarkdown(markdown)
      
      expect(result).toContain('<h1>Hello World</h1>')
      expect(result).toContain('<strong>bold</strong>')
    })

    it('should handle code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\n```'
      const result = await MarkdownProcessor.parseMarkdown(markdown)
      
      expect(result).toContain('<pre>')
      expect(result).toContain('<code')
      expect(result).toContain('const x = 1;')
    })

    it('should handle GFM features like tables', async () => {
      const markdown = `| Name | Age |
|------|-----|
| John | 25  |`
      const result = await MarkdownProcessor.parseMarkdown(markdown)
      
      expect(result).toContain('<table>')
      expect(result).toContain('<th>Name</th>')
      expect(result).toContain('<td>John</td>')
    })

    it('should throw error for invalid processing', async () => {
      // Mock the processor to throw an error
      const originalProcessor = (MarkdownProcessor as any).processor
      ;(MarkdownProcessor as any).processor = {
        process: () => Promise.reject(new Error('Test error'))
      }

      await expect(MarkdownProcessor.parseMarkdown('# Test')).rejects.toThrow('Failed to parse Markdown: Test error')
      
      // Restore original processor
      ;(MarkdownProcessor as any).processor = originalProcessor
    })
  })

  describe('processMarkdownFile', () => {
    it('should process markdown with frontmatter', async () => {
      const content = `---
title: Test Article
author: John Doe
tags: [test, markdown]
---

# Content

This is the content.`

      const result = await MarkdownProcessor.processMarkdownFile(content)
      
      expect(result.metadata.title).toBe('Test Article')
      expect(result.metadata.author).toBe('John Doe')
      expect(result.metadata.tags).toEqual(['test', 'markdown'])
      expect(result.html).toContain('<h1>Content</h1>')
      expect(result.originalContent).toBe(content)
    })

    it('should handle markdown without frontmatter', async () => {
      const content = '# Simple Content\n\nJust markdown.'
      const result = await MarkdownProcessor.processMarkdownFile(content)
      
      expect(result.metadata).toEqual({})
      expect(result.html).toContain('<h1>Simple Content</h1>')
      expect(result.originalContent).toBe(content)
    })
  })

  describe('validateMarkdownContent', () => {
    it('should validate correct markdown', () => {
      const content = '# Title\n\nSome content with **bold** text.'
      const result = MarkdownProcessor.validateMarkdownContent(content)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect empty content', () => {
      const result = MarkdownProcessor.validateMarkdownContent('')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Content cannot be empty')
    })

    it('should detect unbalanced code blocks', () => {
      const content = '# Title\n\n```javascript\nconst x = 1;\n\nSome text after unclosed code block'
      const result = MarkdownProcessor.validateMarkdownContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unbalanced code blocks detected')
    })

    it('should warn about very long lines', () => {
      const longLine = 'a'.repeat(1001)
      const content = `# Title\n\n${longLine}`
      const result = MarkdownProcessor.validateMarkdownContent(content)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Line 3 is very long (1001 characters)')
    })

    it('should warn about malformed links', () => {
      const content = '# Title\n\n[Malformed link](incomplete'
      const result = MarkdownProcessor.validateMarkdownContent(content)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Potentially malformed links detected')
    })

    it('should handle invalid frontmatter', () => {
      const content = '---\ninvalid: yaml: content:\n---\n\n# Content'
      const result = MarkdownProcessor.validateMarkdownContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Invalid frontmatter or Markdown syntax')
    })
  })

  describe('extractMetadata', () => {
    it('should extract frontmatter metadata', () => {
      const content = `---
title: Test
description: A test article
tags: [test, demo]
---

# Content`

      const metadata = MarkdownProcessor.extractMetadata(content)
      
      expect(metadata.title).toBe('Test')
      expect(metadata.description).toBe('A test article')
      expect(metadata.tags).toEqual(['test', 'demo'])
    })

    it('should return empty object for no frontmatter', () => {
      const content = '# Just content'
      const metadata = MarkdownProcessor.extractMetadata(content)
      
      expect(metadata).toEqual({})
    })

    it('should handle invalid frontmatter gracefully', () => {
      const content = '---\ninvalid: yaml: content:\n---\n# Content'
      const metadata = MarkdownProcessor.extractMetadata(content)
      
      // gray-matter might parse some invalid YAML, so we just check it doesn't throw
      expect(typeof metadata).toBe('object')
    })
  })

  describe('convertToProjectFormat', () => {
    it('should add prose classes to HTML', async () => {
      const html = '<h1>Title</h1><p>Content</p>'
      const result = await MarkdownProcessor.convertToProjectFormat(html)
      
      expect(result).toContain('class="prose prose-lg max-w-none"')
    })

    it('should add heading classes', async () => {
      const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3>'
      const result = await MarkdownProcessor.convertToProjectFormat(html)
      
      expect(result).toContain('class="heading-1"')
      expect(result).toContain('class="heading-2"')
      expect(result).toContain('class="heading-3"')
    })

    it('should style code blocks', async () => {
      const html = '<pre><code>const x = 1;</code></pre>'
      const result = await MarkdownProcessor.convertToProjectFormat(html)
      
      expect(result).toContain('class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto"')
      expect(result).toContain('class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"')
    })

    it('should style tables', async () => {
      const html = '<table><th>Header</th><td>Cell</td></table>'
      const result = await MarkdownProcessor.convertToProjectFormat(html)
      
      expect(result).toContain('class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"')
      expect(result).toContain('class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"')
      expect(result).toContain('class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"')
    })

    it('should style blockquotes', async () => {
      const html = '<blockquote>Quote text</blockquote>'
      const result = await MarkdownProcessor.convertToProjectFormat(html)
      
      expect(result).toContain('class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400"')
    })
  })
})