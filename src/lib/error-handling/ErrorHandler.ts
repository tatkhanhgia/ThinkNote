export interface ErrorDetails {
  code: string
  message: string
  details?: string
  retryable?: boolean
  suggestions?: string[]
}

export interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export class ErrorHandler {
  private static readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  }

  /**
   * Categorize and enhance error information
   */
  static categorizeError(error: unknown): ErrorDetails {
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed',
          details: error.message,
          retryable: true,
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the problem persists'
          ]
        }
      }

      // File validation errors - pass through the original message
      if (error.message.includes('Invalid file') || error.message.includes('File type') || 
          error.message.includes('validation') || error.message.includes('INVALID_FILE_TYPE')) {
        return {
          code: 'VALIDATION_ERROR',
          message: error.message, // Use the original detailed message
          details: error.message,
          retryable: false,
          suggestions: [
            'Ensure your file is a valid Markdown file (.md or .markdown)',
            'Check that the file is not corrupted',
            'Try with a different file'
          ]
        }
      }

      // Processing errors
      if (error.message.includes('parse') || error.message.includes('process')) {
        return {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process Markdown content',
          details: error.message,
          retryable: true,
          suggestions: [
            'Check your Markdown syntax',
            'Remove any unsupported elements',
            'Try simplifying the content'
          ]
        }
      }

      // Server errors
      if (error.message.includes('500') || error.message.includes('Server error')) {
        return {
          code: 'SERVER_ERROR',
          message: 'Server encountered an error',
          details: error.message,
          retryable: true,
          suggestions: [
            'Try again in a few moments',
            'Contact support if the problem persists'
          ]
        }
      }

      // File system errors
      if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        return {
          code: 'FILE_SYSTEM_ERROR',
          message: 'File system operation failed',
          details: error.message,
          retryable: false,
          suggestions: [
            'Check file permissions',
            'Ensure sufficient disk space',
            'Contact administrator'
          ]
        }
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error),
      retryable: true,
      suggestions: [
        'Try again',
        'Refresh the page',
        'Contact support if the problem persists'
      ]
    }
  }

  /**
   * Execute function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.DEFAULT_RETRY_OPTIONS, ...options }
    let lastError: unknown

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const errorDetails = this.categorizeError(error)

        // Don't retry if error is not retryable
        if (!errorDetails.retryable || attempt === opts.maxAttempts) {
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
          opts.maxDelay
        )

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000

        await new Promise(resolve => setTimeout(resolve, jitteredDelay))
      }
    }

    throw lastError
  }

  /**
   * Format error for user display
   */
  static formatErrorForUser(error: unknown): {
    title: string
    message: string
    details?: string
    suggestions: string[]
    canRetry: boolean
  } {
    const errorDetails = this.categorizeError(error)

    return {
      title: this.getErrorTitle(errorDetails.code),
      message: errorDetails.message,
      details: errorDetails.details,
      suggestions: errorDetails.suggestions || [],
      canRetry: errorDetails.retryable || false
    }
  }

  private static getErrorTitle(code: string): string {
    const titles: Record<string, string> = {
      NETWORK_ERROR: 'Connection Problem',
      VALIDATION_ERROR: 'Invalid File',
      PROCESSING_ERROR: 'Processing Failed',
      SERVER_ERROR: 'Server Error',
      FILE_SYSTEM_ERROR: 'File System Error',
      UNKNOWN_ERROR: 'Unexpected Error'
    }

    return titles[code] || 'Error'
  }
}