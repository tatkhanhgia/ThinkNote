# Phase 5: i18n & Testing

## Context Links
- [en.json](../../src/messages/en.json)
- [vi.json](../../src/messages/vi.json)
- [Blog Moods](../../src/lib/blog-moods.ts)

## Overview
- **Priority:** P2
- **Status:** Complete
- **Effort:** 0.5h

Add translation keys for blog admin UI and verify all features work in both locales.

## Requirements

### Functional
- All blog admin UI text translated (en + vi)
- Blog form labels, buttons, placeholders translated
- Mood names translated
- Admin nav "Blog" label translated

### Non-functional
- Consistent with existing translation structure
- No missing keys (causes fallback warnings)

## Related Code Files

### Modify
- `src/messages/en.json` — Add blog admin keys
- `src/messages/vi.json` — Add Vietnamese translations

## Implementation Steps

### 1. Add Translation Keys

**en.json additions:**
```json
{
  "AdminBlog": {
    "title": "Blog Management",
    "description": "Create and manage blog posts",
    "create": "Create Blog Post",
    "edit": "Edit Blog Post",
    "import": "Import Markdown",
    "importDescription": "Upload a markdown file to create a blog post",
    "noPosts": "No blog posts yet",
    "confirmDelete": "Are you sure you want to delete this blog post?",
    "publishedSuccessfully": "Blog post published",
    "savedAsDraft": "Saved as draft",
    "deleted": "Blog post deleted"
  },
  "BlogForm": {
    "title": "Title",
    "titlePlaceholder": "Enter blog title...",
    "description": "Description",
    "descriptionPlaceholder": "Brief description of your blog post...",
    "content": "Content",
    "mood": "Mood",
    "moodPlaceholder": "Select a mood...",
    "tags": "Tags",
    "tagsPlaceholder": "Add tags separated by commas",
    "coverImage": "Cover Image",
    "locale": "Language",
    "date": "Date",
    "saveDraft": "Save Draft",
    "publish": "Publish",
    "update": "Update",
    "autoSaved": "Auto-saved"
  },
  "Admin": {
    "navigation": {
      "blog": "Blog"
    }
  }
}
```

**vi.json additions:** Vietnamese translations of above.

### 2. Verify Mood Translations

Check `blog-moods.ts` already has bilingual labels. If not, add vi labels.

### 3. Smoke Test Checklist

- [ ] Switch to Vietnamese → admin blog pages show Vietnamese text
- [ ] Switch to English → admin blog pages show English text
- [ ] Create blog post in Vietnamese locale
- [ ] Create blog post in English locale
- [ ] Blog list page shows correct locale posts
- [ ] Mood filter labels translated

## Todo List
- [x] Add AdminBlog keys to en.json
- [x] Add AdminBlog keys to vi.json
- [x] Add BlogForm keys to en.json
- [x] Add BlogForm keys to vi.json
- [x] Add Admin.navigation.blog key to both
- [x] Verify mood translations in blog-moods.ts
- [x] Run smoke tests in both locales
- [x] Run `npm run build` — verify no errors
- [x] Run `npm run lint` — verify no warnings

## Success Criteria
- All admin blog UI shows correct translations in both locales
- No missing translation key warnings in console
- Build passes cleanly
- Lint passes

## Risk Assessment
- **Very Low:** Missing keys cause fallback to key name (visible but not breaking)

## Security Considerations
- None (translation keys only)

## Next Steps
- Feature complete. Ready for code review.
