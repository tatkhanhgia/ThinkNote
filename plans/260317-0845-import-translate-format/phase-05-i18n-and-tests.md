# Phase 5: i18n Strings & Tests

## Overview
- **Priority:** P2
- **Status:** Complete
- **Effort:** 2h
- Add translation strings for new UI elements and write tests

## Context Links
- [plan.md](./plan.md)

## Requirements

### i18n Strings
Add to both `src/messages/en.json` and `src/messages/vi.json`:

```json
{
  "markdown-import": {
    "options": {
      "title": "Import Options",
      "autoFormat": "Auto-format markdown",
      "autoTranslate": "Auto-translate to {locale}",
      "formatDescription": "Fix frontmatter, headings, code blocks, and whitespace",
      "translateDescription": "Create translated copy in {locale} folder"
    },
    "results": {
      "savedTo": "Saved to {path}",
      "translatedTo": "Translated copy saved to {path}",
      "formatChanges": "Format changes applied",
      "translationFailed": "Translation failed — original saved successfully",
      "bothFilesSaved": "Both language versions saved"
    }
  }
}
```

### Tests

#### TranslationService tests
- `src/lib/translation/__tests__/TranslationService.test.ts`
  - Mock `@vitalets/google-translate-api`
  - Test translate EN→VI
  - Test translate VI→EN
  - Test chunking for large text (>14000 chars)
  - Test retry on failure

#### MarkdownTranslator tests
- `src/lib/translation/__tests__/MarkdownTranslator.test.ts`
  - Test placeholder extraction (code blocks, links, images)
  - Test placeholder restoration
  - Test full translate with preserved markdown
  - Test frontmatter translation (title, description only)

#### MarkdownFormatter tests
- `src/lib/formatting/__tests__/MarkdownFormatter.test.ts`
  - Test frontmatter auto-generation
  - Test frontmatter gap-filling
  - Test heading normalization
  - Test code block balancing
  - Test link fixing
  - Test list normalization
  - Test whitespace cleanup
  - Test full format pipeline

#### Integration test
- `src/app/api/markdown/import/__tests__/translate-format.integration.test.ts`
  - Test import with autoFormat + autoTranslate
  - Test import with autoTranslate=false
  - Test translation failure → original still saved

## Related Code Files

### Create
- `src/lib/translation/__tests__/TranslationService.test.ts`
- `src/lib/translation/__tests__/MarkdownTranslator.test.ts`
- `src/lib/formatting/__tests__/MarkdownFormatter.test.ts`
- `src/app/api/markdown/import/__tests__/translate-format.integration.test.ts`

### Modify
- `src/messages/en.json` — Add new keys
- `src/messages/vi.json` — Add new keys

## Todo List
- [x] Add i18n keys to en.json
- [x] Add i18n keys to vi.json
- [x] Write TranslationService unit tests
- [x] Write MarkdownTranslator unit tests
- [x] Write MarkdownFormatter unit tests
- [x] Write integration test for import API with translate + format
- [x] Run all tests: `npx vitest run`
- [x] Verify no regressions in existing tests

## Success Criteria
- All new UI strings available in both EN and VI
- Unit tests cover core logic of each new module
- Integration test verifies end-to-end import with translate + format
- All existing tests still pass
