# Phase 4: TipTap Editor & Article Pages

## Context Links
- [KnowledgeCard Component](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/KnowledgeCard.tsx)
- [Auth Form Card Pattern](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/auth-form-card.tsx)
- [Profile Form Pattern](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/profile-form.tsx)
- [globals.css](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/styles/globals.css)
- [Plan Overview](./plan.md)

## Overview
- **Priority**: P1
- **Status**: completed
- **Effort**: 5h
- **Depends on**: Phase 2 (API routes), Phase 3 (image upload)
- TipTap WYSIWYG editor component + create/edit article pages with auto-save

## Key Insights
- TipTap renders as React component, outputs HTML string
- Use `@tiptap/starter-kit` for basics (bold, italic, headings, lists, code, blockquote)
- Extensions: link, image, placeholder, table (4 packages), code-block-lowlight (optional)
- Follow existing UI patterns: Tailwind, no shadcn/radix, glass-morphism design
- Auto-save draft every 30s via debounced API call
- Dynamic import TipTap to reduce initial bundle
- Editor is client-only (`'use client'`)

## Requirements

### Functional
- **Article Editor Component**: TipTap with toolbar (headings, bold, italic, link, image, table, code block, lists, blockquote)
- **Image Upload in Editor**: Button in toolbar + drag-and-drop + paste from clipboard
- **Create Page** (`/[locale]/articles/create`): New article form with title, description, categories, tags, editor, gradient picker
- **Edit Page** (`/[locale]/articles/[slug]/edit`): Pre-populated form for existing article (author or admin only)
- **Auto-Save**: Debounced save to API every 30s while editing (DRAFT status only)
- **Category/Tag Selector**: Multi-select with typeahead, option to add new ones
- **Preview Toggle**: Switch between edit and preview modes
- Locale selector (en/vi) for article language

### Non-Functional
- TipTap loaded via `next/dynamic` with `ssr: false` to avoid SSR issues
- Editor toolbar responsive (collapsible on mobile)
- Content area min-height 400px

## Architecture

```
Pages:
  /[locale]/articles/create -> ArticleCreatePage (client)
  /[locale]/articles/[slug]/edit -> ArticleEditPage (client)

Components:
  article-editor.tsx     - TipTap editor with toolbar
  category-tag-input.tsx - Multi-select input for categories/tags
  article-form.tsx       - Full form wrapping editor + metadata inputs

Data Flow:
  User types -> TipTap state -> debounce 30s -> PUT /api/articles/[id] (auto-save)
  User clicks "Save Draft" -> PUT /api/articles/[id]
  User clicks "Submit for Review" -> POST /api/articles/[id]/submit
```

## Related Code Files

### Files to Create
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/article-editor.tsx` - TipTap editor component
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/category-tag-input.tsx` - Multi-select input
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/components/ui/article-form.tsx` - Full article form
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/articles/create/page.tsx` - Create page
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/[locale]/articles/[slug]/edit/page.tsx` - Edit page

### Files to Modify
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/package.json` - Add TipTap packages
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/styles/globals.css` - TipTap editor styles
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/en.json` - i18n strings
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/messages/vi.json` - i18n strings

## Implementation Steps

### Step 1: Install TipTap packages
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-link @tiptap/extension-image \
  @tiptap/extension-placeholder @tiptap/extension-table \
  @tiptap/extension-table-row @tiptap/extension-table-cell \
  @tiptap/extension-table-header
```

### Step 2: Create article-editor.tsx
Key elements:
- `'use client'` directive
- `useEditor()` hook from `@tiptap/react` with extensions
- Toolbar component with buttons for each formatting action
- Image upload handler: on toolbar click or paste/drop, call POST /api/upload, insert returned URL
- Bubble menu for link editing
- `editor.getHTML()` to extract content
- Expose via `onUpdate` callback prop

Toolbar layout:
```
[H1][H2][H3] | [B][I][U][S] | [Link][Image] | [UL][OL][Blockquote] | [Code][CodeBlock] | [Table] | [Undo][Redo]
```

### Step 3: Create category-tag-input.tsx
- Text input with chip display
- On type, show suggestions from existing categories/tags (fetch from API)
- On Enter or comma, add as new chip
- Click chip X to remove
- Props: `type: 'categories' | 'tags'`, `value: string[]`, `onChange: (v: string[]) => void`

