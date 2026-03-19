---
phase: 01
title: "Audit & Analysis"
status: pending
effort: 0.5h
priority: P1
---

# Phase 01 - Audit & Analysis

## Context Links
- [Plan Overview](./plan.md)
- [globals.css](../../src/styles/globals.css)
- [tailwind.config.ts](../../tailwind.config.ts)
- [KnowledgeCard](../../src/components/ui/KnowledgeCard.tsx)
- [CustomButton](../../src/components/ui/CustomButton.tsx)

## Overview

Complete audit of current design state vs target spec. This phase produces findings only; no code changes.

## Audit Results

### 1. Color System Gaps

| Token | Current | Target | Delta |
|-------|---------|--------|-------|
| `--primary-500` | `#0ea5e9` (sky-500) | `#3B82F6` (blue-500) | Different hue |
| `--primary-600` | `#0284c7` (sky-600) | `#2563EB` (blue-600) | Different hue |
| `--primary-700` | `#0369a1` (sky-700) | `#1D4ED8` (blue-700) | Different hue |
| CTA color | none | `#F97316` (orange-500) | Missing entirely |
| Secondary | none | `#60A5FA` (blue-400) | Missing token |
| Background | `#f8fafc` (gray-50 var) | `#F8FAFC` | Already correct |
| Text primary | `#1e293b` (gray-800 var) | `#1E293B` | Already correct |

**Accent colors** (`--accent-purple`, `--accent-emerald`, etc.) are defined but rarely used. Keep for card gradients.

### 2. Typography Gaps

| Element | Current | Target |
|---------|---------|--------|
| Body font | `Inter` | `Fira Sans` |
| Code font | `JetBrains Mono, Fira Code` | `Fira Code` (primary) |
| Google Fonts import | Inter + JetBrains Mono | Fira Sans + Fira Code |
| Font weights loaded | 300-700 (Inter), 400-500 (JBM) | 400,500,600,700 (Fira Sans), 400,500 (Fira Code) |

### 3. Component-by-Component Findings

#### KnowledgeCard.tsx (162 lines)
- **Good**: Uses `cursor-pointer` via `.modern-card`, SVG icons for categories/tags labels, `transition-colors` on chips
- **Issues**:
  - `transition-all` on `.modern-card` in CSS is broad (perf concern noted in comment but still used)
  - Tag/category chips use hardcoded `purple-100/purple-700` and `blue-100/blue-700` -- not aligned with design system
  - "Read More" button uses `bg-gray-50` which is low contrast for the text `text-gray-700`
  - No `aria-label` on article element
  - Gradient header `div` lacks semantic meaning

#### CustomButton.tsx (74 lines)
- **Issues**:
  - Uses `purple` and `pink` as primary/secondary colors -- completely off from blue/orange spec
  - `focus:ring-2 focus:ring-opacity-75` but `focus:outline-none` removes native outline without guaranteed replacement
  - No `cursor-pointer` class (relies on browser default for buttons, but `<a>` variant may not get it)
  - `transition duration-300` is fine (within 150-300ms spec range)

#### HeaderNav.tsx (107 lines)
- **Good**: Has `aria-label`, `aria-expanded`, `aria-controls`, Escape key handler
- **Issues**:
  - Mobile menu items lack focus trap (user can tab out of open menu)
  - No `cursor-pointer` on mobile links (they're `<Link>`)
  - Desktop nav uses `.nav-link` custom class -- transition timing is `0.2s` (acceptable at 200ms)

#### SearchBar.tsx (215 lines)
- **Good**: SVG icon, dropdown with `z-50`, outside click handler
- **Issues**:
  - No keyboard navigation within dropdown results (no `onKeyDown` handler for arrow keys)
  - Search input uses `focus:ring-blue-500` -- should be `focus:ring-[#3B82F6]` or Tailwind `blue-500` (happens to match)
  - Results dropdown has `hover:bg-gray-50` but no focus-visible state for keyboard users
  - No `aria-live` region for result count announcements
  - No loading state while fetching posts

#### LanguageSwitcher.tsx (90 lines)
- **Issues**:
  - Uses emoji flags (`flag: '...'`) -- spec says no emojis, use SVG icons
  - No keyboard navigation in dropdown (no arrow key support)
  - No `aria-label` on the trigger button
  - No `role="listbox"` or `role="option"` on dropdown items
  - Dropdown toggle chevron animation works but `transition-transform` has no explicit duration

#### BlogCard.tsx (74 lines)
- **Issues**:
  - Uses emoji via `moodData.icon` -- but this is blog-scoped, may be acceptable
  - `text-gray-400` for date/time may fail WCAG AA on white background (contrast ~2.7:1)
  - Missing `cursor-pointer` on wrapping Link

#### MoodFilter.tsx (56 lines)
- **Good**: Has `role="group"`, `aria-label`, `aria-pressed`
- **Issues**: Uses emoji icons from BLOG_MOODS -- blog-scoped, lower priority

#### PostContent.tsx (151 lines)
- **Good**: Uses `prose` class with good typography
- **Issues**: Mermaid `fontFamily: 'inherit'` will change when we switch to Fira Sans (acceptable)

#### ReadingTime.tsx (23 lines)
- **Good**: Uses SVG icon, `aria-hidden` on decorative SVG
- **Issues**: None significant

#### LogoIcon.tsx (31 lines)
- **Good**: Pure SVG, accessible via `className` pass-through
- **Issues**: None significant

### 4. Page-Level Findings

#### Home Page (`[locale]/page.tsx`)
- Featured category cards use emoji spans (`'...'`, `'...'`, `'...'`) -- must replace with SVG
- Quick stats section uses inline color classes (`text-blue-600`, `text-purple-600`) -- should use design tokens
- Quick Access links have `transition-colors` but no explicit duration
- CTA section uses `bg-gradient-to-r from-blue-600 to-purple-600` -- should align to new primary

#### Categories Page (`[locale]/categories/page.tsx`)
- `categoryIcons` and `categoryIconsVI` maps contain 13+ emojis each -- all must become SVG
- Duplicated locale-specific maps (EN + VI) for icons and colors -- DRY violation
- Cards use `hover:scale-105` which can cause layout shift on mobile

#### Tags Page (`[locale]/tags/page.tsx`)
- Quick action links use emojis ('...', '...', '...')
- Same DRY violation: separate EN/VI category mappings with duplicate color/icon data

#### Topics Detail Page (`[locale]/topics/[topic]/page.tsx`)
- Heart and Share buttons have no `aria-label`
- Buttons are non-functional (no onClick handlers) -- out of scope for this design upgrade but should add aria-labels

### 5. Transition Audit

| Location | Current Duration | Target |
|----------|-----------------|--------|
| `.modern-card` | `0.3s` | `250ms` (keep, within range) |
| `.btn-primary` | `0.3s` | `250ms` (keep) |
| `.btn-secondary` | `0.3s` | `250ms` (keep) |
| `.nav-link` | `0.2s` | `200ms` (keep) |
| `.blog-card` | `0.25s` | `250ms` (keep) |
| Tag/category chips | `transition-colors` (default 150ms) | Fine |
| KnowledgeCard read-more | `duration-200` | Fine |

All transitions are within acceptable 150-300ms range. No changes needed.

## Success Criteria

- [x] Complete mapping of every design gap documented
- [x] Every component reviewed for a11y, color, font, icon issues
- [x] Risk items identified for downstream phases
- [x] Clear TODO list for phases 02-05

## Next Steps

Proceed to [Phase 02 - Style System](./phase-02-style-system.md) to implement the foundational design token changes.
