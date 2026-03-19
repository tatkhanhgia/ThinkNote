export interface UndoAction {
  id: string
  type: 'file_import' | 'file_delete' | 'file_modify'
  description: string
  timestamp: Date
  data: any
  undo: () => Promise<void>
}

export class UndoManager {
  private static actions: UndoAction[] = []
  private static readonly MAX_ACTIONS = 10
  private static readonly EXPIRY_TIME = 5 * 60 * 1000 // 5 minutes

  /**
   * Add an undoable action
   */
  static addAction(action: Omit<UndoAction, 'id' | 'timestamp'>): string {
    const id = Math.random().toString(36).substr(2, 9)
    const undoAction: UndoAction = {
      ...action,
      id,
      timestamp: new Date()
    }

    this.actions.unshift(undoAction)

    // Keep only the most recent actions
    if (this.actions.length > this.MAX_ACTIONS) {
      this.actions = this.actions.slice(0, this.MAX_ACTIONS)
    }

    // Clean up expired actions
    this.cleanupExpiredActions()

    return id
  }

  /**
   * Execute undo for a specific action
   */
  static async undoAction(id: string): Promise<boolean> {
    const actionIndex = this.actions.findIndex(action => action.id === id)
    if (actionIndex === -1) {
      return false
    }

    const action = this.actions[actionIndex]
    
    try {
      await action.undo()
      // Remove the action after successful undo
      this.actions.splice(actionIndex, 1)
      return true
    } catch (error) {
      console.error('Failed to undo action:', error)
      return false
    }
  }

  /**
   * Get all available undo actions
   */
  static getAvailableActions(): UndoAction[] {
    this.cleanupExpiredActions()
    return [...this.actions]
  }

  /**
   * Check if an action can be undone
   */
  static canUndo(id: string): boolean {
    this.cleanupExpiredActions()
    return this.actions.some(action => action.id === id)
  }

  /**
   * Clear all undo actions
   */
  static clearAll(): void {
    this.actions = []
  }

  /**
   * Remove expired actions
   */
  private static cleanupExpiredActions(): void {
    const now = new Date()
    this.actions = this.actions.filter(action => {
      const timeDiff = now.getTime() - action.timestamp.getTime()
      return timeDiff < this.EXPIRY_TIME
    })
  }

  /**
   * Create an undo action for file import.
   * Optionally includes a translated file path to delete both on undo.
   */
  static createFileImportUndo(
    filePath: string,
    fileName: string,
    translatedFilePath?: string
  ): Omit<UndoAction, 'id' | 'timestamp'> {
    const filePaths = [filePath, ...(translatedFilePath ? [translatedFilePath] : [])]
    return {
      type: 'file_import',
      description: `Import of ${fileName}`,
      data: { filePath, translatedFilePath, fileName },
      undo: async () => {
        const response = await fetch('/api/markdown/undo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePaths, type: 'import' })
        })

        if (!response.ok) {
          throw new Error(`Failed to undo import: ${response.statusText}`)
        }
      }
    }
  }
}