import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { DELETE } from '../route'

// Mock fs functions
vi.mock('fs/promises', () => ({
  unlink: vi.fn()
}))

vi.mock('fs', () => ({
  existsSync: vi.fn()
}))

describe('/api/markdown/undo', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should successfully delete imported file', async () => {
      const { existsSync } = await import('fs')
      const { unlink } = await import('fs/promises')
      
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(unlink).mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'imported/test.md',
          type: 'import'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Successfully removed imported file')
      expect(unlink).toHaveBeenCalledWith(
        expect.stringContaining('src/data/imported/test.md')
      )
    })

    it('should return error for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'imported/test.md'
          // missing type
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File path and operation type are required')
    })

    it('should reject invalid file paths', async () => {
      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: '../../../etc/passwd',
          type: 'import'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file path')
    })

    it('should reject paths outside imported directory', async () => {
      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'other/test.md',
          type: 'import'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file path')
    })

    it('should return 404 when file does not exist', async () => {
      const { existsSync } = await import('fs')
      
      vi.mocked(existsSync).mockReturnValue(false)

      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'imported/nonexistent.md',
          type: 'import'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File not found or already deleted')
    })

    it('should handle file deletion errors', async () => {
      const { existsSync } = await import('fs')
      const { unlink } = await import('fs/promises')
      
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(unlink).mockRejectedValue(new Error('Permission denied'))

      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'imported/test.md',
          type: 'import'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Failed to delete file')
    })

    it('should reject unsupported operation types', async () => {
      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: 'imported/test.md',
          type: 'unsupported'
        })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unsupported undo operation')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/markdown/undo', {
        method: 'DELETE',
        body: 'invalid json'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Server error')
    })

    it('should validate file path format', async () => {
      const testCases = [
        'imported\\test.md', // backslash
        'imported/../test.md', // path traversal
        'test.md', // not in imported directory
        '', // empty path
      ]

      for (const filePath of testCases) {
        const request = new NextRequest('http://localhost/api/markdown/undo', {
          method: 'DELETE',
          body: JSON.stringify({
            filePath,
            type: 'import'
          })
        })

        const response = await DELETE(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toContain('Invalid file path')
      }
    })
  })
})