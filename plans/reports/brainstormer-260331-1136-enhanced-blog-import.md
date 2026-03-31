# Enhanced Blog Import Feature - Brainstorm Report

**Date:** 2026-03-31  
**Status:** Brainstorm Complete  
**Scope:** Admin blog import with multi-step wizard, frontmatter-optional support

---

## Problem Statement

The current admin blog import (AdminBlogClient modal) requires pasted markdown with valid YAML frontmatter containing a title field. If frontmatter is missing or incomplete, import fails. Users need to import raw markdown from external sources (notes, other blogs) that may lack frontmatter, with a guided UI to fill in metadata before saving.

## Requirements Summary

- Admin-only, i18n (en/vi)
- Accept input via: paste in textarea OR upload .md file
- Multi-step flow: Input -> Preview and Configure -> Import
- Auto-extract title from first # heading, description from first paragraph when no frontmatter
- Metadata form: title, description, mood, tags, cover image, date, locale
- Reuse existing components (CategoryTagInput, mood selector, FileUploadZone)
- Keep files under 200 lines, honor YAGNI/KISS/DRY

---

## Evaluated Approaches

### Approach A: Extend Existing Import Modal In-Place

**Description:** Expand the current modal in admin-blog-client.tsx to include a two-step flow (paste/upload -> configure metadata -> import) within the same modal dialog.

**Pros:**
- Minimal new files; changes stay within existing component
- No new routes or pages needed
- Quick to implement

**Cons:**
- admin-blog-client.tsx is already 184 lines -- adding a multi-step wizard with form fields, file upload, and preview will blow past 200 lines significantly
- Modal UX is cramped for a multi-step wizard with preview + form
- Difficult to test the wizard logic in isolation
- Mixing list management and import wizard responsibilities violates SRP

**Verdict:** Rejected -- violates file size constraint and produces poor UX for a multi-step flow inside a modal.

---

### Approach B: Dedicated Import Page at /admin/blog/import

**Description:** Create a new route /[locale]/admin/blog/import/page.tsx with a dedicated full-page multi-step wizard. Extract the wizard steps into small, focused components.

**Pros:**
- Full-page layout gives room for side-by-side preview + form
- Clean separation: AdminBlogClient stays as-is (just a link to import page)
- Follows the existing KB import pattern (/markdown-import/page.tsx) -- consistent UX
- Each step component stays under 200 lines easily
- Testable in isolation
- URL-addressable (can bookmark, share)

**Cons:**
- More files (page + 2-3 step components)
- Slightly more routing overhead

**Verdict:** Recommended -- best UX, cleanest architecture, follows existing patterns.

---

### Approach C: Slide-Over/Drawer Panel

**Description:** Replace the modal with a full-height slide-over drawer that houses the multi-step wizard.

**Pros:**
- User stays on the blog list page (context preservation)
- More space than a modal

**Cons:**
- Still constrained width; preview + form side-by-side is awkward
- No existing drawer component to reuse -- new UI primitive needed
- Does not match existing import pattern (KB import uses full page)
- YAGNI: drawer component adds complexity with no other use case

**Verdict:** Rejected -- introduces unnecessary UI complexity (YAGNI) and does not match existing patterns.

---

## Recommended Approach: B -- Dedicated Import Page

### Rationale

1. **Consistency:** Mirrors the KB markdown import wizard flow that already exists at /markdown-import/
2. **Space:** Full page allows a comfortable 2-column layout (preview left, form right) or stacked on mobile
3. **File size:** Each component stays well under 200 lines
4. **Reuse:** FileUploadZone, CategoryTagInput, and BLOG_MOODS are directly reusable
5. **Maintainability:** Clear file ownership; import logic is self-contained

---

## Component Breakdown

### New Files

| File | Purpose | Est. Lines |
|------|---------|------------|
| src/app/[locale]/admin/blog/import/page.tsx | Page wrapper, auth check, renders wizard | ~40 |
| src/components/ui/blog-import-wizard.tsx | Wizard state machine, step orchestration | ~150 |
| src/components/ui/blog-import-input-step.tsx | Step 1: textarea paste + file upload toggle | ~100 |
| src/components/ui/blog-import-configure-step.tsx | Step 2: metadata form + markdown preview | ~180 |
| src/lib/blog-import-utils.ts | Extract title/desc from raw markdown, merge frontmatter | ~60 |

### Modified Files

| File | Change |
|------|--------|
| src/components/ui/admin-blog-client.tsx | Replace import modal with Link to /admin/blog/import |
| src/app/api/blog/import/route.ts | Accept optional metadata alongside content; fallback extraction |
| src/messages/en.json | Add blogImport i18n keys |
| src/messages/vi.json | Add blogImport i18n keys (Vietnamese) |

### Reused Existing Components

| Component | Used For |
|-----------|----------|
| FileUploadZone | File upload with drag-and-drop in step 1 |
| CategoryTagInput | Tags input in step 2 |
| BLOG_MOODS + mood selector pattern from BlogForm | Mood dropdown in step 2 |

---

## UX Flow Description

### Step 1: Input (paste or upload)

