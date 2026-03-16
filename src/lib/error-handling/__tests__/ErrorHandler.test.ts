import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler } from '../ErrorHandler'

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('categorizeError', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('fetch failed: network error')
      const result = ErrorHandler.categorizeError(networkError)

      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toBe('Network connection failed')
      expect(result.retryable).toBe(true)
      expect(result.suggestions).toContain('Check your internet connection')
    })

    it('should categorize validation errors correctly', () => {
      const validationError = new Error('Invalid file type: .txt not allowed')
      const result = ErrorHandler.categorizeError(validationError)

      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.message).toBe('File validation failed')
      expect(result.retryable).toBe(false)
      expect(result.suggestions).toContain('Ensure your file is a valid Markdown file (.md or .markdown)')
    })

    it('should categorize processing errors correctly', () => {
      const processingError = new Error('Failed to parse Markdown content')
      const result = ErrorHandler.categorizeError(processingError)

      expect(result.code).toBe('PROCESSING_ERROR')
      expect(result.message).toBe('Failed to process Markdown content')
      expect(result.retryable).toBe(true)
      expect(result.suggestions).toContain('Check your Markdown syntax')
    })

    it('should categorize server errors correctly', () => {
      const serverError = new Error('Server error: 500 Internal Server Error')
      const result = ErrorHandler.categorizeError(serverError)

      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe('Server encountered an error')
      expect(result.retryable).toBe(true)
      expect(result.suggestions).toContain('Try again in a few moments')
    })

    it('should categorize file system errors correctly', () => {
      const fsError = new Error('ENOENT: no such file or directory')
      const result = ErrorHandler.categorizeError(fsError)

      expect(result.code).toBe('FILE_SYSTEM_ERROR')
      expect(result.message).toBe('File system operation failed')
      expect(result.retryable).toBe(false)
      expect(result.suggestions).toContain('Check file permissions')
    })

    it('should categorize unknown errors correctly', () => {
      const unknownError = new Error('Something unexpected happened')
      const result = ErrorHandler.categorizeError(unknownError)

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.retryable).toBe(true)
      expect(result.suggestions).toContain('Try again')
    })

    it('should handle non-Error objects', () => {
      const stringError = 'Simple string error'
      const result = ErrorHandler.categorizeError(stringError)

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.details).toBe('Simple string error')
    })
  })

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      
      const result = await ErrorHandler.withRetry(mockFn)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')
      
      const result = await ErrorHandler.withRetry(mockFn, { maxAttempts: 2 })
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Invalid file type'))
      
      await expect(ErrorHandler.withRetry(mockFn)).rejects.toThrow('Invalid file type')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should respect maxAttempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('network error'))
      
      await expect(ErrorHandler.withRetry(mockFn, { maxAttempts: 3 })).rejects.toThrow('network error')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should apply exponential backoff', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('network error'))
      const startTime = Date.now()
      
      await expect(ErrorHandler.withRetry(mockFn, { 
        maxAttempts: 2, 
        baseDelay: 100,
        backoffFactor: 2
      })).rejects.toThrow('network error')
      
      const endTime = Date.now()
      const elapsed = endTime - startTime
      
      // Should have waited at least the base delay
      expect(elapsed).toBeGreaterThan(100)
    })
  })

  describe('formatErrorForUser', () => {
    it('should format error for user display', () => {
      const error = new Error('network error')
      const result = ErrorHandler.formatErrorForUser(error)

      expect(result.title).toBe('Connection Problem')
      expect(result.message).toBe('Network connection failed')
      expect(result.canRetry).toBe(true)
      expect(result.suggestions).toBeInstanceOf(Array)
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should include error details when available', () => {
      const error = new Error('Detailed error message')
      const result = ErrorHandler.formatErrorForUser(error)

      expect(result.details).toBe('Detailed error message')
    })
  })
})