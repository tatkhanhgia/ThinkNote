import matter from 'gray-matter'

export interface FormatResult {
  content: string
  changes: string[]
  warnings: string[]
}

export interface FormatOptions {
  fixFrontmatter?: boolean
  fixHeadings?: boolean
  fixCodeBlocks?: boolean
  fixLinks?: boolean
  fixLists?: boolean
  fixWhitespace?: boolean
  fileName?: string
}

const GRADIENT_PALETTE = [
  { from: '#3b82f6', to: '#8b5cf6' },
  { from: '#10b981', to: '#3b82f6' },
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#6366f1', to: '#ec4899' },
  { from: '#14b8a6', to: '#6366f1' },
]

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function randomGradient() {
  return GRADIENT_PALETTE[Math.floor(Math.random() * GRADIENT_PALETTE.length)]
}

function kebabToTitle(slug: string): string {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export class MarkdownFormatter {
  static format(content: string, options: FormatOptions = {}): FormatResult {
    const {
      fixFrontmatter = true,
      fixHeadings = true,
      fixCodeBlocks = true,
      fixLinks = true,
      fixLists = true,
      fixWhitespace = true,
      fileName,
    } = options

    const allChanges: string[] = []
    const allWarnings: string[] = []
    let current = content

    if (fixFrontmatter) {
      const r = this.formatFrontmatter(current, fileName)
      current = r.content
      allChanges.push(...r.changes)
    }
    if (fixCodeBlocks) {
      const r = this.formatCodeBlocks(current)
      current = r.content
      allChanges.push(...r.changes)
    }
    if (fixHeadings) {
      const r = this.formatHeadings(current)
      current = r.content
      allChanges.push(...r.changes)
      allWarnings.push(...(r.warnings ?? []))
    }
    if (fixLinks) {
      const r = this.formatLinks(current)
      current = r.content
      allChanges.push(...r.changes)
      allWarnings.push(...(r.warnings ?? []))
    }
    if (fixLists) {
      const r = this.formatLists(current)
      current = r.content
      allChanges.push(...r.changes)
    }
    if (fixWhitespace) {
      const r = this.formatWhitespace(current)
      current = r.content
      allChanges.push(...r.changes)
    }

    return { content: current, changes: allChanges, warnings: allWarnings }
  }

  static formatFrontmatter(content: string, fileName?: string): { content: string; changes: string[] } {
    const changes: string[] = []
    try {
      const parsed = matter(content)
      const fm = parsed.data as Record<string, any>
      const body = parsed.content

      const firstH1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim()
      const firstParagraph = body.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim()
      const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : undefined

      let modified = false
      if (!fm.title) {
        fm.title = firstH1 || (baseName ? kebabToTitle(baseName) : 'Untitled')
        changes.push('Added missing frontmatter: title')
        modified = true
      }
      if (!fm.description) {
        fm.description = firstParagraph ? firstParagraph.substring(0, 200) : ''
        changes.push('Added missing frontmatter: description')
        modified = true
      }
      if (!fm.date) {
        fm.date = todayStr()
        changes.push('Added missing frontmatter: date')
        modified = true
      }
      if (!fm.tags) {
        fm.tags = []
        changes.push('Added missing frontmatter: tags')
        modified = true
      }
      if (!fm.categories) {
        fm.categories = []
        changes.push('Added missing frontmatter: categories')
        modified = true
      }
      if (!fm.gradientFrom || !fm.gradientTo) {
        const g = randomGradient()
        if (!fm.gradientFrom) { fm.gradientFrom = g.from; modified = true }
        if (!fm.gradientTo) { fm.gradientTo = g.to; modified = true }
        changes.push('Added missing frontmatter: gradient colors')
      }

      if (modified) {
        return { content: matter.stringify(body, fm), changes }
      }
    } catch {
      // Malformed frontmatter — leave as-is
    }
    return { content, changes }
  }

  static formatHeadings(content: string): { content: string; changes: string[]; warnings: string[] } {
    const changes: string[] = []
    const warnings: string[] = []

    // Operate on body only (skip frontmatter)
    let hasFrontmatter = false
    let frontmatterBlock = ''
    let body = content

    if (content.startsWith('---')) {
      const end = content.indexOf('\n---', 3)
      if (end !== -1) {
        hasFrontmatter = true
        frontmatterBlock = content.substring(0, end + 4)
        body = content.substring(end + 4)
      }
    }

    const lines = body.split('\n')
    const headingLevels = lines
      .filter(l => /^#{1,6} /.test(l))
      .map(l => l.match(/^(#{1,6}) /)?.[1].length ?? 0)

    if (headingLevels.length === 0) return { content, changes, warnings }

    const minLevel = Math.min(...headingLevels)
    if (minLevel > 1) {
      const shift = minLevel - 1
      body = body.replace(/^(#{1,6}) /gm, (match, hashes) => {
        const newLevel = Math.max(1, hashes.length - shift)
        return '#'.repeat(newLevel) + ' '
      })
      changes.push(`Promoted headings: shifted by -${shift} level(s)`)
    }

    // Warn on skipped levels (e.g. h1 → h3)
    const updatedLevels = body
      .split('\n')
      .filter(l => /^#{1,6} /.test(l))
      .map(l => l.match(/^(#{1,6}) /)?.[1].length ?? 0)

    for (let i = 1; i < updatedLevels.length; i++) {
      if (updatedLevels[i] - updatedLevels[i - 1] > 1) {
        warnings.push(`Skipped heading level detected (h${updatedLevels[i - 1]} → h${updatedLevels[i]})`)
        break
      }
    }

    const result = hasFrontmatter ? frontmatterBlock + body : body
    return { content: result, changes, warnings }
  }

  static formatCodeBlocks(content: string): { content: string; changes: string[] } {
    const changes: string[] = []
    const lines = content.split('\n')
    const result: string[] = []
    let inBlock = false
    let unclosed = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const fenceMatch = line.match(/^```(\S*)/)
      if (fenceMatch) {
        if (!inBlock) {
          // Opening fence
          inBlock = true
          const lang = fenceMatch[1]
          const normalizedLang = lang.toLowerCase()
          if (lang && lang !== normalizedLang) {
            result.push(line.replace('```' + lang, '```' + normalizedLang))
            changes.push(`Normalized code block language tag: ${lang} → ${normalizedLang}`)
          } else {
            result.push(line)
          }
          // Ensure blank line before opening fence (if not first line)
          if (i > 0 && result[result.length - 2]?.trim() !== '') {
            result.splice(result.length - 1, 0, '')
            changes.push('Added blank line before code block')
          }
        } else {
          // Closing fence
          inBlock = false
          result.push(line)
          // Ensure blank line after closing fence
          if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
            result.push('')
            changes.push('Added blank line after code block')
          }
        }
      } else {
        result.push(line)
      }
    }

    if (inBlock) {
      result.push('```')
      unclosed = true
      changes.push('Closed unclosed code block')
    }

    return { content: result.join('\n'), changes }
  }

  static formatLinks(content: string): { content: string; changes: string[]; warnings: string[] } {
    const changes: string[] = []
    const warnings: string[] = []

    // Fix space between ] and (
    const fixed = content.replace(/\]\s+\(([^)]*)\)/g, (match, url) => {
      changes.push('Fixed space between ] and ( in link')
      return `](${url})`
    })

    // Warn on empty links
    const emptyLinks = fixed.match(/\[]\([^)]*\)|\[[^\]]+\]\(\)/g)
    if (emptyLinks) {
      warnings.push(`${emptyLinks.length} empty link(s) detected — not auto-fixed`)
    }

    return { content: fixed, changes, warnings }
  }

  static formatLists(content: string): { content: string; changes: string[] } {
    const changes: string[] = []

    // Normalize unordered markers * and + to -
    const normalized = content.replace(/^(\s*)[*+] /gm, (match, indent) => {
      changes.push('Normalized list marker to -')
      return `${indent}- `
    })

    return { content: normalized, changes: changes.length > 0 ? ['Normalized unordered list markers to -'] : [] }
  }

  static formatWhitespace(content: string): { content: string; changes: string[] } {
    const changes: string[] = []

    // Normalize CRLF to LF
    let result = content.replace(/\r\n/g, '\n')
    if (result !== content) changes.push('Normalized line endings to LF')

    // Trim trailing spaces on each line
    const trimmed = result.replace(/[ \t]+$/gm, '')
    if (trimmed !== result) { result = trimmed; changes.push('Removed trailing whitespace') }

    // Collapse 3+ consecutive blank lines to 2
    const collapsed = result.replace(/\n{3,}/g, '\n\n')
    if (collapsed !== result) { result = collapsed; changes.push('Collapsed excessive blank lines') }

    // Ensure single newline at EOF
    result = result.replace(/\n*$/, '\n')

    return { content: result, changes }
  }
}