- Two tabs: Paste Markdown and Upload File
- Paste tab: large textarea for pasting raw markdown (with or without frontmatter)
- Upload tab: FileUploadZone component for drag-and-drop .md file upload
- Locale selector defaults to current locale
- Next button parses content, extracts metadata, advances to step 2

### Step 2: Preview and Configure (2-column layout)

**Left column: Markdown Preview**
- Rendered or raw markdown preview of the content body

**Right column: Blog Metadata Form**
- Title input (pre-filled from frontmatter or auto-extracted from first # heading)
- Description textarea (pre-filled from frontmatter or first paragraph)
- Mood selector dropdown (reuse BLOG_MOODS pattern from BlogForm)
- Tags chip input (reuse CategoryTagInput)
- Cover Image URL input
- Date picker (default: today or frontmatter date)
- Language selector
- Status toggle: Draft / Published (default: Published for backward compat)
- Back button returns to step 1
- Import button sends to API

### Step 3: Success (inline confirmation)

- Brief success message with link to the imported post
- Option to Import Another or Back to Blog List

---

## Auto-Extraction Logic (blog-import-utils.ts)

The extractBlogMetadata function works as follows:

1. Try gray-matter parse on the raw markdown
2. If frontmatter has title, use frontmatter values as-is
3. If no frontmatter or no title:
   - Scan for first # heading line and use as title
   - Find first non-empty paragraph after heading and use as description
   - Strip the extracted heading from content body (avoid duplication in saved post)
4. Return object: { title, description, mood, tags, date, coverImage, markdownBody }

This utility is shared between client (for preview pre-fill) and server (as fallback).

---

## API Changes

### Current: POST /api/blog/import

Accepts: { content: string; locale?: string; isBase64?: boolean }
Requires frontmatter with a title field.

### Proposed: Extend with optional metadata override

Add a new optional metadata field to the request body:

metadata?: {
  title?: string;
  description?: string;
  mood?: string;
  tags?: string[];
  coverImage?: string;
  date?: string;          // ISO string
  status?: DRAFT | PUBLISHED;
}

**Merge logic (server-side):**
1. Parse frontmatter from content with gray-matter
2. If metadata provided, it takes priority over frontmatter values
3. If neither provides a title, attempt auto-extraction from # heading
4. If still no title, return 400 error
5. All other fields fall back gracefully (description empty, mood null, tags empty, date now)

This is **backward-compatible** -- existing calls without metadata still work exactly as before.

---

## i18n Keys Needed

Add a blogImport section to both en.json and vi.json with keys:

- title, pasteTab, uploadTab, pastePlaceholder
- next, back, import, importing
- preview, configure
- autoExtracted (hint: Auto-extracted from content)
- success, importAnother, backToList
- selectMood, publishNow, saveAsDraft
- coverImageUrl, selectDate

---

## Implementation Effort Estimate

| Task | Effort | Complexity |
|------|--------|------------|
| blog-import-utils.ts (extraction logic) | 1h | Low |
| blog-import-input-step.tsx (step 1 UI) | 1.5h | Low |
| blog-import-configure-step.tsx (step 2 UI) | 2h | Medium |
| blog-import-wizard.tsx (orchestrator) | 1.5h | Medium |
| page.tsx (route + auth) | 0.5h | Low |
| API extension (/api/blog/import) | 1h | Low |
| admin-blog-client.tsx (replace modal with link) | 0.5h | Low |
| i18n keys (en + vi) | 0.5h | Low |
| Testing | 1.5h | Medium |
| **Total** | **~10h** | **Medium** |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Markdown preview rendering inconsistency with final output | Medium | Use same remark pipeline client-side; or show raw markdown with code formatting instead of rendered HTML |
| Auto-extraction fails on unusual markdown structures | Low | Always show form for manual override; extraction is best-effort |
| FileUploadZone i18n keys assume KB import context | Low | Component uses useTranslations with markdown-import namespace -- either reuse those keys or pass a custom namespace prop |
| Large markdown files cause slow client-side parsing | Low | gray-matter is fast; limit file size to 2MB (practical for blog posts) |

---

## Success Criteria

1. Admin can import a raw markdown file (no frontmatter) as a blog post
2. Admin can import markdown with frontmatter -- fields are pre-filled and editable
3. Import works via both paste and file upload
4. Metadata form correctly pre-fills from auto-extraction
5. Published posts appear in blog listing immediately
6. Draft posts appear in admin blog list with DRAFT status
7. All UI labels are translated (en + vi)
8. No regression: existing import flow (if called directly via API) still works

---

## Open Questions

1. **FileUploadZone i18n coupling:** The existing FileUploadZone uses useTranslations with the markdown-import namespace. Should we add a translationNamespace prop, or reuse the existing markdown-import keys for this context too? (Reusing is simpler and KISS-compliant since the labels are generic enough.)

2. **Preview rendering:** Should step 2 render full HTML preview (requires remark client-side or a preview API call) or just show raw markdown in a styled pre block? The raw approach is simpler (KISS) and avoids client-side remark dependency. Rendered preview is nicer but heavier.

3. **Status choice:** Should the import default to PUBLISHED (current behavior) or DRAFT? Adding a toggle gives flexibility with minimal cost. Current API hardcodes PUBLISHED.

---

## Next Steps

If approved, run /plan --fast with this report as context to generate implementation phases.
