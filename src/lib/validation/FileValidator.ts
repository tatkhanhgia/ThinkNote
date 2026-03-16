export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FileValidationOptions {
  maxSizeBytes?: number
  allowedExtensions?: string[]
  allowedMimeTypes?: string[]
}

export class FileValidator {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly DEFAULT_ALLOWED_EXTENSIONS = ['.md', '.markdown']
  private static readonly DEFAULT_ALLOWED_MIME_TYPES = [
    'text/markdown',
    'text/x-markdown',
    'text/plain',
    'application/octet-stream' // Some systems don't set proper MIME type for .md files
  ]

  /**
   * Validate file type based on extension
   */
  static validateFileType(
    fileName: string, 
    allowedExtensions: string[] = this.DEFAULT_ALLOWED_EXTENSIONS
  ): FileValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!fileName) {
      errors.push('File name is required')
      return { isValid: false, errors, warnings }
    }

    const extension = this.getFileExtension(fileName).toLowerCase()
    
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File type '${extension}' is not allowed. Allowed types: ${allowedExtensions.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate file size
   */
  static validateFileSize(
    fileSize: number, 
    maxSizeBytes: number = this.DEFAULT_MAX_SIZE
  ): FileValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (fileSize <= 0) {
      errors.push('File appears to be empty')
    } else if (fileSize > maxSizeBytes) {
      errors.push(`File size (${this.formatFileSize(fileSize)}) exceeds maximum allowed size (${this.formatFileSize(maxSizeBytes)})`)
    } else if (fileSize > maxSizeBytes * 0.8) {
      warnings.push(`File size (${this.formatFileSize(fileSize)}) is close to the maximum limit`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate MIME type
   */
  static validateMimeType(
    mimeType: string,
    allowedMimeTypes: string[] = this.DEFAULT_ALLOWED_MIME_TYPES
  ): FileValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!mimeType) {
      warnings.push('MIME type could not be determined')
      return { isValid: true, errors, warnings }
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      // Don't fail validation for MIME type alone, as it can be unreliable
      warnings.push(`Unexpected MIME type '${mimeType}'. Expected one of: ${allowedMimeTypes.join(', ')}`)
    }

    return {
      isValid: true, // Always pass MIME type validation, just warn
      errors,
      warnings
    }
  }

  /**
   * Comprehensive file validation
   */
  static validateFile(
    file: File,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const {
      maxSizeBytes = this.DEFAULT_MAX_SIZE,
      allowedExtensions = this.DEFAULT_ALLOWED_EXTENSIONS,
      allowedMimeTypes = this.DEFAULT_ALLOWED_MIME_TYPES
    } = options

    const allErrors: string[] = []
    const allWarnings: string[] = []

    // Validate file type
    const typeValidation = this.validateFileType(file.name, allowedExtensions)
    allErrors.push(...typeValidation.errors)
    allWarnings.push(...typeValidation.warnings)

    // Validate file size
    const sizeValidation = this.validateFileSize(file.size, maxSizeBytes)
    allErrors.push(...sizeValidation.errors)
    allWarnings.push(...sizeValidation.warnings)

    // Validate MIME type
    const mimeValidation = this.validateMimeType(file.type, allowedMimeTypes)
    allErrors.push(...mimeValidation.errors)
    allWarnings.push(...mimeValidation.warnings)

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  /**
   * Validate file name for security and compatibility
   */
  static validateFileName(fileName: string): FileValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!fileName) {
      errors.push('File name is required')
      return { isValid: false, errors, warnings }
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1f]/
    if (dangerousChars.test(fileName)) {
      errors.push('File name contains invalid characters')
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i
    if (reservedNames.test(fileName)) {
      errors.push('File name uses a reserved system name')
    }

    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      errors.push('File name cannot contain path separators or traversal sequences')
    }

    // Check length
    if (fileName.length > 255) {
      errors.push('File name is too long (maximum 255 characters)')
    }

    // Check for leading/trailing spaces or dots
    if (fileName !== fileName.trim()) {
      warnings.push('File name has leading or trailing whitespace')
    }

    if (fileName.startsWith('.') && fileName !== '.md' && fileName !== '.markdown') {
      warnings.push('File name starts with a dot (hidden file)')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.')
    return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex)
  }

  /**
   * Format file size in human-readable format
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Check if file is a Markdown file based on extension
   */
  static isMarkdownFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName).toLowerCase()
    return this.DEFAULT_ALLOWED_EXTENSIONS.includes(extension)
  }
}