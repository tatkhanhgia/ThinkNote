import { translate } from '@vitalets/google-translate-api'
import { ErrorHandler } from '../error-handling'

const CHUNK_SIZE = 14000

export class TranslationService {
  /**
   * Translate text from one language to another.
   * Chunks large text at paragraph boundaries.
   */
  static async translate(text: string, from: string, to: string): Promise<string> {
    if (!text.trim()) return text

    if (text.length > CHUNK_SIZE) {
      return this.translateChunked(text, from, to)
    }

    return ErrorHandler.withRetry(
      async () => {
        const result = await translate(text, { from, to })
        return result.text
      },
      { maxAttempts: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    )
  }

  /**
   * Chunk text at paragraph boundaries and translate each chunk.
   */
  private static async translateChunked(text: string, from: string, to: string): Promise<string> {
    const paragraphs = text.split('\n\n')
    const chunks: string[] = []
    let current = ''

    for (const para of paragraphs) {
      const candidate = current ? current + '\n\n' + para : para
      if (candidate.length > CHUNK_SIZE && current) {
        chunks.push(current)
        current = para
      } else {
        current = candidate
      }
    }
    if (current) chunks.push(current)

    // Translate chunks sequentially to avoid rate limits
    const translated: string[] = []
    for (const chunk of chunks) {
      translated.push(await this.translate(chunk, from, to))
    }
    return translated.join('\n\n')
  }

  /**
   * Detect the language of a text sample.
   */
  static async detectLanguage(text: string): Promise<string> {
    try {
      const result = await translate(text.substring(0, 200), { to: 'en' })
      // raw.src is the detected source language
      return (result as any).raw?.src || 'en'
    } catch {
      return 'en'
    }
  }
}
