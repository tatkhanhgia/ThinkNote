import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, basename, extname } from 'path'
import { existsSync } from 'fs'
import { MarkdownProcessor } from '@/lib/markdown/MarkdownProcessor'
import { FileValidator } from '@/lib/validation'
import { ContentSanitizer } from '@/lib/security/ContentSanitizer'
import { PerformanceMonitor } from '@/lib/performance/ChunkedProcessor'
import { MarkdownFormatter } from '@/lib/formatting/MarkdownFormatter'
import { MarkdownTranslator } from '@/lib/translation/MarkdownTranslator'

export interface ImportRequest {
  fileName: string
  content: string
  isBase64?: boolean
  targetPath?: string
  overwrite?: boolean
  locale?: string
  autoTranslate?: boolean
  autoFormat?: boolean
}

export interface ImportResponse {
  success: boolean
  filePath?: string
  translatedFilePath?: string
  fileName?: string
  error?: string
  metadata?: any
  warnings?: string[]
  securityWarnings?: string[]
  processingTime?: number
  formatChanges?: string[]
  translationWarnings?: string[]
}

/**
 * POST /api/markdown/import
 * Handle Markdown file upload and processing with security measures
 */
export async function POST(request: NextRequest) {
  const { result, duration } = await PerformanceMonitor.measureAsync(async (): Promise<ImportResponse> => {
    try {
      // Parse request body with size limit check
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
        return {
          success: false,
          error: 'Request body too large'
        };
      }

      const body: ImportRequest = await request.json()
      const { fileName, content, isBase64 = false, targetPath, overwrite = false, locale, autoTranslate, autoFormat } = body

      // Detect locale from request headers if not provided
      const detectedLocale = locale || request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
      const supportedLocales = ['en', 'vi']
      const finalLocale = supportedLocales.includes(detectedLocale) ? detectedLocale : 'en'

      // Validate request data
      if (!fileName || !content) {
        return { 
          success: false, 
          error: 'File name and content are required' 
        };
      }

      // Decode base64 content if needed
      let decodedContent: string;
      try {
        if (isBase64) {
          const binaryString = Buffer.from(content, 'base64').toString('utf-8');
          decodedContent = binaryString;
        } else {
          decodedContent = content;
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to decode file content'
        };
      }

      // Format markdown if enabled (before security scan and validation)
      let formattedContent = decodedContent
      let formatChanges: string[] = []
      if (autoFormat !== false) {
        try {
          const formatResult = MarkdownFormatter.format(decodedContent, { fileName })
          formattedContent = formatResult.content
          formatChanges = formatResult.changes
        } catch {
          // Formatting failure is non-blocking
          formattedContent = decodedContent
        }
      }

      // Security: Detect suspicious content patterns
      const suspiciousPatterns = ContentSanitizer.detectSuspiciousContent(formattedContent);
      const securityWarnings: string[] = [];
      
      if (suspiciousPatterns.length > 0) {
        securityWarnings.push(...suspiciousPatterns);
        // Log security warnings for monitoring
        console.warn('Security warning in uploaded content:', suspiciousPatterns);
      }

      // Validate file name
      const fileNameValidation = FileValidator.validateFileName(fileName)
      if (!fileNameValidation.isValid) {
        return { 
          success: false, 
          error: `Invalid file name: ${fileNameValidation.errors.join(', ')}` 
        };
      }

      // Validate file type
      const fileTypeValidation = FileValidator.validateFileType(fileName)
      if (!fileTypeValidation.isValid) {
        return { 
          success: false, 
          error: `Invalid file type: ${fileTypeValidation.errors.join(', ')}` 
        };
      }

      // Validate content size (approximate)
      const contentSizeBytes = Buffer.byteLength(formattedContent, 'utf8')
      const sizeValidation = FileValidator.validateFileSize(contentSizeBytes)
      if (!sizeValidation.isValid) {
        return {
          success: false,
          error: `File too large: ${sizeValidation.errors.join(', ')}`
        };
      }

      // Validate Markdown content
      const contentValidation = MarkdownProcessor.validateMarkdownContent(formattedContent)
      if (!contentValidation.isValid) {
        return {
          success: false,
          error: `Invalid Markdown content: ${contentValidation.errors.join(', ')}`
        };
      }

      // Extract metadata only (don't convert to HTML)
      let metadataResult
      try {
        metadataResult = await MarkdownProcessor.extractMetadataOnly(formattedContent)
      } catch (error) {
        return {
          success: false,
          error: `Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Note: We don't convert to HTML here - we keep the original Markdown format

      // Security: Sanitize and validate file path
      let sanitizedTargetPath: string;
      try {
        sanitizedTargetPath = targetPath ? ContentSanitizer.sanitizeFilePath(targetPath) : finalLocale;
      } catch (error) {
        return { 
          success: false, 
          error: `Invalid target path: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Determine target file path with security checks - organize by locale
      const dataDir = join(process.cwd(), 'src', 'data')
      const fullTargetDir = join(dataDir, sanitizedTargetPath)
      
      // Security: Ensure target directory is within allowed bounds
      if (!fullTargetDir.startsWith(dataDir)) {
        return { 
          success: false, 
          error: 'Invalid target path: path traversal detected' 
        };
      }
    
      // Ensure target directory exists
      try {
        await mkdir(fullTargetDir, { recursive: true })
      } catch (error) {
        return { 
          success: false, 
          error: `Failed to create target directory: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Security: Sanitize final file name
      let sanitizedFileName: string;
      try {
        sanitizedFileName = ContentSanitizer.sanitizeFilePath(fileName);
      } catch (error) {
        return { 
          success: false, 
          error: `Invalid file name: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Generate unique file name if file exists and overwrite is false
      let finalFileName = sanitizedFileName
      const fullFilePath = join(fullTargetDir, finalFileName)
      
      if (existsSync(fullFilePath) && !overwrite) {
        const baseName = basename(sanitizedFileName, extname(sanitizedFileName))
        const extension = extname(sanitizedFileName)
        let counter = 1
        
        do {
          finalFileName = `${baseName}_${counter}${extension}`
          counter++
        } while (existsSync(join(fullTargetDir, finalFileName)))
      }

      const finalFilePath = join(fullTargetDir, finalFileName)
      
      // Security: Final path validation
      if (!finalFilePath.startsWith(fullTargetDir)) {
        return { 
          success: false, 
          error: 'Security error: invalid file path' 
        };
      }

      // Use formatted content as final content (formatter already adds frontmatter if missing)
      const finalContent = formattedContent

      // Save the file
      try {
        await writeFile(finalFilePath, finalContent, 'utf8')
      } catch (error) {
        return {
          success: false,
          error: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Translate and save to the other locale directory
      let translatedFilePath: string | undefined
      let translationWarnings: string[] = []
      if (autoTranslate !== false) {
        try {
          const otherLocale = finalLocale === 'en' ? 'vi' : 'en'
          const { translatedContent, warnings } = await MarkdownTranslator.translateMarkdown(
            finalContent, finalLocale, otherLocale
          )
          translationWarnings = warnings

          const translatedDir = join(dataDir, otherLocale)
          await mkdir(translatedDir, { recursive: true })

          // Unique naming for translated file
          let translatedFileName = finalFileName
          const tBaseName = basename(finalFileName, extname(finalFileName))
          const tExt = extname(finalFileName)
          let tc = 1
          while (existsSync(join(translatedDir, translatedFileName))) {
            translatedFileName = `${tBaseName}_${tc}${tExt}`
            tc++
          }

          await writeFile(join(translatedDir, translatedFileName), translatedContent, 'utf8')
          translatedFilePath = join(otherLocale, translatedFileName).replace(/\\/g, '/')
        } catch (error) {
          translationWarnings.push(
            `Translation failed: ${error instanceof Error ? error.message : 'Unknown'}`
          )
        }
      }

      // Collect all warnings
      const allWarnings = [
        ...fileNameValidation.warnings,
        ...fileTypeValidation.warnings,
        ...sizeValidation.warnings,
        ...contentValidation.warnings,
        ...(metadataResult.sanitizationWarnings || [])
      ]

      // Return success response
      const relativePath = join(sanitizedTargetPath, finalFileName).replace(/\\/g, '/')

      return {
        success: true,
        filePath: relativePath,
        translatedFilePath,
        fileName: finalFileName,
        metadata: metadataResult.metadata,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
        securityWarnings: securityWarnings.length > 0 ? securityWarnings : undefined,
        formatChanges: formatChanges.length > 0 ? formatChanges : undefined,
        translationWarnings: translationWarnings.length > 0 ? translationWarnings : undefined,
      };

    } catch (error) {
      console.error('Import API error:', error)
      return {
        success: false, 
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  });

  return NextResponse.json<ImportResponse>({
    ...result,
    processingTime: duration
  });
}



/**
 * GET /api/markdown/import
 * Get import status or configuration
 */
export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'src', 'data')
    const config = {
      maxFileSize: '5MB',
      allowedExtensions: ['.md', '.markdown'],
      targetDirectory: dataDir,
      supportedFeatures: [
        'frontmatter',
        'gfm',
        'syntax-highlighting',
        'style-conversion',
        'duplicate-handling'
      ]
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to get configuration: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}