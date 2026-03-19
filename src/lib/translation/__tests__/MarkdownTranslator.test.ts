import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(),
}))

import { translate } from '@vitalets/google-translate-api'
import { MarkdownTranslator } from '../MarkdownTranslator'

const mockTranslate = vi.mocked(translate)

beforeEach(() => {
  vi.clearAllMocks()
  // Default: return input unchanged
  mockTranslate.mockImplementation(async (text: string) => ({ text } as any))
})

describe('MarkdownTranslator.extractPlaceholders', () => {
  it('extracts fenced code blocks', () => {
    const input = 'text\n```js\nconst x = 1;\n```\nmore text'
    const { text, placeholders } = MarkdownTranslator.extractPlaceholders(input)
    expect(text).not.toContain('```')
    expect(placeholders.size).toBe(1)
    const [id, val] = [...placeholders.entries()][0]
    expect(id).toMatch(/\{\{CODE_\d+\}\}/)
    expect(val).toContain('const x = 1;')
  })

  it('extracts inline code', () => {
    const input = 'Use `npm install` to install'
    const { text, placeholders } = MarkdownTranslator.extractPlaceholders(input)
    expect(text).not.toContain('`npm install`')
    expect(placeholders.size).toBe(1)
  })

  it('extracts images', () => {
    const input = '![alt text](https://example.com/img.png)'
    const { text, placeholders } = MarkdownTranslator.extractPlaceholders(input)
    expect(text).not.toContain('https://example.com/img.png')
    expect(placeholders.size).toBe(1)
  })

  it('preserves link text, replaces only URL', () => {
    const input = '[click here](https://example.com)'
    const { text } = MarkdownTranslator.extractPlaceholders(input)
    expect(text).toContain('[click here]')
    expect(text).not.toContain('https://example.com')
  })
})

describe('MarkdownTranslator.restorePlaceholders', () => {
  it('restores all placeholders', () => {
    const input = 'text {{CODE_0}} more'
    const placeholders = new Map([['{{CODE_0}}', '```js\ncode\n```']])
    const result = MarkdownTranslator.restorePlaceholders(input, placeholders)
    expect(result).toContain('```js\ncode\n```')
    expect(result).not.toContain('{{CODE_0}}')
  })
})

describe('MarkdownTranslator.translateFrontmatter', () => {
  it('translates title and description only', async () => {
    mockTranslate
      .mockResolvedValueOnce({ text: 'Tiêu đề dịch' } as any)
      .mockResolvedValueOnce({ text: 'Mô tả dịch' } as any)

    const fm = {
      title: 'Original Title',
      description: 'Original Description',
      tags: ['tag1', 'tag2'],
      categories: ['Cat'],
      date: '2026-01-01',
    }

    const result = await MarkdownTranslator.translateFrontmatter(fm, 'en', 'vi')
    expect(result.title).toBe('Tiêu đề dịch')
    expect(result.description).toBe('Mô tả dịch')
    expect(result.tags).toEqual(['tag1', 'tag2'])
    expect(result.categories).toEqual(['Cat'])
    expect(result.date).toBe('2026-01-01')
  })
})

describe('MarkdownTranslator.translateMarkdown', () => {
  it('returns original content with warning on translation failure', async () => {
    mockTranslate.mockRejectedValue(new Error('API error'))

    const content = '---\ntitle: Test\n---\n\nBody text\n'
    const { translatedContent, warnings } = await MarkdownTranslator.translateMarkdown(content, 'en', 'vi')

    // gray-matter.stringify normalizes EOF newline, so compare trimmed
    expect(translatedContent.trim()).toBe(content.trim())
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('preserves code blocks through translation', async () => {
    mockTranslate.mockImplementation(async (text: string) => ({ text } as any))

    const content = '---\ntitle: Test\n---\n\nText\n\n```js\nconst x = 1;\n```\n'
    const { translatedContent, warnings } = await MarkdownTranslator.translateMarkdown(content, 'en', 'vi')

    expect(translatedContent).toContain('const x = 1;')
    expect(warnings).toHaveLength(0)
  })
})
