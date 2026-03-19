import matter from 'gray-matter'
import { TranslationService } from './TranslationService'

interface TranslateResult {
  translatedContent: string
  warnings: string[]
}

// Patterns extracted before translation to preserve markdown syntax
const PATTERNS = [
  // Fenced code blocks (must be first)
  { key: 'CODE', regex: /```[\s\S]*?```/g },
  // Inline code
  { key: 'ICODE', regex: /`[^`\n]+`/g },
  // Images (before links to avoid partial match)
  { key: 'IMG', regex: /!\[[^\]]*\]\([^)]*\)/g },
  // HTML tags
  { key: 'HTML', regex: /<[a-zA-Z][^>]*>[\s\S]*?<\/[a-zA-Z]+>|<[a-zA-Z][^>]*\/>/g },
  // Link URLs only — keep link text for translation
  { key: 'LURL', regex: /\]\(([^)]+)\)/g },
]

export class MarkdownTranslator {
  /**
   * Replace non-translatable segments with numbered placeholders.
   */
  static extractPlaceholders(content: string): { text: string; placeholders: Map<string, string> } {
    const placeholders = new Map<string, string>()
    let text = content
    let counter = 0

    for (const { key, regex } of PATTERNS) {
      if (key === 'LURL') {
        // Special case: only replace the URL inside ](url), keep "](" and ")"
        text = text.replace(regex, (match, url) => {
          const id = `{{${key}_${counter++}}}`
          placeholders.set(id, url)
          return `](${id})`
        })
      } else {
        text = text.replace(regex, (match) => {
          const id = `{{${key}_${counter++}}}`
          placeholders.set(id, match)
          return id
        })
      }
    }

    return { text, placeholders }
  }

  /**
   * Restore placeholders to original content.
   */
  static restorePlaceholders(text: string, placeholders: Map<string, string>): string {
    let result = text
    for (const [id, original] of placeholders) {
      // Escape special regex chars in the id
      const escaped = id.replace(/[{}]/g, '\\$&')
      result = result.replace(new RegExp(escaped, 'g'), original)
    }
    return result
  }

  /**
   * Translate frontmatter — only title and description fields.
   */
  static async translateFrontmatter(
    frontmatter: Record<string, any>,
    from: string,
    to: string
  ): Promise<Record<string, any>> {
    const translated = { ...frontmatter }
    const fieldsToTranslate = ['title', 'description']

    for (const field of fieldsToTranslate) {
      if (translated[field] && typeof translated[field] === 'string') {
        translated[field] = await TranslationService.translate(translated[field], from, to)
      }
    }

    // Keep tags, categories, date, gradientFrom, gradientTo as-is
    return translated
  }

  /**
   * Translate markdown content from one locale to another.
   * Preserves code blocks, inline code, images, HTML, and link URLs.
   */
  static async translateMarkdown(
    content: string,
    fromLocale: string,
    toLocale: string
  ): Promise<TranslateResult> {
    const warnings: string[] = []

    try {
      // Separate frontmatter from body
      const parsed = matter(content)
      const { data: frontmatter, content: body } = parsed

      // Translate frontmatter title/description
      let translatedFrontmatter = frontmatter
      try {
        translatedFrontmatter = await MarkdownTranslator.translateFrontmatter(
          frontmatter,
          fromLocale,
          toLocale
        )
      } catch (err) {
        warnings.push(`Frontmatter translation failed: ${err instanceof Error ? err.message : 'Unknown'}`)
        translatedFrontmatter = frontmatter
      }

      // Extract placeholders from body
      const { text: bodyWithPlaceholders, placeholders } = MarkdownTranslator.extractPlaceholders(body)

      // Translate body
      let translatedBody = bodyWithPlaceholders
      try {
        translatedBody = await TranslationService.translate(bodyWithPlaceholders, fromLocale, toLocale)
      } catch (err) {
        warnings.push(`Body translation failed: ${err instanceof Error ? err.message : 'Unknown'} — using original`)
        translatedBody = body // fall back to original body (without placeholders)
        return {
          translatedContent: matter.stringify(body, frontmatter),
          warnings
        }
      }

      // Restore placeholders
      const restoredBody = MarkdownTranslator.restorePlaceholders(translatedBody, placeholders)

      // Reassemble with translated frontmatter
      const translatedContent = matter.stringify(restoredBody, translatedFrontmatter)

      return { translatedContent, warnings }
    } catch (err) {
      warnings.push(`Translation failed: ${err instanceof Error ? err.message : 'Unknown'} — using original`)
      return { translatedContent: content, warnings }
    }
  }
}
