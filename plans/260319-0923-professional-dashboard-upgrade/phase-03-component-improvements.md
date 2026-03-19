---
phase: 03
title: "Component Improvements - Cards, Buttons, Hover States"
status: pending
effort: 2h
priority: P1
---

# Phase 03 - Component Improvements

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 Audit](./phase-01-audit-analysis.md)
- [Phase 02 Style System](./phase-02-style-system.md)

## Overview

Update all UI components to use the new design tokens, replace emojis with SVG icons, add `cursor-pointer` to clickable elements, align chip/tag colors, and integrate the CTA orange color where appropriate.

## Key Insights
- Emoji-to-SVG replacement is the highest-effort task (categories page has 2 locale-specific icon maps with 13+ entries each)
- DRY opportunity: merge EN/VI category icon/color maps into a single locale-agnostic map keyed by a stable identifier
- `CustomButton` is used minimally -- simplify its variant colors to match design system
- `cursor-pointer` needs to be added to `<Link>` wrappers and button-like elements globally

## Requirements

### Functional
- All emojis in knowledge-base section replaced with inline SVG icons
- All clickable elements show `cursor-pointer`
- Tag/category chips use design-system-aligned colors
- CTA buttons use orange (`btn-cta`) where contextually appropriate (e.g., "Start Exploring" on home page)

### Non-Functional
- No new dependencies (SVG icons are inline, not from icon library)
- Component file sizes stay under 200 lines

## Related Code Files

### Files to Modify
1. `src/components/ui/KnowledgeCard.tsx` - chip colors, read-more button
2. `src/components/ui/CustomButton.tsx` - variant colors to blue/orange
3. `src/components/ui/LanguageSwitcher.tsx` - emoji flags to SVG, cursor-pointer
4. `src/components/ui/BlogCard.tsx` - date text contrast, cursor-pointer
5. `src/components/ui/SearchBar.tsx` - result hover states, cursor-pointer
6. `src/app/[locale]/page.tsx` - emoji to SVG in featured categories, CTA button color
7. `src/app/[locale]/categories/page.tsx` - emoji icon maps to SVG map, DRY merge
8. `src/app/[locale]/tags/page.tsx` - emoji in quick actions to SVG
9. `src/app/[locale]/layout.tsx` - cursor-pointer on logo link
10. `src/app/[locale]/topics/[topic]/page.tsx` - aria-labels on heart/share buttons

## Implementation Steps

### Step 1: Create SVG Icon Map Utility

Create a shared category SVG icon map to replace emoji maps in both `categories/page.tsx` and `tags/page.tsx`. This avoids duplicating SVG markup across files.

**File**: `src/lib/category-icons.tsx` (new file, under 80 lines)

```tsx
import React from 'react';

// SVG icon components for categories (replacing emojis)
// Each returns a 24x24 SVG, accepts className for sizing

const icons: Record<string, React.FC<{ className?: string }>> = {
  code: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  bolt: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  cpu: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  wrench: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  monitor: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  palette: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  cog: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  database: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  cube: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  coffee: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4v4m4-4v4m4-4v4" />
    </svg>
  ),
  book: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  shield: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  puzzle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  folder: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

// Mapping from category name (EN + VI) to icon key
const CATEGORY_ICON_KEY: Record<string, string> = {
  // EN
  'Programming Languages': 'code',
  'DevCore': 'bolt',
  'Development Core': 'bolt',
  'AI': 'cpu',
  'Tool': 'wrench',
  'IDE': 'monitor',
  'Frontend': 'palette',
  'Backend': 'cog',
  'Database': 'database',
  'Frameworks': 'cube',
  'Java': 'coffee',
  'Libraries': 'book',
  'Security': 'shield',
  'Design Patterns': 'puzzle',
  // VI
  'Ngon ngu lap trinh': 'code',
  'Loi phat trien': 'bolt',
  'Tri tue nhan tao': 'cpu',
  'Cong cu': 'wrench',
  'Co so du lieu': 'database',
  'Framework': 'cube',
  'Thu vien': 'book',
  'Bao mat': 'shield',
  'Mau thiet ke': 'puzzle',
};

export function getCategoryIcon(categoryName: string): React.FC<{ className?: string }> {
  const key = CATEGORY_ICON_KEY[categoryName];
  return icons[key] || icons.folder;
}

export default icons;
```

