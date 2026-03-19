---
phase: 02
title: "Style System - Colors, Typography, Spacing"
status: pending
effort: 1.5h
priority: P1
---

# Phase 02 - Style System (Colors, Typography, Spacing)

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 Audit](./phase-01-audit-analysis.md)
- `tailwind.config.ts`
- `src/styles/globals.css`
- `src/app/[locale]/layout.tsx`

## Overview

Establish the foundational design tokens: update CSS custom properties, swap fonts, extend Tailwind config, and ensure the new palette propagates correctly through all base classes.

## Key Insights
- Background (`#F8FAFC`) and text (`#1E293B`) vars already match target -- no changes needed
- Primary hue shifts from sky to blue -- all `--primary-*` vars and `.btn-primary` shadows must update
- Blog section uses its own `--blog-*` scope -- will not be affected by primary color change
- Card gradients (`.gradient-blue`, `.gradient-purple`, etc.) are decorative -- keep as-is, independent of primary

## Requirements

### Functional
- All CSS custom properties align with spec palette
- Fira Sans renders as body font; Fira Code as code font
- CTA orange token available in both CSS vars and Tailwind
- No visual regression in blog section

### Non-Functional
- Google Fonts request loads only needed weights (400,500,600,700 for Fira Sans; 400,500 for Fira Code)
- Font swap: `display=swap` for no FOIT

## Architecture

No structural changes. Pure token/value updates in existing files.

## Related Code Files

### Files to Modify
1. `tailwind.config.ts`
2. `src/styles/globals.css`
3. `src/app/[locale]/layout.tsx`

### Files NOT to Modify
- All component files (handled in Phase 03)
- Blog-specific styles (`.blog-layout`, `.blog-prose`, etc.)

## Implementation Steps

### Step 1: Update `tailwind.config.ts`

Add design tokens to the Tailwind theme `extend` section:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Design system tokens
      primary: {
        50:  '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',  // secondary
        500: '#3B82F6',  // primary
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },
      cta: {
        400: '#FB923C',
        500: '#F97316',  // CTA
        600: '#EA580C',
      },
    },
    fontFamily: {
      sans: ['Fira Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['Fira Code', 'Consolas', 'monospace'],
    },
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
  },
},
```

### Step 2: Update Google Fonts Import in `globals.css`

Replace the existing `@import url(...)` line:

```css
/* OLD */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* NEW */
@import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
```

### Step 3: Update CSS Custom Properties in `globals.css`

Replace `:root` block:

```css
:root {
  /* Primary palette (blue) */
  --primary-50:  #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-400: #60A5FA;
  --primary-500: #3B82F6;
  --primary-600: #2563EB;
  --primary-700: #1D4ED8;
  --primary-900: #1E3A8A;

  /* CTA palette (orange) */
  --cta-400: #FB923C;
  --cta-500: #F97316;
  --cta-600: #EA580C;

  /* Neutrals (unchanged) */
  --gray-50:  #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Accents (kept for card gradients) */
  --accent-purple:  #8b5cf6;
  --accent-emerald: #10b981;
  --accent-rose:    #f43f5e;
  --accent-amber:   #f59e0b;
}
```

### Step 4: Update Body Font Stack in `globals.css`

```css
body {
  font-family: 'Fira Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'rlig' 1, 'calt' 1;
}

code, pre {
  font-family: 'Fira Code', Consolas, monospace;
}
```

### Step 5: Update `.btn-primary` Shadow Color

The `box-shadow` in `.btn-primary` and `.btn-primary:hover` references `rgba(14, 165, 233, ...)` which is sky-500. Update to blue-500:

```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  /* ... */
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);  /* blue-500 */
}

.btn-primary:hover {
  /* ... */
  box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.4);  /* blue-500 */
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
}
```

### Step 6: Add CTA Button Class in `globals.css`

Add after `.btn-secondary:hover`:

```css
/* CTA Button (orange) */
.btn-cta {
  background: linear-gradient(135deg, var(--cta-500) 0%, var(--cta-600) 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(249, 115, 22, 0.4);
  background: linear-gradient(135deg, var(--cta-600) 0%, #C2410C 100%);
}
```

### Step 7: Update `layout.tsx` Font Import

Replace the `Inter` import from `next/font/google`:

```tsx
// OLD
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// NEW
import { Fira_Sans } from 'next/font/google';
const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-sans',
});
```

Update the `<body>` className reference from `${inter.className}` to `${firaSans.className}`.

**Note**: Since we use Next.js font optimization AND the Google Fonts `@import` in CSS, we should keep both. The `next/font` approach handles the body font; the CSS `@import` covers `Fira Code` for code blocks. Alternatively, also import Fira Code via `next/font`:

```tsx
import { Fira_Code } from 'next/font/google';
const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code',
});
```

Then add `${firaCode.variable}` to `<body>` className and reference `font-family: var(--font-fira-code)` in CSS for `code, pre`. This avoids the render-blocking `@import` entirely.

### Step 8: Update `.text-gradient`

```css
.text-gradient {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
  /* rest unchanged */
}
```

Currently uses `var(--primary-600)` which will auto-update since the var value changed. But explicitly using `--primary-500` gives a brighter start point matching the spec.

## TODO Checklist

- [ ] Update `tailwind.config.ts` with color tokens and font families
- [ ] Replace Google Fonts `@import` URL in `globals.css`
- [ ] Update `:root` CSS custom properties
- [ ] Update `body` and `code, pre` font-family declarations
- [ ] Update `.btn-primary` box-shadow rgba values
- [ ] Add `.btn-cta` class for orange CTA buttons
- [ ] Replace `Inter` with `Fira_Sans` in `layout.tsx` (and optionally `Fira_Code`)
- [ ] Remove the CSS `@import` if using `next/font` for both fonts
- [ ] Update `.text-gradient` to use `--primary-500`
- [ ] Visual regression test: verify blog section unaffected
- [ ] Visual regression test: verify hero, cards, nav render correctly with new colors
- [ ] Verify Fira Sans loads without FOIT (check `display=swap`)

## Success Criteria

- All `--primary-*` vars produce blue-500 family hues
- `--cta-*` vars are available and `.btn-cta` class works
- Body text renders in Fira Sans across all pages
- Code blocks render in Fira Code
- Blog section visual appearance unchanged
- No console errors or font loading failures

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fira Sans metric difference from Inter | Text overflow in cards, clipped headings | Test all `line-clamp` and fixed-height containers |
| Double font loading (CSS @import + next/font) | Slower FCP | Remove CSS @import, use next/font for both |
| Blog section color leakage | Blog styling breaks | Blog uses `.blog-layout` scope with own vars; test after changes |

## Next Steps

Proceed to [Phase 03 - Component Improvements](./phase-03-component-improvements.md).
