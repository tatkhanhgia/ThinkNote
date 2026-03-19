---
phase: 05
title: "Polish & Effects - Transitions, Animations, Micro-interactions"
status: pending
effort: 1h
priority: P2
---

# Phase 05 - Polish & Effects

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 Audit](./phase-01-audit-analysis.md)
- Design spec: 150-300ms transitions, hover tooltips, row highlighting, loading spinners

## Overview

Final polish layer: standardize transition timings, add subtle hover tooltips, implement data-loading spinners, refine row/card highlighting on hover, and add tasteful micro-interactions that reinforce the professional feel without being distracting.

## Key Insights
- Existing transitions are already in the 200-300ms range -- minimal changes needed
- The `transition: all` on `.modern-card` is flagged as a perf concern in a code comment but still used. Replace with specific properties.
- No loading states exist for the SearchBar post-fetch or for page transitions
- Hover tooltips requested for tag/category chips (show count or full name on truncated text)

## Requirements

### Functional
- Loading spinner visible while SearchBar fetches posts
- Skeleton loading state for topics grid on slow networks
- Hover tooltip on truncated card titles showing full text
- Row/card highlight effect on hover (subtle background shift)

### Non-Functional
- No layout shift from transitions (use `transform` and `opacity` only for animations)
- All animations respect `prefers-reduced-motion`
- No new JS animation libraries -- CSS only

## Related Code Files

### Files to Modify
1. `src/styles/globals.css` - transition refinements, reduced-motion, spinner
2. `src/components/ui/SearchBar.tsx` - loading state
3. `src/components/ui/KnowledgeCard.tsx` - title tooltip
4. `src/app/[locale]/topics/page.tsx` - loading skeleton (already exists in search, adapt)
5. `src/app/[locale]/categories/page.tsx` - hover highlight refinement

## Implementation Steps

### Step 1: Replace `transition: all` with Specific Properties

In `globals.css`, update `.modern-card`:

```css
/* OLD */
.modern-card {
  /* ... */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* NEW - only animate properties that actually change */
.modern-card {
  /* ... */
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Same for `.btn-primary` and `.btn-secondary` -- replace `transition: all` with explicit properties:

```css
.btn-primary {
  /* ... */
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary {
  /* ... */
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cta {
  /* ... same pattern ... */
}
```

### Step 2: Add `prefers-reduced-motion` Respect

Add to `globals.css`:

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .hero-section::before {
    animation: none;
  }

  .modern-card:hover {
    transform: none;
  }

  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-cta:hover {
    transform: none;
  }
}
```

### Step 3: Add Loading Spinner to SearchBar

Add a loading state while posts are being fetched:

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  setIsLoading(true);
  fetch(`/${locale}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      setAllPosts(posts);
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Error loading posts:', err);
      setIsLoading(false);
    });
}, [locale]);
```

Show spinner inside the search input area when loading:

```tsx
{isLoading && (
  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
    <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
)}
```

Disable search input while loading:

```tsx
<input disabled={isLoading} placeholder={isLoading ? '...' : t('placeholder')} ... />
```

### Step 4: Add CSS Spinner Utility Class

Add to `globals.css` after the existing `.skeleton` class:

```css
/* Spinner Animation */
.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

Note: Tailwind's `animate-spin` already provides this, so this is a fallback for non-Tailwind contexts. Prefer `animate-spin` in components.

### Step 5: Add Title Tooltip to KnowledgeCard

Use the native `title` attribute for truncated card titles -- simple, accessible, no JS:

```tsx
// In KnowledgeCard.tsx, the h3 element
<h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={title}>
  {title}
</h3>
```

Also add to description:

```tsx
<p className="text-gray-600 mb-4 leading-relaxed text-sm flex-1" title={description}>
  {description}
</p>
```

Same pattern for BlogCard:

```tsx
<h2 className="... line-clamp-2" title={title}>{title}</h2>
<p className="... line-clamp-3" title={description}>{description}</p>
```

And for SearchBar results:

```tsx
<h4 className="text-sm font-medium text-gray-900 line-clamp-1" title={post.title}>
  {post.title}
</h4>
```

### Step 6: Enhance Card Hover Highlighting

The `.modern-card:hover` already has `translateY(-4px)` and shadow enhancement. Add a subtle background brightness shift for the card body area:

```css
/* Already exists */
.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

/* ADD: subtle background highlight on hover */
.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 1); /* full opacity from 0.95 */
}
```

This is a very subtle shift from `rgba(255,255,255,0.95)` to `rgba(255,255,255,1)` -- removes the slight transparency on hover, making the card feel "lifted" and more solid.

### Step 7: Add Staggered Entrance Animation Refinement

The current `.animate-in` with `animationDelay` per card is good. Refine the easing:

```css
/* Update existing */
.animate-in {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(16px); /* reduced from 20px for subtlety */
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

The `cubic-bezier(0.16, 1, 0.3, 1)` is an "ease-out-expo" curve -- fast start, gentle end. More professional than the default `ease-out`.

### Step 8: Add Hover Micro-interaction to Navigation Links

The `.nav-link::after` underline animation already exists. Enhance with a color transition on the underline:

```css
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-500);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}
```

Currently only `width` has transition -- `left` change was instant, causing a slight jerk. Adding both makes the underline grow smoothly from center.

Wait -- actually `transform: translateX(-50%)` handles centering, so `left: 50%` is constant. The current implementation is already correct. Keep as-is.

### Step 9: Add Smooth Scroll-to-Top on Page Navigation

Already present via `scroll-smooth` on `<html>`. No change needed.

### Step 10: Add Subtle Border Glow on Card Hover

For the tag and category cards on their respective pages (which already have colored borders), add a subtle glow matching their color on hover:

In `globals.css`:

```css
/* Tag/category card hover glow */
.modern-card[class*="border-blue"]:hover {
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(59, 130, 246, 0.3);
}

.modern-card[class*="border-purple"]:hover {
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(139, 92, 246, 0.3);
}

.modern-card[class*="border-emerald"]:hover {
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(16, 185, 129, 0.3);
}
```

**Alternative simpler approach**: Skip the attribute selectors (brittle) and instead add a CSS variable approach. But this adds complexity. The simpler path: just keep the existing generic `.modern-card:hover` shadow. The colored border already provides visual differentiation. **Recommendation: skip this step to honor YAGNI.**

## TODO Checklist

- [ ] Replace `transition: all` with specific properties on `.modern-card`, `.btn-primary`, `.btn-secondary`
- [ ] Add `.btn-cta` transition with specific properties (from Phase 02)
- [ ] Add `prefers-reduced-motion` media query to disable animations
- [ ] Add loading state + spinner to SearchBar during post fetch
- [ ] Add `title` attribute to truncated text in KnowledgeCard, BlogCard, SearchBar results
- [ ] Update `.modern-card:hover` background to full opacity
- [ ] Refine `.animate-in` with expo easing and reduced translateY
- [ ] Verify all transitions are 150-300ms range (audit confirmed -- just verify after changes)
- [ ] Test with `prefers-reduced-motion: reduce` in browser devtools
- [ ] Visual check: no layout shift during card hover animations
- [ ] Visual check: spinner appears and disappears correctly in SearchBar

## Success Criteria

- `transition: all` eliminated from all CSS classes (replaced with specific properties)
- `prefers-reduced-motion` disables all non-essential animations
- SearchBar shows spinner during initial data load
- Truncated text shows full content on hover via native tooltip
- Card hover feels smooth and professional (no jank, no layout shift)
- All transitions between 150-300ms

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `prefers-reduced-motion` blanket rule breaks essential state transitions | UI feels broken for motion-sensitive users | Only suppress transform/animation; keep opacity and color transitions |
| SearchBar loading spinner flashes on fast connections | Distracting | Only show spinner if loading takes >200ms (optional debounce) |
| `title` attribute tooltips look OS-native, not styled | Inconsistent with design | Acceptable trade-off; custom tooltips add JS complexity for minimal gain (YAGNI) |

## Security Considerations

None. Pure CSS and minor state additions.

## Next Steps

After this phase:
1. Run `npm run build` to verify no errors
2. Run `npm run lint` to check for lint issues
3. Manual visual regression test on all pages
4. Keyboard navigation test (Tab, Arrow, Escape, Enter)
5. Browser devtools Lighthouse audit for accessibility score
