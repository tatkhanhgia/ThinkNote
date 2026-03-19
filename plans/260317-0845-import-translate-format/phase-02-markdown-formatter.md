# Phase 2: Markdown Formatter

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 3h
- Create auto-formatting module that normalizes uploaded markdown to project standards

## Context Links
- [plan.md](./plan.md)
- Existing: `src/lib/markdown/MarkdownProcessor.ts` (validation only, no formatting)
- Existing: `src/components/markdown/StyleConverter.ts` (HTML→Tailwind, not raw MD formatting)

## Key Insights
- Current import saves markdown as-is — no normalization
- Formatting runs BEFORE translation to ensure clean input
- Must handle: missing/incomplete frontmatter, heading levels, code blocks, lists, whitespace

## Requirements

### Functional
1. **Frontmatter normalization:**
   - Auto-generate missing frontmatter with required fields
   - Required: title (from h1 or filename), description (first paragraph), date (today), tags (empty array), categories (empty array), gradientFrom, gradientTo
   - Fix malformed YAML (missing quotes around special chars, indentation)
   - Preserve existing valid fields

2. **Heading normalization:**
   - Ensure content starts with h1 (promote if starts with h2+)
   - No skipped levels (h1→h3 becomes h1→h2)
   - Trim heading text whitespace

3. **Code block normalization:**
   - Balance unmatched ``` fences (close unclosed blocks)
   - Normalize language tags (lowercase: `JavaScript` → `javascript`)
   - Ensure blank line before/after code blocks

4. **Link validation:**
   - Fix common broken patterns: `[text] (url)` → `[text](url)` (no space)
   - Warn about broken/empty links (don't remove)

5. **List normalization:**
   - Consistent unordered markers: `*`, `+` → `-`
   - Consistent ordered: ensure sequential numbering `1. 2. 3.`
   - Ensure blank line before list start

6. **Whitespace cleanup:**
   - Trim trailing spaces on all lines
   - Collapse 3+ consecutive blank lines → 2
   - Ensure single newline at EOF
   - Normalize line endings to LF

### Non-functional
- Process synchronously (markdown formatting is fast, no async needed)
- Return list of changes made (for user feedback)

## Architecture

```
src/lib/formatting/
├── MarkdownFormatter.ts    // All formatting rules
└── index.ts                // Barrel export
```

## Related Code Files

### Create
- `src/lib/formatting/MarkdownFormatter.ts`
- `src/lib/formatting/index.ts`

### Reference (read-only)
- `src/lib/markdown/MarkdownProcessor.ts` — validation patterns to reuse
- `src/lib/posts.ts` — frontmatter field requirements

## Implementation Steps

1. Create `MarkdownFormatter.ts`:
   ```typescript
   import matter from 'gray-matter';

   interface FormatResult {
     content: string;
     changes: string[];  // List of changes made
     warnings: string[]; // Issues found but not auto-fixed
   }

   interface FormatOptions {
     fixFrontmatter?: boolean;   // default: true
     fixHeadings?: boolean;      // default: true
     fixCodeBlocks?: boolean;    // default: true
     fixLinks?: boolean;         // default: true
     fixLists?: boolean;         // default: true
     fixWhitespace?: boolean;    // default: true
     fileName?: string;          // For auto-generating title from filename
   }

   export class MarkdownFormatter {
     static format(content: string, options?: FormatOptions): FormatResult

     // Individual formatters (called in sequence)
     static formatFrontmatter(content: string, fileName?: string): { content: string; changes: string[] }
     static formatHeadings(content: string): { content: string; changes: string[] }
     static formatCodeBlocks(content: string): { content: string; changes: string[] }
     static formatLinks(content: string): { content: string; changes: string[]; warnings: string[] }
     static formatLists(content: string): { content: string; changes: string[] }
     static formatWhitespace(content: string): { content: string; changes: string[] }
   }
   ```

2. `formatFrontmatter` logic:
   - Parse with `gray-matter`
   - If no frontmatter: generate from content
     - title: first h1 text, or kebab-to-title from fileName
     - description: first non-heading paragraph (truncated to 200 chars)
     - date: today YYYY-MM-DD
     - tags: `[]`
     - categories: `[]`
     - gradientFrom/To: random from predefined palette
   - If has frontmatter: fill missing required fields only
   - Reassemble with `gray-matter.stringify()`

3. `formatHeadings` logic:
   - Scan all `^#{1,6} ` lines
   - Find minimum heading level
   - If min > 1: promote all by (min-1)
   - Check for gaps: if h1→h3 exists, warn (don't auto-fix to avoid content disruption)

4. `formatCodeBlocks` logic:
   - Track open/close state of ``` fences
   - If unclosed at EOF: append closing ```
   - Normalize language tag: trim, lowercase
   - Ensure blank line before opening and after closing fence

5. `formatLinks` logic:
   - Regex: `\[([^\]]*)\]\s+\(([^)]*)\)` → `[$1]($2)` (fix space between ] and ()
   - Warn on empty links: `[](url)` or `[text]()`

6. `formatLists` logic:
   - Replace `^\s*[*+] ` with `- ` (preserve indentation depth)
   - Re-number ordered lists sequentially per nesting level

7. `formatWhitespace` logic:
   - `line.trimEnd()` on each line
   - Collapse `\n{3,}` → `\n\n`
   - Ensure trailing `\n` at EOF
   - Replace `\r\n` with `\n`

8. Gradient palette for auto-generation:
   ```typescript
   const GRADIENT_PALETTE = [
     { from: '#3b82f6', to: '#8b5cf6' },
     { from: '#10b981', to: '#3b82f6' },
     { from: '#f59e0b', to: '#ef4444' },
     { from: '#6366f1', to: '#ec4899' },
     { from: '#14b8a6', to: '#6366f1' },
   ];
   ```

9. Create `index.ts` barrel export

## Todo List
- [x] Create `MarkdownFormatter.ts` with `format()` entry point
- [x] Implement `formatFrontmatter` with auto-generation
- [x] Implement `formatHeadings` with level normalization
- [x] Implement `formatCodeBlocks` with fence balancing
- [x] Implement `formatLinks` with space fix
- [x] Implement `formatLists` with marker normalization
- [x] Implement `formatWhitespace` with cleanup rules
- [x] Create `index.ts` barrel export
- [x] Test: file with no frontmatter gets complete frontmatter
- [x] Test: heading levels normalized correctly
- [x] Test: code blocks balanced and language tags lowercase

## Success Criteria
- Upload file with no frontmatter → gets complete, valid YAML frontmatter
- Upload file with `### Heading` as first → becomes `# Heading`
- Unclosed code blocks → auto-closed
- Mixed list markers (`*`, `+`, `-`) → all become `-`
- Trailing spaces and excess blank lines removed
- `changes` array reports all modifications made

## Risk Assessment
- **Over-formatting:** Could break intentional formatting. Mitigation: each formatter is opt-in via options
- **Frontmatter corruption:** Malformed YAML edge cases. Mitigation: wrap in try-catch, preserve original on failure
- **Regex edge cases:** Complex nested markdown. Mitigation: code blocks extracted first (placeholder approach) before processing

## Next Steps
- Phase 3 integrates formatter into import API pipeline