### Step 4: Create article-form.tsx
Wraps all inputs:
- Title input (required)
- Description textarea
- Locale select (en/vi)
- CategoryTagInput for categories
- CategoryTagInput for tags
- ArticleEditor for content
- Gradient picker (optional, two color inputs)
- Action buttons: "Save Draft", "Preview", "Submit for Review"
- Auto-save logic: useEffect with 30s debounce on content/title changes

### Step 5: Create /articles/create/page.tsx
- `requireAuth()` server-side check (redirect to login if not auth)
- On mount: POST /api/articles with empty title to create DRAFT, get back article ID
- Pass article ID to ArticleForm for subsequent PUT updates
- On "Submit for Review": POST /api/articles/[id]/submit, redirect to my-articles dashboard

### Step 6: Create /articles/[slug]/edit/page.tsx
- Server component: fetch article data, verify ownership (author or admin)
- Pass article data to ArticleForm client component
- If article not found or not owner -> redirect to 404/403

### Step 7: Add TipTap styles to globals.css
```css
/* TipTap Editor */
.tiptap-editor .ProseMirror {
  min-height: 400px;
  outline: none;
  padding: 1.5rem;
}
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
```

### Step 8: Add i18n translations
Add to en.json and vi.json under `"Articles"` namespace:
```json
{
  "Articles": {
    "create": { "title": "Write Article", "description": "Share your knowledge" },
    "edit": { "title": "Edit Article" },
    "form": {
      "title": "Title", "titlePlaceholder": "Enter article title...",
      "description": "Description", "descriptionPlaceholder": "Brief summary...",
      "content": "Content", "contentPlaceholder": "Start writing...",
      "categories": "Categories", "tags": "Tags",
      "locale": "Language", "coverImage": "Cover Image",
      "saveDraft": "Save Draft", "saving": "Saving...",
      "submitReview": "Submit for Review", "submitting": "Submitting...",
      "preview": "Preview", "edit": "Edit",
      "autoSaved": "Auto-saved", "lastSaved": "Last saved {time}",
      "gradientFrom": "Card gradient start", "gradientTo": "Card gradient end"
    },
    "toolbar": {
      "heading1": "Heading 1", "heading2": "Heading 2", "heading3": "Heading 3",
      "bold": "Bold", "italic": "Italic", "underline": "Underline", "strike": "Strikethrough",
      "link": "Link", "image": "Image", "bulletList": "Bullet List",
      "orderedList": "Numbered List", "blockquote": "Quote",
      "code": "Inline Code", "codeBlock": "Code Block",
      "table": "Table", "undo": "Undo", "redo": "Redo"
    }
  }
}
```

## Todo List
- [x] Install TipTap packages
- [x] Create article-editor.tsx with toolbar + image upload
- [x] Create category-tag-input.tsx
- [x] Create article-form.tsx with auto-save
- [x] Create /articles/create/page.tsx
- [x] Create /articles/[slug]/edit/page.tsx
- [x] Add TipTap styles to globals.css
- [x] Add i18n translations (en + vi)
- [x] Test editor with formatting, image upload, auto-save
- [x] Test create flow end-to-end
- [x] Test edit flow with existing article

## Success Criteria
- TipTap editor renders without SSR errors
- All toolbar actions work (headings, formatting, links, images, tables)
- Image upload via button/drag-drop/paste works
- Auto-save fires every 30s and persists to DB
- Create page creates DRAFT article, edit page loads existing
- Submit for Review changes status to PENDING
- Form validates required fields before submit

## Risk Assessment
- **Medium**: TipTap bundle size ~150KB gzipped — mitigate with dynamic import
- **Low**: TipTap paste handler may conflict with browser behavior — test across browsers
- **Medium**: Auto-save could cause race conditions — use AbortController to cancel pending save before new one
- **Low**: Table extension adds complexity — can defer to Phase 6 if time-constrained

## Security Considerations
- Create/edit pages require authentication
- Edit page verifies article ownership server-side
- Image upload goes through authenticated /api/upload endpoint
- No raw HTML input — TipTap generates HTML from structured editor state
- Content sanitized again on save via API (Phase 2)

## Next Steps
- Phase 5: User Dashboard + Admin Moderation (can work in parallel once API is done)
- Phase 6: Integration with existing KB
