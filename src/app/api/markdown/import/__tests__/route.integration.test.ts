import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { rm, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

describe('/api/markdown/import - Integration Tests', () => {
  const testDir = join(process.cwd(), 'src', 'data', 'test-imports')

  beforeEach(async () => {
    // Clean up test directory before each test
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  afterEach(async () => {
    // Clean up test directory after each test
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/markdown/import', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  describe('POST /api/markdown/import', () => {
    it('should successfully import a valid Markdown file', async () => {
      const request = createRequest({
        fileName: 'test-document.md',
        content: '# Test Document\n\nThis is a test document with some content.',
        targetPath: 'test-imports'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.fileName).toBe('test-document.md')
      expect(data.filePath).toBe('test-imports/test-document.md')
      expect(data.metadata).toBeDefined()

      // Verify file was actually created
      const filePath = join(testDir, 'test-document.md')
      expect(existsSync(filePath)).toBe(true)
    })

    it('should return 400 for missing fileName', async () => {
      const request = createRequest({
        content: '# Test'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File name and content are required')
    })

    it('should return 400 for missing content', async () => {
      const request = createRequest({
        fileName: 'test.md'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File name and content are required')
    })

    it('should return 400 for invalid file extension', async () => {
      const request = createRequest({
        fileName: 'test.txt',
        content: '# Test'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file type')
    })

    it('should return 400 for invalid file name characters', async () => {
      const request = createRequest({
        fileName: 'test<invalid>.md',
        content: '# Test'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file name')
    })

    it('should return 400 for content that is too large', async () => {
      const largeContent = 'a'.repeat(6 * 1024 * 1024) // 6MB
      const request = createRequest({
        fileName: 'test.md',
        content: largeContent
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File too large')
    })

    it('should handle duplicate file names by creating unique names', async () => {
      // First import
      const request1 = createRequest({
        fileName: 'duplicate.md',
        content: '# First Document',
        targetPath: 'test-imports'
      })

      const response1 = await POST(request1)
      const data1 = await response1.json()

      expect(response1.status).toBe(200)
      expect(data1.success).toBe(true)
      expect(data1.fileName).toBe('duplicate.md')

      // Second import with same name
      const request2 = createRequest({
        fileName: 'duplicate.md',
        content: '# Second Document',
        targetPath: 'test-imports',
        overwrite: false
      })

      const response2 = await POST(request2)
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.success).toBe(true)
      expect(data2.fileName).toBe('duplicate_1.md')

      // Verify both files exist
      expect(existsSync(join(testDir, 'duplicate.md'))).toBe(true)
      expect(existsSync(join(testDir, 'duplicate_1.md'))).toBe(true)
    })

    it('should overwrite existing file when overwrite is true', async () => {
      // First import
      const request1 = createRequest({
        fileName: 'overwrite-test.md',
        content: '# Original Content',
        targetPath: 'test-imports'
      })

      await POST(request1)

      // Second import with overwrite
      const request2 = createRequest({
        fileName: 'overwrite-test.md',
        content: '# Updated Content',
        targetPath: 'test-imports',
        overwrite: true
      })

      const response2 = await POST(request2)
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.success).toBe(true)
      expect(data2.fileName).toBe('overwrite-test.md')

      // Verify only one file exists
      expect(existsSync(join(testDir, 'overwrite-test.md'))).toBe(true)
      expect(existsSync(join(testDir, 'overwrite-test_1.md'))).toBe(false)
    })

    it('should process Markdown with frontmatter correctly', async () => {
      const contentWithFrontmatter = `---
title: Test Article
author: John Doe
date: 2023-01-01
tags: [test, markdown]
---

# Test Article

This is the content of the test article.

## Section 1

Some content here.

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

## Section 2

More content with a [link](https://example.com).`

      const request = createRequest({
        fileName: 'frontmatter-test.md',
        content: contentWithFrontmatter,
        targetPath: 'test-imports'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.metadata).toMatchObject({
        title: 'Test Article',
        author: 'John Doe',
        tags: ['test', 'markdown']
      })
      expect(data.metadata.date).toBeDefined()
    })

    it('should add metadata to files without frontmatter', async () => {
      const contentWithoutFrontmatter = `# Simple Document

This is a simple document without frontmatter.

## Features

- Lists work
- **Bold text** works
- *Italic text* works`

      const request = createRequest({
        fileName: 'no-frontmatter.md',
        content: contentWithoutFrontmatter,
        targetPath: 'test-imports'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.metadata).toBeDefined()
      expect(data.metadata.title).toBe('no-frontmatter')
      expect(data.metadata.imported).toBeDefined()
    })
  })

  describe('GET /api/markdown/import', () => {
    it('should return configuration information', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.config).toMatchObject({
        maxFileSize: '5MB',
        allowedExtensions: ['.md', '.markdown'],
        supportedFeatures: [
          'frontmatter',
          'gfm',
          'syntax-highlighting',
          'style-conversion',
          'duplicate-handling'
        ]
      })
      expect(data.config.targetDirectory).toContain('src\\data')
    })
  })
})