**Note**: Vietnamese keys use ASCII-normalized names. The caller in `categories/page.tsx` should normalize with a simple helper or use the original Vietnamese names. Adjust the map keys to match exact category names from `posts.ts`.

### Step 2: Update `CustomButton.tsx` Variant Colors

Replace purple/pink with blue/orange:

```tsx
case 'primary':
  variantStyle = gradient
    ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400'
    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400';
  break;
case 'secondary':
  variantStyle = gradient
    ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-400'
    : 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400';
  break;
case 'outline':
  variantStyle = 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-300';
  if (gradient) {
    variantStyle = 'bg-transparent border border-blue-500 text-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white focus:ring-blue-400';
  }
  break;
```

Also add `cursor-pointer` to `baseStyle`.

### Step 3: Update KnowledgeCard Chip Colors

Align tag/category chip colors with primary:

```tsx
// Category chips: use primary-100/primary-700 instead of purple
className="... bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 ..."

// Tag chips: keep blue (already matches primary)
// No change needed for tag chips
```

Update the "Read More" button for better contrast:

```tsx
// OLD
className="... bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 ..."

// NEW
className="... bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-800 ..."
```

Since we defined `primary` in Tailwind config, we can use `bg-primary-50` etc. If that feels too coupled, keep `bg-blue-50` (same value).

### Step 4: Replace Emojis in Home Page Featured Categories

In `src/app/[locale]/page.tsx`, replace the 3 featured category emoji spans with inline SVGs:

```tsx
// OLD
<span className="text-2xl">...</span>

// NEW - Programming Languages card
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
</svg>

// NEW - Development Core card
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg>

// NEW - Tools & AI card
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
```

### Step 5: Replace Emojis in Categories Page

In `src/app/[locale]/categories/page.tsx`:

1. Remove `categoryIcons`, `categoryIconsVI` maps entirely
2. Import `getCategoryIcon` from `src/lib/category-icons.tsx`
3. Replace `<div className="text-3xl">{icon}</div>` with:

```tsx
const IconComponent = getCategoryIcon(name);
// ...
<div className="w-8 h-8">
  <IconComponent className="w-8 h-8" />
</div>
```

4. Merge `categoryColors` and `categoryColorsVI` into a single map keyed by a stable slug or keep them but reference from a shared constant.

### Step 6: Replace Emojis in Tags Page Quick Actions

In `src/app/[locale]/tags/page.tsx`, replace the 3 quick action emojis with inline SVGs:

```tsx
// "Browse by Categories" - was clipboard emoji
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
</svg>

// "Search Articles" - was magnifying glass emoji
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>

// "All Topics" - was book emoji
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
```

Also replace the `categoryConfig.icon` references in the tag category headers (same approach as categories page).

### Step 7: Replace Emoji Flags in LanguageSwitcher

Replace emoji flags with SVG flag icons. Simple approach using small inline SVG rectangles with flag colors:

```tsx
const locales = [
  {
    code: 'en',
    name: 'English',
    flag: (
      <svg className="w-5 h-4 rounded-sm" viewBox="0 0 20 16" aria-hidden="true">
        <rect width="20" height="16" fill="#002868"/>
        <rect y="1.23" width="20" height="1.23" fill="white"/>
        <rect y="3.69" width="20" height="1.23" fill="#BF0A30"/>
        {/* simplified US flag stripes */}
      </svg>
    ),
  },
  {
    code: 'vi',
    name: 'Tieng Viet',
    flag: (
      <svg className="w-5 h-4 rounded-sm" viewBox="0 0 20 16" aria-hidden="true">
        <rect width="20" height="16" fill="#DA251D"/>
        <polygon points="10,3 11.2,6.7 15,6.7 11.9,9 12.8,12.7 10,10.3 7.2,12.7 8.1,9 5,6.7 8.8,6.7" fill="#FFFF00"/>
      </svg>
    ),
  },
];
```

