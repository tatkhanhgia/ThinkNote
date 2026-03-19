# Brainstorm: Personal Blog Feature for ThinkNote

**Date:** 2026-03-18
**Status:** Agreed
**Participants:** User + AI Brainstormer

---

## Problem Statement

ThinkNote currently serves as a technical knowledge base. User wants to add a personal blog section for sharing life experiences, personal thoughts, reflections — distinct from technical articles.

## Requirements

### Functional
- Blog listing page (`/[locale]/blog`) with card grid
- Blog detail page (`/[locale]/blog/[slug]`) with warm reading experience
- Mood/emotion tag system (predefined 8 moods) with filtering
- Reading time estimate per post
- Bilingual support (en/vi) reusing existing next-intl
- Blog nav tab in main navigation
- Separate data folder (`src/data/blog/[locale]/`)

### Non-Functional
- Visual identity distinct from KB (warm & cozy vs glass-morphism)
- Mobile-responsive design
- SEO metadata for blog posts
- Content authored in Markdown with extended frontmatter

---

## Architecture Decision

**Chosen: Fully Separated** — Blog has its own routes, data folder, layout, and visual language.

### Route Structure (Next.js Route Groups)
```
src/app/[locale]/
├── (knowledge-base)/    ← existing KB routes (unchanged)
│   ├── topics/
│   ├── categories/
│   └── tags/
├── (personal-blog)/     ← new blog section
│   ├── blog/
│   │   ├── page.tsx         (blog listing)
│   │   └── [slug]/page.tsx  (blog detail)
│   └── layout.tsx           (blog-specific layout wrapper)
```

### Data Structure
```
src/data/blog/
├── en/
│   └── *.md    (English blog posts)
└── vi/
    └── *.md    (Vietnamese blog posts)
```

### Blog Post Frontmatter
```yaml
---
title: "My Thoughts on Life"
description: "A reflection on..."
date: "2026-03-18"
mood: "reflective"           # predefined mood tag
tags: ["life", "career"]     # regular tags
coverImage: "/images/blog/..."  # optional hero image
---
```

### Predefined Mood Tags
| Mood | Icon | EN | VI |
|------|------|----|----|
| reflective | 🌸 | Reflective | Suy ngẫm |
| joyful | ☀️ | Joyful | Vui vẻ |
| thoughtful | 🌙 | Thoughtful | Trăn trở |
| nostalgic | 🌿 | Nostalgic | Hoài niệm |
| grateful | 🌻 | Grateful | Biết ơn |
| inspired | ✨ | Inspired | Cảm hứng |
| melancholic | 🌧️ | Melancholic | Trầm lắng |
| excited | 🚀 | Excited | Hào hứng |

---

## Visual Design: Warm & Cozy

### Color Palette
- **Background:** warm cream `#F9F7F3`
- **Text:** dark warm gray `#3D3833`
- **Accent:** terracotta `#C17765`
- **Accent secondary:** soft sage `#8B9D83`
- **Card bg:** white `#FFFFFF` with subtle warm shadow
- **Mood tag bg:** soft pastels per mood

### Typography
- **Body:** serif font (Georgia or similar), 18px, line-height 1.8
- **Headings:** bold sans-serif (Inter — reuse existing), tighter spacing
- **Content width:** max 720px for optimal reading

### Distinct from KB
- KB: glass-morphism, gradient cards, cool blue tones, sans-serif
- Blog: warm cream bg, minimal shadows, serif body, soft accents

---

## Phased Delivery

### Phase 1 — Core (Ship First)
- [x] Blog data loading utility (`src/lib/blog-posts.ts`)
- [x] Blog listing page with mood filter chips
- [x] Blog detail page with warm styling
- [x] Reading time estimate
- [x] Mood/emotion tags (predefined set)
- [x] Bilingual support (en/vi)
- [x] Blog-specific CSS classes
- [x] Nav bar "Blog" tab
- [x] Sample blog posts (1 en, 1 vi)
- [x] SEO metadata

### Phase 2 — Enhancements (Later)
- [ ] Auto-generated Table of Contents
- [ ] Reading progress bar
- [ ] Related posts suggestions
- [ ] Blog posts in unified search
- [ ] RSS feed
- [ ] Blog archive/timeline view

---

## Implementation Considerations

### New Files to Create
- `src/app/[locale]/(personal-blog)/layout.tsx` — blog layout wrapper
- `src/app/[locale]/(personal-blog)/blog/page.tsx` — blog listing
- `src/app/[locale]/(personal-blog)/blog/[slug]/page.tsx` — blog detail
- `src/lib/blog-posts.ts` — blog data loading (similar to posts.ts but for blog/)
- `src/components/ui/BlogCard.tsx` — blog card component
- `src/components/ui/MoodFilter.tsx` — mood tag filter chips
- `src/components/ui/ReadingTime.tsx` — reading time display
- `src/data/blog/en/sample-post.md` — sample blog post
- `src/data/blog/vi/sample-post.md` — sample blog post (vi)
- Blog-specific CSS in `src/styles/globals.css` (additions)

### Files to Modify
- `src/components/ui/HeaderNav.tsx` — add Blog nav link
- `src/messages/en.json` — add Blog i18n keys
- `src/messages/vi.json` — add Blog i18n keys

### Reuse from Existing
- `next-intl` i18n system
- `gray-matter` frontmatter parsing
- `remark` + `remark-gfm` + `remark-html` pipeline
- Tailwind CSS utilities
- `slugify()` function from posts.ts

### Risks
- **Route group migration**: Moving existing KB routes into `(knowledge-base)` group may break URLs if not careful. Mitigation: route groups don't affect URL — `(knowledge-base)/topics` still serves `/topics`.
- **CSS specificity**: Blog warm styles must not leak into KB pages. Mitigation: scope blog CSS with `.blog-layout` wrapper class.
- **Content drift**: Blog and KB data loaders share similar logic. Mitigation: Extract shared utilities but keep loaders separate (DRY but not over-abstracted).

---

## Success Metrics
- Blog pages render correctly in en/vi
- Mood filter works (click mood → filtered posts)
- Reading time displays accurately
- Blog styling visually distinct from KB
- Mobile responsive
- No regression on existing KB features
- Lighthouse performance score >90

## Next Steps
Create detailed implementation plan with phase files → implement Phase 1.
