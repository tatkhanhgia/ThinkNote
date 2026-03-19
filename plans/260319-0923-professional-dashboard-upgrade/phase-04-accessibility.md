---
phase: 04
title: "Accessibility - Contrast, Focus, ARIA"
status: pending
effort: 1h
priority: P1
---

# Phase 04 - Accessibility

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 Audit](./phase-01-audit-analysis.md)
- WCAG 2.1 AA requirements: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+)

## Overview

Ensure all interactive elements meet WCAG AA standards for contrast, keyboard navigation, focus visibility, and screen reader support. This phase targets gaps identified in the audit that are NOT covered by Phase 03's cursor-pointer and emoji fixes.

## Key Insights
- Global `*:focus-visible` (2px solid primary-500) already exists -- good baseline, but insufficient for elements that override outline
- CustomButton uses `focus:outline-none` which removes the native outline AND the global focus-visible rule -- dangerous
- Dropdown menus (SearchBar, LanguageSwitcher) lack keyboard trap and arrow key navigation
- Several text colors fail WCAG AA: `text-gray-400` on white = ~2.7:1 (needs 4.5:1)

## Requirements

### Functional
- All interactive elements reachable and operable via keyboard
- Focus indicator visible on every focusable element (min 2px, 3:1 contrast against adjacent)
- All text meets 4.5:1 contrast ratio (normal) or 3:1 (large bold)
- Screen readers can understand all interactive widgets via ARIA

### Non-Functional
- No JavaScript-heavy focus management unless necessary (prefer CSS)
- No new dependencies

## Related Code Files

### Files to Modify
1. `src/styles/globals.css` - focus-visible refinements
2. `src/components/ui/CustomButton.tsx` - fix focus:outline-none
3. `src/components/ui/SearchBar.tsx` - keyboard nav, aria-live
4. `src/components/ui/LanguageSwitcher.tsx` - keyboard nav, aria-label, roles
5. `src/components/ui/HeaderNav.tsx` - mobile menu focus trap
6. `src/components/ui/KnowledgeCard.tsx` - article aria-label
7. `src/app/[locale]/topics/[topic]/page.tsx` - button aria-labels

## Implementation Steps

### Step 1: Fix CustomButton Focus State

The `focus:outline-none` in `baseStyle` removes the browser's native focus ring AND prevents the global `*:focus-visible` rule from applying (specificity issue with Tailwind's `focus:` being broader than `:focus-visible`).

**Fix**: Replace `focus:outline-none focus:ring-2 focus:ring-opacity-75` with `focus-visible:ring-2 focus-visible:ring-offset-2`:

```tsx
// OLD baseStyle
'font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-300 ease-in-out inline-block text-center'

// NEW baseStyle
'font-semibold py-2 px-6 rounded-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition duration-300 ease-in-out inline-block text-center cursor-pointer'
```

This ensures:
- Mouse clicks don't show a focus ring (`:focus-visible` only fires on keyboard focus)
- Keyboard users see a clear 2px ring with offset
- The `focus:ring-{color}` in each variant also needs the `focus-visible:` prefix

Update each variant's focus class:
```
focus:ring-blue-400   --> focus-visible:ring-blue-400
focus:ring-orange-400 --> focus-visible:ring-orange-400
focus:ring-blue-300   --> focus-visible:ring-blue-300
```

### Step 2: Enhance Global Focus-Visible Style

The existing global rule is good but could be improved for dark backgrounds:

```css
/* Already exists - keep */
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* ADD: ensure focus ring is visible on dark backgrounds (hero, topic detail header) */
.hero-section *:focus-visible,
[class*="bg-gray-900"] *:focus-visible,
[class*="bg-gray-800"] *:focus-visible {
  outline-color: #93C5FD; /* blue-300, visible on dark backgrounds */
}
```

### Step 3: Add Keyboard Navigation to SearchBar Dropdown

Add `onKeyDown` handler to the search input for arrow key navigation through results:

```tsx
const [activeIndex, setActiveIndex] = useState(-1);
const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (!isOpen || results.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
      break;
    case 'Enter':
      if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
        resultRefs.current[activeIndex]?.click();
      }
      break;
    case 'Escape':
      setIsOpen(false);
      setActiveIndex(-1);
      break;
  }
};
```

Apply to the input:
```tsx
<input onKeyDown={handleKeyDown} aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined} role="combobox" aria-expanded={isOpen} aria-controls="search-results-list" ... />
```

Add to results container:
```tsx
<div id="search-results-list" role="listbox">
```

