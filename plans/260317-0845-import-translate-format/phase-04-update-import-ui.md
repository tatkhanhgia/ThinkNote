# Phase 4: Update Import UI

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 3h
- Fix locale handling, add translate toggle, show format changes in both import UIs

## Context Links
- [plan.md](./plan.md)
- Modal: `src/components/ui/MarkdownImporter.tsx` (hardcodes `locale: 'vi'`)
- Page: `src/app/[locale]/markdown-import/page.tsx` (hardcodes `locale: 'en'`)

## Key Insights
- MarkdownImporter.tsx sends `locale: 'vi'` hardcoded (line 188)
- markdown-import/page.tsx sends `locale: 'en'` hardcoded (line 156)
- Neither exposes translate/format options to user
- Need to pass actual locale from URL context

## Requirements

### Functional
1. **Fix locale:** Both UIs send actual locale from URL/context, not hardcoded
2. **Translate toggle:** Checkbox in preview step: "Auto-translate to {otherLocale}" (default: on)
3. **Format toggle:** Checkbox: "Auto-format markdown" (default: on)
4. **Show results:**
   - After import: show "Saved to en/file.md and vi/file.md"
   - Show format changes list (collapsible)
   - Show translation warnings if any
5. **Locale selector:** Allow user to pick source locale if auto-detect is wrong

### Non-functional
- Toggles should be simple checkboxes, not complex UI
- Processing step shows "Translating..." after "Saving..."

## Related Code Files

### Modify
- `src/components/ui/MarkdownImporter.tsx` — Fix locale, add toggles, show results
- `src/app/[locale]/markdown-import/page.tsx` — Same changes for page version

### Reference
- `src/messages/en.json` — Add new i18n keys (Phase 5)
- `src/messages/vi.json` — Add new i18n keys (Phase 5)

## Implementation Steps

### MarkdownImporter.tsx (Modal)

1. Accept `locale` prop:
   ```typescript
   interface MarkdownImporterProps {
     isOpen: boolean;
     onClose: () => void;
     onImportSuccess: (filePath: string) => void;
     locale: string;  // NEW — passed from parent
   }
   ```

2. Add state fields:
   ```typescript
   interface ImportState {
     // ... existing fields
     autoTranslate: boolean;   // NEW - default true
     autoFormat: boolean;       // NEW - default true
     formatChanges: string[];   // NEW
     translatedPath: string;    // NEW
     translationWarnings: string[]; // NEW
   }
   ```

3. Fix `handleConfirmImport` — use `locale` prop instead of hardcoded `'vi'`:
   ```typescript
   body: JSON.stringify({
     fileName: state.fileName,
     content: state.originalContent,
     isBase64: true,
     locale: locale,  // FROM PROP, not hardcoded
     autoTranslate: state.autoTranslate,
     autoFormat: state.autoFormat,
   })
   ```

4. Add toggles in preview step (below file info panel):
   ```tsx
   <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
     <h4 className="text-sm font-semibold text-gray-900 mb-3">Import Options</h4>
     <label className="flex items-center space-x-3 mb-2">
       <input type="checkbox" checked={state.autoFormat}
         onChange={e => setState(prev => ({...prev, autoFormat: e.target.checked}))} />
       <span className="text-sm">Auto-format markdown</span>
     </label>
     <label className="flex items-center space-x-3">
       <input type="checkbox" checked={state.autoTranslate}
         onChange={e => setState(prev => ({...prev, autoTranslate: e.target.checked}))} />
       <span className="text-sm">Auto-translate to {locale === 'en' ? 'Vietnamese' : 'English'}</span>
     </label>
   </div>
   ```

5. Update complete step to show both paths:
   ```tsx
   // Show: "Saved: en/file.md + vi/file.md"
   // Show format changes (collapsible list)
   // Show translation warnings if any
   ```

6. Update undo to handle both files

### markdown-import/page.tsx (Page)

7. Same changes but using `locale` from URL params (already available)
8. Fix line 156: `locale: 'en'` → `locale: locale`
9. Add same toggles and result display

### Parent Component Updates

10. Find where `MarkdownImporter` is rendered and pass `locale` prop:
    - Check `src/app/[locale]/layout.tsx` or wherever modal is opened
    - Add `locale={locale}` prop

## Todo List
- [x] Add `locale` prop to MarkdownImporter interface
- [x] Add `autoTranslate`, `autoFormat`, `formatChanges`, `translatedPath`, `translationWarnings` to ImportState
- [x] Fix hardcoded locale in MarkdownImporter.tsx (line 188)
- [x] Fix hardcoded locale in markdown-import/page.tsx (line 156)
- [x] Add import options toggles (format + translate) in preview step
- [x] Update complete step to show both file paths
- [x] Show format changes (collapsible)
- [x] Show translation warnings
- [x] Update parent to pass locale prop to MarkdownImporter
- [x] Update undo to handle translated file deletion

## Success Criteria
- No more hardcoded locale — uses actual page locale
- User sees toggles for format and translate in preview
- After import: shows both saved file paths
- Format changes visible in result
- Translation warnings visible if any

## Risk Assessment
- **Parent component changes:** May need to thread locale through multiple components. Low risk — locale available in layout.
- **UI complexity:** Keep toggles minimal — just checkboxes, no modals-in-modals

## Next Steps
- Phase 5 adds i18n strings for new UI elements
