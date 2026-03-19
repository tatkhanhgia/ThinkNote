# Phase 3: Update Import API

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 2h
- Integrate formatter + translator into import API endpoint

## Context Links
- [plan.md](./plan.md)
- API: `src/app/api/markdown/import/route.ts`

## Key Insights
- Current API: validate → sanitize → save single file
- New flow: validate → **format** → sanitize → save → **translate** → save translated copy
- Translation is async and may be slow — save original first, then translate
- Two files saved on success: `src/data/{locale}/file.md` + `src/data/{otherLocale}/file.md`

## Requirements

### Functional
- New request params: `autoTranslate?: boolean`, `autoFormat?: boolean` (both default true)
- Format content before saving (using MarkdownFormatter)
- After saving original, translate and save to other locale directory
- Response includes: `originalPath`, `translatedPath?`, `formatChanges?`, `translationWarnings?`
- If translation fails: original still saved, return warning (not error)

### Non-functional
- Original file save must not be blocked by translation
- Translation timeout: 30 seconds max

## Architecture

### Updated Import Flow
```
Request → Validate → Decode
→ Format (if autoFormat=true)
→ Security check → Save to src/data/{locale}/
→ Translate (if autoTranslate=true)
→ Save translated to src/data/{otherLocale}/
→ Response with both paths
```

## Related Code Files

### Modify
- `src/app/api/markdown/import/route.ts` — Add format + translate steps

### Reference
- `src/lib/formatting/MarkdownFormatter.ts` (Phase 2)
- `src/lib/translation/MarkdownTranslator.ts` (Phase 1)

## Implementation Steps

1. Update `ImportRequest` interface:
   ```typescript
   export interface ImportRequest {
     fileName: string
     content: string
     isBase64?: boolean
     targetPath?: string
     overwrite?: boolean
     locale?: string
     autoTranslate?: boolean  // NEW - default true
     autoFormat?: boolean     // NEW - default true
   }
   ```

2. Update `ImportResponse` interface:
   ```typescript
   export interface ImportResponse {
     success: boolean
     filePath?: string           // original file path
     translatedFilePath?: string // NEW - translated file path
     fileName?: string
     error?: string
     metadata?: any
     warnings?: string[]
     securityWarnings?: string[]
     processingTime?: number
     formatChanges?: string[]    // NEW - list of format changes
     translationWarnings?: string[] // NEW - translation issues
   }
   ```

3. After decode + validation, add formatting step:
   ```typescript
   // Format markdown if enabled
   let formattedContent = decodedContent;
   let formatChanges: string[] = [];
   if (autoFormat !== false) {
     const formatResult = MarkdownFormatter.format(decodedContent, { fileName });
     formattedContent = formatResult.content;
     formatChanges = formatResult.changes;
   }
   ```

4. After saving original file, add translation step:
   ```typescript
   // Translate if enabled
   let translatedFilePath: string | undefined;
   let translationWarnings: string[] = [];
   if (autoTranslate !== false) {
     try {
       const otherLocale = finalLocale === 'en' ? 'vi' : 'en';
       const { translatedContent, warnings } = await MarkdownTranslator.translateMarkdown(
         finalContent, finalLocale, otherLocale
       );
       translationWarnings = warnings;

       // Save translated file
       const translatedDir = join(dataDir, otherLocale);
       await mkdir(translatedDir, { recursive: true });
       const translatedPath = join(translatedDir, finalFileName);
       await writeFile(translatedPath, translatedContent, 'utf8');
       translatedFilePath = join(otherLocale, finalFileName).replace(/\\/g, '/');
     } catch (error) {
       translationWarnings.push(`Translation failed: ${error instanceof Error ? error.message : 'Unknown'}`);
     }
   }
   ```

5. Update response to include new fields

6. Update UndoManager integration — undo should delete both files:
   - Store both paths in undo action data
   - Undo API (`/api/markdown/undo`) handles array of paths

## Todo List
- [x] Update `ImportRequest` interface with `autoTranslate`, `autoFormat`
- [x] Update `ImportResponse` interface with new fields
- [x] Add formatting step after decode/validation
- [x] Add translation step after saving original
- [x] Update response to include formatChanges, translatedFilePath, translationWarnings
- [x] Update undo to handle both files
- [x] Test: import with autoFormat=true formats content
- [x] Test: import with autoTranslate=true creates both locale files
- [x] Test: translation failure still saves original successfully

## Success Criteria
- Import saves to both `src/data/en/` and `src/data/vi/`
- Format changes reported in response
- Translation failure = warning, not error (original still saved)
- Undo removes both files

## Risk Assessment
- **Slow translation:** Mitigated by saving original first, translating after
- **Undo complexity:** Need to delete 2 files. Mitigated by storing both paths in undo data
- **Overwrite conflicts:** Translated file may already exist. Use same unique naming logic

## Security Considerations
- Translated content must go through ContentSanitizer before save
- Target paths for translated file use same path traversal prevention
