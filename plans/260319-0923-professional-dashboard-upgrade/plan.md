---
title: "Professional Dashboard Design Upgrade"
description: "Upgrade ThinkNote dashboard to a data-dense, professional design with Fira fonts, new color palette, accessibility, and micro-interactions"
status: completed
priority: P2
effort: 6h
branch: master
tags: [ui, design-system, accessibility, tailwind]
created: 2026-03-19
---

# Professional Dashboard Design Upgrade

## Objective

Transform ThinkNote's current design from a generic knowledge-base look into a **data-dense, professional dashboard** with polished micro-interactions, proper accessibility, and a refined color system. Maintain simplicity and comfort while elevating visual quality.

## Design Spec Summary

| Aspect | Value |
|--------|-------|
| Primary | `#3B82F6` (blue-500) |
| Secondary | `#60A5FA` (blue-400) |
| CTA | `#F97316` (orange-500) |
| Background | `#F8FAFC` (slate-50) |
| Text | `#1E293B` (slate-800) |
| Heading Font | Fira Sans (400, 500, 600, 700) |
| Code Font | Fira Code (400, 500) |
| Transitions | 150-300ms ease |
| Contrast | WCAG AA (4.5:1 min) |

## Key Audit Findings

1. **Color inconsistency**: CSS vars use `--primary-500: #0ea5e9` (sky-500) but spec calls for `#3B82F6` (blue-500). `CustomButton` uses purple/pink gradients unrelated to any design system.
2. **Typography**: Currently uses Inter + JetBrains Mono. Needs switch to Fira Sans + Fira Code per spec.
3. **Emoji usage**: Categories and tags pages use emojis for icons (categories page: 23 emojis). Spec requires SVG icons only.
4. **Missing focus states**: Only global `*:focus-visible` exists. Individual interactive elements lack visible focus rings.
5. **No cursor-pointer**: Most clickable `<Link>` elements lack explicit `cursor-pointer`.
6. **Transition inconsistency**: Some use `0.3s`, others `0.2s`, some `0.25s`. Need standardization to 150-300ms range.
7. **CTA color absent**: No orange CTA color anywhere in the design system.
8. **Hover states incomplete**: Many links/buttons lack hover feedback. `LanguageSwitcher` dropdown items have no keyboard nav.

## Phase Overview

| Phase | File | Status | Effort |
|-------|------|--------|--------|
| 01 - Audit & Analysis | [phase-01](./phase-01-audit-analysis.md) | completed | 0.5h |
| 02 - Style System | [phase-02](./phase-02-style-system.md) | completed | 1.5h |
| 03 - Component Improvements | [phase-03](./phase-03-component-improvements.md) | completed | 2h |
| 04 - Accessibility | [phase-04](./phase-04-accessibility.md) | completed | 1h |
| 05 - Polish & Effects | [phase-05](./phase-05-polish-effects.md) | completed | 1h |

## Files Affected

### Core Style Files
- `tailwind.config.ts` - extend theme with design tokens
- `src/styles/globals.css` - CSS vars, font import, base styles

### Components (modify)
- `src/components/ui/KnowledgeCard.tsx`
- `src/components/ui/CustomButton.tsx`
- `src/components/ui/HeaderNav.tsx`
- `src/components/ui/SearchBar.tsx`
- `src/components/ui/LanguageSwitcher.tsx`
- `src/components/ui/BlogCard.tsx`
- `src/components/ui/MoodFilter.tsx`
- `src/components/ui/PostContent.tsx`
- `src/components/ui/ReadingTime.tsx`
- `src/components/ui/LogoIcon.tsx`

### Pages (modify)
- `src/app/[locale]/page.tsx` - home page
- `src/app/[locale]/layout.tsx` - header/footer
- `src/app/[locale]/topics/page.tsx`
- `src/app/[locale]/topics/[topic]/page.tsx`
- `src/app/[locale]/categories/page.tsx`
- `src/app/[locale]/tags/page.tsx`
- `src/app/[locale]/search/page.tsx`
- `src/app/[locale]/blog/page.tsx`

## Risk Assessment

- **Font swap**: Fira Sans has different metrics than Inter; may affect text overflow / line-clamp. Test all card text carefully.
- **Color shift**: Changing primary from sky-500 to blue-500 affects hero gradients, nav highlights, button shadows. Systematic find-replace required.
- **Emoji removal**: Some emojis on categories page are data-driven from `categoryIcons` maps. Must create SVG icon map replacement.
- **Blog section isolation**: Blog uses separate `--blog-*` vars and `.blog-layout` scope. Changes to global vars should NOT leak into blog section.

## Dependencies

- None (purely frontend, no API changes)
- Google Fonts CDN for Fira Sans + Fira Code
