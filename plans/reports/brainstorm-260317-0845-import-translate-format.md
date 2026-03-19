# Brainstorm: Markdown Import — Auto-Translate & Auto-Format

**Date:** 2026-03-17
**Status:** Agreed — moving to implementation plan

## Problem
1. Import saves to 1 locale only; `MarkdownImporter.tsx` hardcodes `locale: 'vi'`
2. No translation mechanism — need EN↔VI auto-translate on import
3. No auto-formatting — markdown saved as-is even if poorly structured

## Decisions

### Translation
- **API:** `@vitalets/google-translate-api` (free, zero-cost, quick setup)
- **Direction:** Bi-directional (upload EN → auto VI, upload VI → auto EN)
- **Flow:** Detect lang → save original → translate → save translated copy
- **Key technique:** Placeholder system to preserve markdown syntax during translation

### Auto-Formatting
- **Scope:** Full formatting
  - Frontmatter: auto-generate/fix missing fields (title, date, tags, categories, gradients)
  - Heading normalization (start h1, no skipped levels)
  - Code block balancing + language tag normalization
  - Link validation/fix
  - List normalization (consistent markers)
  - Whitespace cleanup (trailing spaces, blank lines, EOF newline)

### Architecture
- New modules: `src/lib/translation/`, `src/lib/formatting/`
- API: add `autoTranslate` param to import endpoint
- UI: fix locale detection, add translate toggle, side-by-side preview

### Risks & Mitigations
- Translation quality → preserve code blocks, technical terms
- Free API rate limiting → queue + retry with backoff
- MD syntax broken → placeholder token system
- Large files → chunk-based translation

## Sources
- [@google-cloud/translate npm](https://www.npmjs.com/package/@google-cloud/translate)
- [@vitalets/google-translate-api npm](https://www.npmjs.com/package/@vitalets/google-translate-api)
- [Free Google Translate alternatives](https://github.com/iamtraction/google-translate)