Add to each result:
```tsx
<Link id={`search-result-${index}`} role="option" aria-selected={index === activeIndex} ref={el => { resultRefs.current[index] = el; }} className={`... ${index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`} ... />
```

Add an `aria-live` region for search result count:
```tsx
<div aria-live="polite" className="sr-only">
  {results.length > 0 ? `${results.length} results found` : query ? 'No results found' : ''}
</div>
```

Reset `activeIndex` to -1 when `results` changes:
```tsx
useEffect(() => { setActiveIndex(-1); }, [results]);
```

### Step 4: Add Keyboard Navigation to LanguageSwitcher Dropdown

Similar pattern but simpler (only 2 items):

```tsx
const [activeIndex, setActiveIndex] = useState(-1);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (!isOpen) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
    }
    return;
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, locales.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (activeIndex >= 0) switchLocale(locales[activeIndex].code);
      break;
    case 'Escape':
      setIsOpen(false);
      setActiveIndex(-1);
      break;
  }
};
```

Add ARIA attributes:
```tsx
<button aria-label="Select language" aria-haspopup="listbox" aria-expanded={isOpen} onKeyDown={handleKeyDown} ... />

<div role="listbox" aria-label="Available languages">
  {locales.map((locale, index) => (
    <button role="option" aria-selected={locale.code === currentLocale}
      className={`... ${index === activeIndex ? 'bg-blue-50' : ''}`} ... />
  ))}
</div>
```

### Step 5: Enhance HeaderNav Mobile Focus Trap

The mobile menu already has Escape-to-close. Add a basic focus trap so Tab cycles within the menu when open:

```tsx
const menuContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!mobileOpen) return;

  const menuEl = menuContainerRef.current;
  if (!menuEl) return;

  const focusableEls = menuEl.querySelectorAll<HTMLElement>('a, button');
  if (focusableEls.length === 0) return;

  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  };

  // Auto-focus first item when menu opens
  firstEl.focus();
  menuEl.addEventListener('keydown', trapFocus);
  return () => menuEl.removeEventListener('keydown', trapFocus);
}, [mobileOpen]);
```

Add `ref={menuContainerRef}` to the mobile menu `<div id="mobile-nav-menu">`.

### Step 6: Add ARIA Labels to Topic Detail Buttons

In `src/app/[locale]/topics/[topic]/page.tsx`:

```tsx
// Heart/favorite button
<button aria-label={t('navigation.favorite')} className="...">

// Share button
<button aria-label={t('navigation.share')} className="...">
```

If the i18n keys don't exist yet, add them to `src/messages/en.json` and `src/messages/vi.json`:

```json
// en.json - TopicDetail.navigation
"favorite": "Save to favorites",
"share": "Share this article"

// vi.json - TopicDetail.navigation
"favorite": "Luu vao yeu thich",
"share": "Chia se bai viet nay"
```

### Step 7: Add `aria-label` to KnowledgeCard Article

```tsx
<article aria-label={title} className="modern-card group overflow-hidden h-full flex flex-col cursor-pointer">
```

### Step 8: Contrast Fixes Summary

All text color changes needed (beyond BlogCard gray-400 fix in Phase 03):

| Component | Element | Current | Fix | Ratio After |
|-----------|---------|---------|-----|-------------|
| BlogCard | date/time text | `text-gray-400` | `text-gray-500` | 4.6:1 |
| SearchBar | "results found" count | `text-gray-500` | Keep (4.6:1 OK) | -- |
| SearchBar | result description | `text-gray-500` | Keep (4.6:1 OK) | -- |
| KnowledgeCard | description | `text-gray-600` | Keep (5.4:1 OK) | -- |
| Tags page | tag count in white bg chip | `text-xs` on `bg-white/50` | Verify readable | -- |
| Home page | hero description | `text-gray-200` on dark bg | Keep (high contrast) | -- |
| Topic detail | breadcrumb `text-gray-300` on gray-900 | Verify 4.5:1 | gray-300 on gray-900 = ~7:1 OK | -- |

Only `text-gray-400` on white backgrounds is a confirmed failure. BlogCard fix handles the only instance. All other gray-500+ values pass.

## TODO Checklist

- [ ] Fix CustomButton: replace `focus:outline-none focus:ring-2` with `focus-visible:` variants
- [ ] Add dark-background focus-visible override in `globals.css`
- [ ] Add keyboard navigation (arrow keys, Escape, Enter) to SearchBar dropdown
- [ ] Add `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` to SearchBar input
- [ ] Add `aria-live` region for search result announcements
- [ ] Add keyboard navigation to LanguageSwitcher dropdown
- [ ] Add `aria-label`, `aria-haspopup`, `role="listbox"`, `role="option"` to LanguageSwitcher
- [ ] Add focus trap to HeaderNav mobile menu
- [ ] Auto-focus first menu item when mobile menu opens
- [ ] Add `aria-label` to heart and share buttons on topic detail page
- [ ] Add `aria-label={title}` to KnowledgeCard article element
- [ ] Add i18n keys for "favorite" and "share" in both locale message files
- [ ] Run keyboard-only navigation test on all pages

## Success Criteria

- Tab through every page: all interactive elements receive visible focus
- Arrow keys navigate SearchBar and LanguageSwitcher dropdowns
- Escape closes all dropdowns and mobile menu
- Screen reader announces search result count changes
- No `focus:outline-none` without a corresponding `focus-visible:ring` replacement
- All text passes WCAG AA 4.5:1 contrast on its background

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Focus trap conflicts with header keyboard nav | User gets stuck | Trap only activates when mobile menu is open; Escape always exits |
| `aria-activedescendant` not supported in all screen readers | Reduced usability | Falls back to standard tab navigation |
| Adding many refs to SearchBar results | Performance with many results | Already limited to 6 results max |

## Security Considerations

None. This phase only adds ARIA attributes and keyboard event handlers -- no data flow changes.

## Next Steps

Proceed to [Phase 05 - Polish & Effects](./phase-05-polish-effects.md).
