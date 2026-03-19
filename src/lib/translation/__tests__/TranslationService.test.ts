import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(),
}))

import { translate } from '@vitalets/google-translate-api'
import { TranslationService } from '../TranslationService'

const mockTranslate = vi.mocked(translate)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TranslationService', () => {
  it('translates EN→VI', async () => {
    mockTranslate.mockResolvedValueOnce({ text: 'Xin chào' } as any)
    const result = await TranslationService.translate('Hello', 'en', 'vi')
    expect(result).toBe('Xin chào')
    expect(mockTranslate).toHaveBeenCalledWith('Hello', { from: 'en', to: 'vi' })
  })

  it('translates VI→EN', async () => {
    mockTranslate.mockResolvedValueOnce({ text: 'Hello' } as any)
    const result = await TranslationService.translate('Xin chào', 'vi', 'en')
    expect(result).toBe('Hello')
  })

  it('returns empty string for empty input', async () => {
    const result = await TranslationService.translate('', 'en', 'vi')
    expect(result).toBe('')
    expect(mockTranslate).not.toHaveBeenCalled()
  })

  it('returns whitespace-only string unchanged', async () => {
    const result = await TranslationService.translate('   ', 'en', 'vi')
    expect(result).toBe('   ')
  })

  it('chunks large text at paragraph boundaries', async () => {
    const para = 'paragraph '.repeat(200) // ~2000 chars per para
    const largeText = Array(8).fill(para).join('\n\n') // ~16000 chars

    mockTranslate.mockResolvedValue({ text: 'translated' } as any)
    await TranslationService.translate(largeText, 'en', 'vi')

    // Should have been called multiple times due to chunking
    expect(mockTranslate.mock.calls.length).toBeGreaterThan(1)
  })
})
