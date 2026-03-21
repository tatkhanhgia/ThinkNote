import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UndoManager } from '../UndoManager'

// Mock fetch globally
global.fetch = vi.fn()

describe('UndoManager', () => {
  beforeEach(() => {
    UndoManager.clearAll()
    vi.clearAllMocks()
  })

  afterEach(() => {
    UndoManager.clearAll()
  })

  describe('addAction', () => {
    it('should add an action and return an id', () => {
      const mockUndo = vi.fn().mockResolvedValue(undefined)
      
      const id = UndoManager.addAction({
        type: 'file_import',
        description: 'Test import',
        data: { filePath: 'test.md' },
        undo: mockUndo
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should store actions in order', () => {
      const mockUndo1 = vi.fn().mockResolvedValue(undefined)
      const mockUndo2 = vi.fn().mockResolvedValue(undefined)
      
      const id1 = UndoManager.addAction({
        type: 'file_import',
        description: 'First import',
        data: { filePath: 'first.md' },
        undo: mockUndo1
      })

      const id2 = UndoManager.addAction({
        type: 'file_import',
        description: 'Second import',
        data: { filePath: 'second.md' },
        undo: mockUndo2
      })

      const actions = UndoManager.getAvailableActions()
      expect(actions).toHaveLength(2)
      expect(actions[0].id).toBe(id2) // Most recent first
      expect(actions[1].id).toBe(id1)
    })

    it('should limit the number of stored actions', () => {
      const mockUndo = vi.fn().mockResolvedValue(undefined)
      
      // Add more than the maximum number of actions
      for (let i = 0; i < 15; i++) {
        UndoManager.addAction({
          type: 'file_import',
          description: `Import ${i}`,
          data: { filePath: `file${i}.md` },
          undo: mockUndo
        })
      }

      const actions = UndoManager.getAvailableActions()
      expect(actions.length).toBeLessThanOrEqual(10) // MAX_ACTIONS = 10
    })
  })

  describe('undoAction', () => {
    it('should execute undo and remove action on success', async () => {
      const mockUndo = vi.fn().mockResolvedValue(undefined)
      
      const id = UndoManager.addAction({
        type: 'file_import',
        description: 'Test import',
        data: { filePath: 'test.md' },
        undo: mockUndo
      })

      const result = await UndoManager.undoAction(id)

      expect(result).toBe(true)
      expect(mockUndo).toHaveBeenCalledTimes(1)
      expect(UndoManager.getAvailableActions()).toHaveLength(0)
    })

    it('should return false for non-existent action', async () => {
      const result = await UndoManager.undoAction('non-existent-id')
      expect(result).toBe(false)
    })

    it('should return false when undo fails', async () => {
      const mockUndo = vi.fn().mockRejectedValue(new Error('Undo failed'))
      
      const id = UndoManager.addAction({
        type: 'file_import',
        description: 'Test import',
        data: { filePath: 'test.md' },
        undo: mockUndo
      })

      const result = await UndoManager.undoAction(id)

      expect(result).toBe(false)
      expect(mockUndo).toHaveBeenCalledTimes(1)
      // Action should still exist after failed undo
      expect(UndoManager.getAvailableActions()).toHaveLength(1)
    })
  })

  describe('canUndo', () => {
    it('should return true for existing action', () => {
      const mockUndo = vi.fn().mockResolvedValue(undefined)
      
      const id = UndoManager.addAction({
        type: 'file_import',
        description: 'Test import',
        data: { filePath: 'test.md' },
        undo: mockUndo
      })

      expect(UndoManager.canUndo(id)).toBe(true)
    })

    it('should return false for non-existent action', () => {
      expect(UndoManager.canUndo('non-existent-id')).toBe(false)
    })
  })

  describe('createFileImportUndo', () => {
    it('should create a valid undo action for file import', () => {
      const undoAction = UndoManager.createFileImportUndo('imported/test.md', 'test.md')

      expect(undoAction.type).toBe('file_import')
      expect(undoAction.description).toBe('Import of test.md')
      expect(undoAction.data).toEqual({
        filePath: 'imported/test.md',
        translatedFilePath: undefined,
        fileName: 'test.md'
      })
      expect(typeof undoAction.undo).toBe('function')
    })

    it('should make API call when undo is executed', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response)

      const undoAction = UndoManager.createFileImportUndo('imported/test.md', 'test.md')
      await undoAction.undo()

      expect(mockFetch).toHaveBeenCalledWith('/api/markdown/undo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePaths: ['imported/test.md'],
          type: 'import'
        })
      })
    })

    it('should throw error when API call fails', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      } as Response)

      const undoAction = UndoManager.createFileImportUndo('imported/test.md', 'test.md')
      
      await expect(undoAction.undo()).rejects.toThrow('Failed to undo import: Not Found')
    })
  })

  describe('cleanup', () => {
    it('should remove expired actions', () => {
      vi.useFakeTimers()
      
      const mockUndo = vi.fn().mockResolvedValue(undefined)
      
      const id = UndoManager.addAction({
        type: 'file_import',
        description: 'Test import',
        data: { filePath: 'test.md' },
        undo: mockUndo
      })

      expect(UndoManager.getAvailableActions()).toHaveLength(1)

      // Simulate 6 minutes passing (expiry is 5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000)

      // Cleanup should happen when getting actions
      expect(UndoManager.getAvailableActions()).toHaveLength(0)

      vi.useRealTimers()
    })
  })
})