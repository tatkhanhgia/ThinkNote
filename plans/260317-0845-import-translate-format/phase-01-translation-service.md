# Phase 1: Translation Service

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 2h
- Install `@vitalets/google-translate-api` and create translation modules

## Context Links
- [Brainstorm](../reports/brainstorm-260317-0845-import-translate-format.md)
- [plan.md](./plan.md)

## Key Insights
- `@vitalets/google-translate-api` uses unofficial Google Translate web API — free, unlimited
- Must preserve markdown syntax during translation (code blocks, links, HTML, frontmatter)
- Placeholder token system: replace non-translatable segments with `{{PLACEHOLDER_N}}`, translate, restore

## Requirements

### Functional
- Translate text EN→VI and VI→EN
- Detect source language from frontmatter `locale` field or auto-detect
- Preserve: code blocks, inline code, links, images, HTML tags, frontmatter YAML
- Translate frontmatter fields: title, description (NOT tags, categories — keep original)
- Handle translation failures gracefully (return original + warning)

### Non-functional
- Max 15k chars per translation call (API limit) — chunk if needed
- Retry with backoff on rate limit (reuse ErrorHandler.withRetry)
- Translation should be async, non-blocking

## Architecture

```
src/lib/translation/
├── TranslationService.ts    // Thin wrapper around google-translate-api
├── MarkdownTranslator.ts    // Markdown-aware translation with placeholder system
└── index.ts                 // Exports
```

### Data Flow
```
Input markdown → Extract frontmatter → Split body into segments
→ Replace non-translatable with placeholders → Translate text segments
→ Restore placeholders → Translate frontmatter (title, description)
→ Reassemble → Output translated markdown
```

## Related Code Files

### Create
- `src/lib/translation/TranslationService.ts` — Google Translate wrapper
- `src/lib/translation/MarkdownTranslator.ts` — Markdown-aware translator
- `src/lib/translation/index.ts` — Barrel export

### Modify
- `package.json` — Add `@vitalets/google-translate-api` dependency

## Implementation Steps

1. `npm install @vitalets/google-translate-api`

2. Create `TranslationService.ts`:
   ```typescript
   import translate from '@vitalets/google-translate-api';

   export class TranslationService {
     static async translate(text: string, from: string, to: string): Promise<string>
     static async detectLanguage(text: string): Promise<string>
     // Chunk text at paragraph boundaries if > 14000 chars
     // Retry with ErrorHandler.withRetry on failure
   }
   ```

3. Create `MarkdownTranslator.ts`:
   ```typescript
   export class MarkdownTranslator {
     // Placeholder system
     static extractPlaceholders(content: string): { text: string; placeholders: Map<string, string> }
     static restorePlaceholders(text: string, placeholders: Map<string, string>): string

     // Main entry point
     static async translateMarkdown(
       content: string,
       fromLocale: string,
       toLocale: string
     ): Promise<{ translatedContent: string; warnings: string[] }>

     // Translate frontmatter fields
     static async translateFrontmatter(
       frontmatter: Record<string, any>,
       fromLocale: string,
       toLocale: string
     ): Promise<Record<string, any>>
   }
   ```

4. Placeholder patterns to extract (regex):
   - Code blocks: `` ```...``` `` → `{{CODE_BLOCK_N}}`
   - Inline code: `` `...` `` → `{{INLINE_CODE_N}}`
   - Links: `[text](url)` → translate text, keep url
   - Images: `![alt](src)` → `{{IMAGE_N}}`
   - HTML tags: `<tag>...</tag>` → `{{HTML_N}}`
   - Frontmatter: `---...---` → extracted separately

5. Create `index.ts` barrel export

## Todo List
- [x] Install `@vitalets/google-translate-api`
- [x] Create `TranslationService.ts` with translate + detect methods
- [x] Create `MarkdownTranslator.ts` with placeholder system
- [x] Create `index.ts` barrel export
- [x] Test: translate simple text EN→VI
- [x] Test: translate markdown with code blocks preserved
- [x] Test: translate frontmatter title/description only

## Success Criteria
- `TranslationService.translate("Hello", "en", "vi")` returns Vietnamese text
- Code blocks, inline code, links, images survive translation intact
- Frontmatter title/description translated; tags/categories/date unchanged
- Graceful fallback on API failure (return original + warning)

## Risk Assessment
- **Rate limiting:** Mitigated by retry with backoff + chunking
- **API breakage:** Unofficial API may break; error handling returns original content
- **Translation quality:** Acceptable for technical content; code preserved via placeholders

## Security Considerations
- No API keys needed (unofficial API)
- Sanitize translated content same as original (reuse ContentSanitizer)
- No user data sent to external service beyond article content
