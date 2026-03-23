# Phase 4: Polish & Design System

**Priority:** Low
**Effort:** ~3.5 hours
**Dependencies:** Phase 3 complete

## Context

- [Audit Report](../reports/uiux-audit-260321-2350-thinknote-comprehensive-audit.md)
- [Plan Overview](./plan.md)

## Items (8)

### 4.1 Replace "24/7" Stat with Meaningful Metric (10 min)
**File:** `src/app/[locale]/page.tsx:76-78`
**Issue:** "24/7 Always Learning" is filler content, not a real metric.

**Steps:**
1. Replace with computed unique language/framework count from tags
2. Or use total tag count: `{tags.length}+ Topics`
3. Update i18n key in `messages/en.json` and `messages/vi.json`

### 4.2 Soften Mermaid Diagram Borders (10 min)
**File:** `src/styles/globals.css`
**Issue:** `border: 2px solid #000000` is harsh. Doesn't match card aesthetic.

**Steps:**
1. Find Mermaid CSS rules (`.mermaid` or `[data-mermaid]`)
2. Change border to `border-color: var(--gray-300)` or `#cbd5e1`
3. Consider `border-radius: 8px` to match `modern-card` rounding

### 4.3 Reduce Tag Hover Scale (10 min)
**File:** Tags page or `src/styles/globals.css`
**Issue:** `hover:scale-105` on small list items feels excessive.

**Steps:**
1. Find tag card hover classes
2. Replace `hover:scale-105` with `hover:scale-[1.02]`
3. Or use `hover:bg-gray-50` color change instead of scale

### 4.4 Fix Search Input Transition Performance (5 min)
**File:** `src/styles/globals.css:565`
**Issue:** `transition: all 0.2s ease` triggers unnecessary property transitions.

**Steps:**
1. Find `.search-input` transition rule
2. Replace `transition: all 0.2s ease` with `transition: border-color 0.2s ease, box-shadow 0.2s ease`

### 4.5 Move Blog Hardcoded Strings to i18n (20 min)
**File:** `src/app/[locale]/blog/page.tsx`
**Issue:** `'Back to home'`, `'Về trang chủ'` hardcoded instead of using translations.

**Steps:**
1. Add blog keys to `messages/en.json`: `BlogPage.backToHome`, `BlogPage.title`, `BlogPage.subtitle`
2. Add Vietnamese equivalents to `messages/vi.json`
3. Replace hardcoded strings with `t('key')` calls
4. Verify both locales render correctly

### 4.6 Add will-change to Card Hover Animations (10 min)
**File:** `src/styles/globals.css`
**Issue:** `hover:scale-105` triggers layout repaints without GPU hint.

**Steps:**
1. Add to `.modern-card` or card base class:
   ```css
   .modern-card {
     will-change: transform;
   }
   ```
2. Or scope to hover only to avoid persistent GPU layer:
   ```css
   .modern-card:hover {
     will-change: transform;
   }
   ```

### 4.7 Extract Shared PageHeader Component (1.5 hr)
**Files:** All page.tsx files that use gradient header + stats pill pattern
**Issue:** Each page rebuilds the same header pattern. DRY violation.

**Steps:**
1. Create `src/components/ui/PageHeader.tsx`
2. Props: `title`, `description`, `stats?: {label: string, value: number}[]`, `gradient?: string`
3. Include the gradient background, centered text, stats pill
4. Refactor topics, categories, tags, search pages to use it
5. Keep page-specific content as children/slots

**Example:**
```tsx
<PageHeader
  title={t('title')}
  description={t('description')}
  stats={[
    { label: t('stats.categories'), value: categories.length },
    { label: t('stats.articles'), value: totalArticles },
  ]}
/>
```

### 4.8 Add aria-hidden to Decorative SVGs (10 min)
**File:** `src/app/[locale]/page.tsx`
**Issue:** Some hero section decorative SVGs missing `aria-hidden="true"`.

**Steps:**
1. Find all `<svg>` elements in homepage hero section
2. Add `aria-hidden="true"` to decorative ones (icons inside buttons already have it)
3. Verify no semantic SVGs are accidentally hidden

## Success Criteria

- [x] All stats are real computed values
- [x] Mermaid borders match design system
- [x] Tag hover feels subtle, not jumpy
- [x] No `transition: all` in CSS
- [x] Blog has zero hardcoded locale strings
- [x] Card hover uses GPU compositing hints
- [x] PageHeader component reused across 4+ pages
- [x] All decorative SVGs have `aria-hidden="true"`
