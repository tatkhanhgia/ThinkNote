# Phase 2: High-Impact UX Improvements

**Priority:** High
**Effort:** ~5.5 hours
**Dependencies:** Phase 1 complete

## Context

- [Audit Report](../reports/uiux-audit-260321-2350-thinknote-comprehensive-audit.md)
- [Plan Overview](./plan.md)

## Items (6)

### 2.1 Add Search Input to Search Page (1 hr)
**File:** `src/app/[locale]/search/page.tsx`
**Issue:** Search page has no visible search input in content area — relies on tiny header bar only.

**Steps:**
1. Add prominent search input below the gradient header
2. Pre-populate with query param if present
3. Change title: "Search" when no query, "Search Results" when showing results
4. Reduce empty state whitespace — tighten layout
5. Show popular tags or recent articles in empty state to guide users

**Related files:** `src/components/ui/SearchBar.tsx`

### 2.2 Link Category Cards to Specific Categories (30 min)
**File:** `src/app/[locale]/page.tsx:96-119`
**Issue:** All 3 featured category cards on homepage link to generic `/categories` instead of specific ones.

**Steps:**
1. Change "Programming Languages" card: `href={/${locale}/categories/programming-languages}`
2. Change "Development Core" card: `href={/${locale}/categories/development-core}`
3. Change "Tools & AI" card: `href={/${locale}/categories/tool}` (verify slug)
4. Verify slugs match actual category slugs from `getAllCategoriesWithSlug()`

### 2.3 Implement or Remove Like/Share Buttons (30 min)
**File:** `src/app/[locale]/topics/[topic]/page.tsx`
**Issue:** Buttons exist with `aria-label` but no click handlers. Misleading affordance.

**Recommendation:** Remove them for now (YAGNI). If implementing:
- Share: use `navigator.share()` API with fallback to clipboard copy
- Like: needs backend storage, skip for static site

**Steps (remove approach):**
1. Find Like/Share button JSX
2. Remove buttons entirely
3. Or: implement simple Share via Web Share API (client component wrapper)

### 2.4 Add Category Filter to Topics Page (2 hr)
**File:** `src/app/[locale]/topics/page.tsx`
**Issue:** No way to filter articles by category on topics listing.

**Steps:**
1. Extract unique categories from all posts
2. Add filter pills/tabs above the grid (similar to blog mood filter pattern)
3. Use client-side filtering with URL search params for state
4. "All" tab selected by default
5. Show count per category in filter pills
6. Ensure filter state persists in URL for shareability

**Related files:** `src/components/ui/MoodFilter.tsx` (reusable pattern)

### 2.5 Fix Breadcrumb Truncation on Mobile (20 min)
**File:** `src/app/[locale]/topics/[topic]/page.tsx`
**Issue:** Breadcrumb shows full article title — overflows on mobile.

**Steps:**
1. Add `max-w-[200px] truncate` to the breadcrumb title span on mobile
2. Or use `line-clamp-1` with `overflow-hidden text-ellipsis`
3. Keep full title visible on desktop (md breakpoint)

### 2.6 Make Categories "Explore" Visible on Mobile (20 min)
**File:** `src/app/[locale]/categories/page.tsx`
**Issue:** `opacity-0 group-hover:opacity-100` — never triggers on touch devices.

**Steps:**
1. Find the "Explore" arrow/text element
2. Change to: `opacity-100 md:opacity-0 md:group-hover:opacity-100`
3. Or: always show a subtle arrow icon, animate on hover for desktop
4. Ensure touch targets are adequate (min 44x44px)

## Success Criteria

- [x] Search page has prominent search input in content area
- [x] Empty search state shows popular tags or recent articles
- [x] Category cards link to specific category detail pages
- [x] Like/Share buttons either work or are removed
- [x] Topics page has category filter tabs
- [x] Breadcrumb truncates on mobile
- [x] Categories "Explore" visible on touch devices