Update the flag rendering from `<span className="text-base">{currentLocaleData.flag}</span>` to just `{currentLocaleData.flag}` (it's now JSX, not a string).

### Step 8: Add `cursor-pointer` Globally

Add to these elements:
- `KnowledgeCard.tsx`: Already has `cursor-pointer` on `.modern-card` via article -- OK
- `BlogCard.tsx`: Add `cursor-pointer` to wrapping `<Link>`
- `SearchBar.tsx`: Add `cursor-pointer` to each result `<Link>` in dropdown
- `LanguageSwitcher.tsx`: Add `cursor-pointer` to trigger button and dropdown buttons
- `categories/page.tsx`: Category card `<Link>` elements -- add `cursor-pointer`
- `tags/page.tsx`: Tag card `<Link>` elements -- add `cursor-pointer`
- Home page quick access links -- add `cursor-pointer`

### Step 9: Apply CTA Orange to Strategic Buttons

Replace `btn-primary` with `btn-cta` on these high-impact CTAs:
- Home page "Start Exploring" button in final CTA section
- Home page "Explore Topics" hero button (keep primary blue) vs "Browse Categories" (make CTA orange for differentiation)

Actually, be conservative: only use CTA orange for the single most important action per page. Keep most buttons blue. Use orange for:
- Home page: "Start Exploring" in the bottom CTA section

### Step 10: Update BlogCard Date Text Contrast

```tsx
// OLD
<div className="flex items-center justify-between mb-3 text-sm text-gray-400">

// NEW - gray-500 passes WCAG AA on white (4.6:1)
<div className="flex items-center justify-between mb-3 text-sm text-gray-500">
```

## TODO Checklist

- [ ] Create `src/lib/category-icons.tsx` with SVG icon map
- [ ] Update `CustomButton.tsx` variants to blue/orange, add cursor-pointer
- [ ] Update `KnowledgeCard.tsx` category chip colors to blue-100/blue-700
- [ ] Replace 3 emojis in home page featured categories with SVG
- [ ] Replace emoji icon maps in `categories/page.tsx` with SVG icon map
- [ ] Replace 3 emojis in `tags/page.tsx` quick actions with SVG
- [ ] Replace emoji flags in `LanguageSwitcher.tsx` with SVG flags
- [ ] Add `cursor-pointer` to all clickable Link/button elements listed
- [ ] Apply `btn-cta` to home page "Start Exploring" CTA
- [ ] Fix `BlogCard.tsx` date text from `text-gray-400` to `text-gray-500`
- [ ] Add `aria-label` to heart/share buttons in `topics/[topic]/page.tsx`
- [ ] Verify no emojis remain in knowledge-base section (blog emojis are acceptable)
- [ ] Run `npm run build` to verify no compile errors

## Success Criteria

- Zero emojis in knowledge-base components (home, topics, categories, tags pages)
- All interactive elements show pointer cursor on hover
- CustomButton primary = blue, secondary = orange
- Category chips = blue, Tag chips = blue (consistent)
- BlogCard date text passes WCAG AA contrast
- Build succeeds with no TypeScript errors

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVG icon map file exceeds 200 lines | Violates file size rule | Split into icon-defs + mapping if needed |
| Vietnamese category names have diacritics not matching map keys | Icons show fallback folder | Use exact Vietnamese strings with diacritics as map keys |
| LanguageSwitcher flag SVGs look too simple | Less polished than emojis | Use proper simplified flag SVGs with correct proportions |

## Next Steps

Proceed to [Phase 04 - Accessibility](./phase-04-accessibility.md).
