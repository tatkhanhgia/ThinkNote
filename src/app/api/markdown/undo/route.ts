import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface UndoRequest {
  filePath?: string
  filePaths?: string[]
  type: 'import' | 'delete' | 'modify'
  backupData?: any
}

export interface UndoResponse {
  success: boolean
  message?: string
  error?: string
}

const SUPPORTED_LOCALES = ['en', 'vi']

function isValidImportPath(filePath: string): boolean {
  if (filePath.includes('..') || filePath.includes('\\')) return false
  return SUPPORTED_LOCALES.some(locale => filePath.startsWith(`${locale}/`))
}

/**
 * DELETE /api/markdown/undo
 * Handle undo operations for markdown files
 */
export async function DELETE(request: NextRequest) {
  try {
    const body: UndoRequest = await request.json()
    const { filePath, filePaths, type } = body

    // Support single path or array of paths
    const paths: string[] = filePaths ?? (filePath ? [filePath] : [])

    if (paths.length === 0 || !type) {
      return NextResponse.json<UndoResponse>(
        { success: false, error: 'File path(s) and operation type are required' },
        { status: 400 }
      )
    }

    const dataDir = join(process.cwd(), 'src', 'data')

    switch (type) {
      case 'import': {
        const errors: string[] = []
        const deleted: string[] = []

        for (const fp of paths) {
          if (!isValidImportPath(fp)) {
            errors.push(`Invalid file path: ${fp}`)
            continue
          }
          const fullPath = join(dataDir, fp)
          if (existsSync(fullPath)) {
            try {
              await unlink(fullPath)
              deleted.push(fp)
            } catch (error) {
              errors.push(`Failed to delete ${fp}: ${error instanceof Error ? error.message : 'Unknown'}`)
            }
          }
          // Missing file is not an error for undo (already gone)
        }

        if (errors.length > 0) {
          return NextResponse.json<UndoResponse>(
            { success: false, error: errors.join('; ') },
            { status: 500 }
          )
        }

        return NextResponse.json<UndoResponse>({
          success: true,
          message: `Removed ${deleted.length} file(s): ${deleted.join(', ')}`
        })
      }

      default:
        return NextResponse.json<UndoResponse>(
          { success: false, error: `Unsupported undo operation: ${type}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Undo API error:', error)
    return NextResponse.json<UndoResponse>(
      { success: false, error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}