import { describe, it, expect } from 'vitest'
import { MarkdownFormatter } from '../MarkdownFormatter'

describe('MarkdownFormatter.formatFrontmatter', () => {
  it('generates complete frontmatter when none exists', () => {
    const input = '# My Title\n\nSome description paragraph.\n'
    const { content, changes } = MarkdownFormatter.formatFrontmatter(input, 'my-file.md')
    expect(content).toMatch(/^---\n/)
    expect(content).toContain('title:')
    expect(content).toContain('date:')
    expect(content).toContain('tags:')
    expect(content).toContain('categories:')
    expect(changes.length).toBeGreaterThan(0)
  })

  it('fills only missing fields when frontmatter exists', () => {
    const input = '---\ntitle: Existing Title\n---\n\nBody'
    const { content, changes } = MarkdownFormatter.formatFrontmatter(input)
    expect(content).toContain('title: Existing Title')
    expect(content).toContain('date:')
    expect(changes.some(c => c.includes('date'))).toBe(true)
  })

  it('preserves existing valid frontmatter unchanged', () => {
    const input = '---\ntitle: T\ndescription: D\ndate: 2026-01-01\ntags: []\ncategories: []\ngradientFrom: "#fff"\ngradientTo: "#000"\n---\n\nBody'
    const { changes } = MarkdownFormatter.formatFrontmatter(input)
    expect(changes).toHaveLength(0)
  })
})

describe('MarkdownFormatter.formatHeadings', () => {
  it('promotes h2 start to h1', () => {
    const input = '---\ntitle: T\n---\n\n## Introduction\n\n### Details\n'
    const { content, changes } = MarkdownFormatter.formatHeadings(input)
    expect(content).toContain('# Introduction')
    expect(content).toContain('## Details')
    expect(changes.some(c => c.includes('Promoted'))).toBe(true)
  })

  it('does not modify h1-starting content', () => {
    const input = '---\ntitle: T\n---\n\n# Title\n\n## Section\n'
    const { content, changes } = MarkdownFormatter.formatHeadings(input)
    expect(content).toContain('# Title')
    expect(content).toContain('## Section')
    expect(changes).toHaveLength(0)
  })
})

describe('MarkdownFormatter.formatCodeBlocks', () => {
  it('closes unclosed code blocks', () => {
    const input = 'text\n```js\nconst x = 1;\n'
    const { content, changes } = MarkdownFormatter.formatCodeBlocks(input)
    expect(content.trim()).toMatch(/```$/)
    expect(changes.some(c => c.includes('Closed'))).toBe(true)
  })

  it('normalizes language tags to lowercase', () => {
    const input = '```JavaScript\ncode\n```\n'
    const { content, changes } = MarkdownFormatter.formatCodeBlocks(input)
    expect(content).toContain('```javascript')
    expect(changes.some(c => c.includes('Normalized'))).toBe(true)
  })

  it('does not modify already correct code blocks', () => {
    const input = '```js\ncode\n```\n'
    const { changes } = MarkdownFormatter.formatCodeBlocks(input)
    expect(changes.filter(c => c.includes('Normalized') || c.includes('Closed'))).toHaveLength(0)
  })
})

describe('MarkdownFormatter.formatLinks', () => {
  it('fixes space between ] and (', () => {
    const input = '[text] (https://example.com)'
    const { content, changes } = MarkdownFormatter.formatLinks(input)
    expect(content).toBe('[text](https://example.com)')
    expect(changes.length).toBeGreaterThan(0)
  })

  it('warns on empty links', () => {
    const input = '[](https://example.com)'
    const { warnings } = MarkdownFormatter.formatLinks(input)
    expect(warnings.length).toBeGreaterThan(0)
  })
})

describe('MarkdownFormatter.formatLists', () => {
  it('normalizes * and + markers to -', () => {
    const input = '* item one\n+ item two\n- item three\n'
    const { content, changes } = MarkdownFormatter.formatLists(input)
    expect(content).toBe('- item one\n- item two\n- item three\n')
    expect(changes.length).toBeGreaterThan(0)
  })
})

describe('MarkdownFormatter.formatWhitespace', () => {
  it('removes trailing spaces', () => {
    const input = 'line one   \nline two  \n'
    const { content, changes } = MarkdownFormatter.formatWhitespace(input)
    expect(content).toBe('line one\nline two\n')
    expect(changes.some(c => c.includes('trailing'))).toBe(true)
  })

  it('collapses 3+ blank lines to 2', () => {
    const input = 'para one\n\n\n\npara two\n'
    const { content, changes } = MarkdownFormatter.formatWhitespace(input)
    expect(content).toBe('para one\n\npara two\n')
    expect(changes.some(c => c.includes('blank'))).toBe(true)
  })

  it('normalizes CRLF to LF', () => {
    const input = 'line one\r\nline two\r\n'
    const { content, changes } = MarkdownFormatter.formatWhitespace(input)
    expect(content).not.toContain('\r')
    expect(changes.some(c => c.includes('LF'))).toBe(true)
  })
})

describe('MarkdownFormatter.format (full pipeline)', () => {
  it('runs all formatters and returns combined changes', () => {
    const input = '## Section\n\n* item\n\ntext   \n'
    const { content, changes } = MarkdownFormatter.format(input, { fileName: 'test.md' })
    expect(content).toContain('# Section')
    expect(content).toContain('- item')
    expect(content).not.toContain('   ')
    expect(changes.length).toBeGreaterThan(0)
  })
})
