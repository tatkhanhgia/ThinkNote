import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface UndoRequest {
  filePath: string
  type: 'import' | 'delete' | 'modify'
  backupData?: any
}

export interface UndoResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * DELETE /api/markdown/undo
 * Handle undo operations for markdown files
 */
export async function DELETE(request: NextRequest) {
  try {
    const body: UndoRequest = await request.json()
    const { filePath, type } = body

    if (!filePath || !type) {
      return NextResponse.json<UndoResponse>(
        { 
          success: false, 
          error: 'File path and operation type are required' 
        },
        { status: 400 }
      )
    }

    // Validate file path to prevent path traversal
    if (filePath.includes('..') || filePath.includes('\\') || !filePath.startsWith('imported/')) {
      return NextResponse.json<UndoResponse>(
        { 
          success: false, 
          error: 'Invalid file path' 
        },
        { status: 400 }
      )
    }

    const dataDir = join(process.cwd(), 'src', 'data')
    const fullFilePath = join(dataDir, filePath)

    switch (type) {
      case 'import':
        // Delete the imported file
        if (existsSync(fullFilePath)) {
          try {
            await unlink(fullFilePath)
            return NextResponse.json<UndoResponse>({
              success: true,
              message: `Successfully removed imported file: ${filePath}`
            })
          } catch (error) {
            return NextResponse.json<UndoResponse>(
              { 
                success: false, 
                error: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}` 
              },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json<UndoResponse>(
            { 
              success: false, 
              error: 'File not found or already deleted' 
            },
            { status: 404 }
          )
        }

      default:
        return NextResponse.json<UndoResponse>(
          { 
            success: false, 
            error: `Unsupported undo operation: ${type}` 
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Undo API error:', error)
    return NextResponse.json<UndoResponse>(
      { 
        success: false, 
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}