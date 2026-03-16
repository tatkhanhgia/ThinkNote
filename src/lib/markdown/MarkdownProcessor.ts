import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import matter from 'gray-matter'
import { ContentSanitizer } from '../security/ContentSanitizer'
import { ChunkedProcessor, PerformanceMonitor } from '../performance/ChunkedProcessor'
import { MarkdownErrorHandler } from './MarkdownErrorHandler'

export interface MarkdownMetadata {
  title?: string
  description?: string
  tags?: string[]
  category?: string
  author?: string
  date?: string
  [key: string]: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  errorCodes: string[]
}

export interface ProcessedMarkdown {
  html: string
  metadata: MarkdownMetadata
  originalContent: string
  sanitizationWarnings?: string[]
  processingTime?: number
}

export class MarkdownProcessor {
  private static processor = remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })

  /**
   * Parse Markdown content and convert to HTML with security measures
   */
  static async parseMarkdown(content: string): Promise<string> {
    try {
      // First sanitize the markdown content
      const sanitizationResult = ContentSanitizer.sanitizeMarkdown(content);
      
      // Check for large content that should be processed in chunks
      if (ChunkedProcessor.shouldUseChunkedProcessing(content.length)) {
        const chunkResult = await ChunkedProcessor.processInChunks(
          sanitizationResult.sanitizedContent,
          async (chunk) => {
            const result = await this.processor.process(chunk);
            return result.toString();
          },
          {
            chunkSize: 50000, // 50KB chunks
            delayBetweenChunks: 5
          }
        );
        
        return chunkResult.results.join('');
      } else {
        const result = await this.processor.process(sanitizationResult.sanitizedContent);
        return result.toString();
      }
    } catch (error) {
      throw new Error(`Failed to parse Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process Markdown file with frontmatter extraction and security measures
   */
  static async processMarkdownFile(content: string): Promise<ProcessedMarkdown> {
    const { result, duration } = await PerformanceMonitor.measureAsync(async () => {
      try {
        // Sanitize markdown content first
        const sanitizationResult = ContentSanitizer.sanitizeMarkdown(content);
        
        // Parse frontmatter
        const { data: metadata, content: markdownContent } = matter(sanitizationResult.sanitizedContent);
        
        // Convert to HTML
        const html = await this.parseMarkdown(markdownContent);
        
        // Sanitize the final HTML output
        const htmlSanitizationResult = ContentSanitizer.sanitizeHtml(html);
        
        return {
          html: htmlSanitizationResult.sanitizedContent,
          metadata: metadata as MarkdownMetadata,
          originalContent: content,
          sanitizationWarnings: [
            ...sanitizationResult.warnings,
            ...htmlSanitizationResult.warnings
          ]
        };
      } catch (error) {
        throw new Error(`Failed to process Markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return {
      ...result,
      processingTime: duration
    };
  }

  /**
   * Extract metadata only without converting to HTML (for import purposes)
   */
  static async extractMetadataOnly(content: string): Promise<{ metadata: MarkdownMetadata; sanitizationWarnings: string[] }> {
    try {
      // Sanitize markdown content first
      const sanitizationResult = ContentSanitizer.sanitizeMarkdown(content);
      
      // Parse frontmatter only
      const { data: metadata } = matter(sanitizationResult.sanitizedContent);
      
      return {
        metadata: metadata as MarkdownMetadata,
        sanitizationWarnings: sanitizationResult.warnings
      };
    } catch (error) {
      throw new Error(`Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate Markdown content for syntax, structure, and security
   */
  static validateMarkdownContent(content: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const errorCodes: string[] = []

    try {
      // Check if content is empty
      if (!content || content.trim().length === 0) {
        errors.push('Content cannot be empty')
        errorCodes.push('EMPTY_CONTENT')
        return { isValid: false, errors, warnings, errorCodes }
      }

      // Basic length check - be more lenient
      if (content.length > 5 * 1024 * 1024) { // 5MB instead of 1MB
        const sizeMB = Math.round(content.length / 1024 / 1024);
        errors.push(`File is too large (${sizeMB}MB). Maximum size is 5MB.`);
        errorCodes.push('FILE_TOO_LARGE')
        return { isValid: false, errors, warnings, errorCodes }
      }

      // Try to parse frontmatter - this is the most common cause of validation failure
      try {
        matter(content)
      } catch (frontmatterError) {
        // Instead of failing, just warn about frontmatter issues
        warnings.push(`Frontmatter parsing issue: ${frontmatterError instanceof Error ? frontmatterError.message : 'Unknown error'}. File will be processed without frontmatter.`)
        errorCodes.push('INVALID_FRONTMATTER')
      }
      
      // Check for unbalanced code blocks - only error if severely unbalanced
      const codeBlockMatches = content.match(/```/g)
      if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
        warnings.push('Unbalanced code blocks detected - this may affect rendering')
        errorCodes.push('UNBALANCED_CODE_BLOCKS')
      }

      // Check for suspicious content patterns - only warn, don't fail
      const suspiciousPatterns = ContentSanitizer.detectSuspiciousContent(content);
      if (suspiciousPatterns.length > 0) {
        warnings.push(...suspiciousPatterns.map(pattern => `Security warning: ${pattern} (will be sanitized)`));
        errorCodes.push('SECURITY_THREAT')
      }

      // Check for malformed links - only warn
      const malformedLinks = content.match(/\[([^\]]*)\]\([^)]*$/gm)
      if (malformedLinks) {
        warnings.push('Potentially malformed links detected')
        errorCodes.push('MALFORMED_LINKS')
      }

      // Check for very long lines - only warn
      const lines = content.split('\n')
      const longLines = lines.filter(line => line.length > 1000).length
      if (longLines > 0) {
        warnings.push(`${longLines} lines are very long (>1000 characters)`)
      }

      // Always return valid unless there are critical errors
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        errorCodes
      }
    } catch (error) {
      // Even if there's an error, try to be more lenient
      warnings.push(`Validation warning: ${error instanceof Error ? error.message : 'Unknown error'}`)
      errorCodes.push('PROCESSING_ERROR')
      return {
        isValid: true, // Allow processing to continue
        errors,
        warnings,
        errorCodes
      }
    }
  }

  /**
   * Extract metadata from Markdown frontmatter
   */
  static extractMetadata(content: string): MarkdownMetadata {
    try {
      const { data } = matter(content)
      return data as MarkdownMetadata
    } catch (error) {
      // Return empty metadata if parsing fails
      return {}
    }
  }

  /**
   * Convert HTML to project-specific format with CSS classes
   */
  static async convertToProjectFormat(html: string): Promise<string> {
    // Apply project-specific CSS classes to HTML elements
    let convertedHtml = html

    // Add prose classes for typography
    convertedHtml = `<div class="prose prose-lg max-w-none">${convertedHtml}</div>`

    // Convert headings to use project styling
    convertedHtml = convertedHtml
      .replace(/<h1([^>]*)>/g, '<h1$1 class="heading-1">')
      .replace(/<h2([^>]*)>/g, '<h2$1 class="heading-2">')
      .replace(/<h3([^>]*)>/g, '<h3$1 class="heading-3">')
      .replace(/<h4([^>]*)>/g, '<h4$1 class="heading-4">')
      .replace(/<h5([^>]*)>/g, '<h5$1 class="heading-5">')
      .replace(/<h6([^>]*)>/g, '<h6$1 class="heading-6">')

    // Style code blocks
    convertedHtml = convertedHtml
      .replace(/<pre([^>]*)>/g, '<pre$1 class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">')
      .replace(/<code([^>]*)>/g, '<code$1 class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">')

    // Style tables
    convertedHtml = convertedHtml
      .replace(/<table([^>]*)>/g, '<table$1 class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">')
      .replace(/<th([^>]*)>/g, '<th$1 class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">')
      .replace(/<td([^>]*)>/g, '<td$1 class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">')

    // Style blockquotes
    convertedHtml = convertedHtml
      .replace(/<blockquote([^>]*)>/g, '<blockquote$1 class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400">')

    return convertedHtml
  }
}