# Code Review: UI/UX Fixes — HeaderNav, globals.css, layout.tsx

**Date:** 2026-03-17
**Reviewer:** code-reviewer
**Score: 7.5 / 10**

---

## Scope

| File | LOC Changed | Type |
|---|---|---|
| `src/styles/globals.css` | ~115 added, ~10 removed | CSS fixes + Mermaid section |
| `src/components/ui/HeaderNav.tsx` | 91 | New client component |
| `src/app/[locale]/layout.tsx` | -45 / +12 net | Refactor (SVG dedupe, nav extraction) |

---

## Overall Assessment

The refactor achieves its stated goals cleanly. Removing `* { transition: all }` is a meaningful perf fix. The `HeaderNav` component is well-scoped and readable. Two actionable issues need attention: a z-index gap on mobile that can cause click-through in edge cases, and a WCAG contrast failure on the amber gradient light-end when overlaid with white text.

---

## Critical Issues

None. No security vulnerabilities, data loss risks, or breaking changes introduced.

---

## High Priority

### 1. Amber Gradient — White Text Fails WCAG AA on Light End

**File:** `src/styles/globals.css` line 122-124, `src/components/ui/KnowledgeCard.tsx` line 80

**Problem:**
`gradient-amber` now runs from `#b45309` (amber-700, contrast ~4.77:1 on white) to `#f59e0b` (amber-400). `KnowledgeCard` renders `text-white` directly over the gradient header. At the `#f59e0b` end, white-on-amber contrast is approximately **2.32:1** — well below the WCAG AA threshold of 4.5:1 for normal text and 3:1 for large text.

The comment in CSS says "pass WCAG AA" but this only applies to the dark start colour, not the gradient as a whole. The title (`text-xl font-bold`) qualifies as large text (18pt bold threshold is close) so 3:1 is the bar — still fails at the amber end.

**Fix:**
Either reverse the gradient direction so the darker colour is where text lands, or end at a darker amber:

```css
/* Option A: flip so dark end is top-left where text renders */
.gradient-amber {
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
}

/* Option B: keep direction, darken the light end */
.gradient-amber {
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
}
/* #d97706 (amber-600) white contrast ≈ 3.47:1 — passes AA for large text */
```

---

### 2. Mobile Dropdown z-index vs Header z-index

**File:** `src/components/ui/HeaderNav.tsx` line 67

**Problem:**
The mobile dropdown uses `z-40` while the sticky header uses `z-50`. The dropdown is `fixed` and positions itself at `top-16`, so it renders visually below the header. This is intentional. However, if any modal, sheet, or popover from `LanguageSwitcher` or `ImportMarkdownButton` (rendered at header level, z-50) expands downward, its interaction area will sit above the mobile dropdown (`z-40 < z-50`). The `Toaster` at `position="top-right"` is `z-50` by default in Sonner and will overlap the dropdown in the top-right corner on narrow screens.

**Fix:** Raise mobile dropdown to `z-50` (matching header) or `z-[51]` (above header siblings):

```tsx
<div className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-50">
```

---

## Medium Priority

### 3. Mobile Menu Has No Keyboard Close (Escape Key)

**File:** `src/components/ui/HeaderNav.tsx`

**Problem:**
`aria-expanded` is set correctly on the toggle button, but there is no `keydown` listener to close the menu on `Escape`. WCAG 2.1 SC 1.3.1 and APG disclosure pattern require that `Escape` closes an open disclosure menu and returns focus to the trigger.

Additionally, there is no `aria-controls` linking the button to the dropdown region, and the dropdown `<nav>` has no `id` to reference.

**Recommended additions:**

```tsx
// In the button:
aria-controls="mobile-nav"

// In the dropdown div:
id="mobile-nav"

// useEffect for Escape key:
useEffect(() => {
  if (!mobileOpen) return;
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [mobileOpen]);
```

---

### 4. `isActive` Uses `pathname.startsWith` — Will False-Match Future Routes

**File:** `src/components/ui/HeaderNav.tsx` line 27

**Problem:**
`pathname.startsWith('/en/topics')` works correctly today because no other route begins with `/en/topics` except topic detail pages. This is fine. However, `/en/categories` would false-match a hypothetical `/en/categoriesSomethingElse`. The pattern is borderline — acceptable for the current route set but fragile.

**Recommended hardening:**
Ensure the prefix ends with `/` to prevent false substring matches:

```ts
return pathname === href || pathname.startsWith(href + '/');
```

---

### 5. `Toaster` Placed Outside `<header>` but Inside `<NextIntlClientProvider>` — Indentation Drift

**File:** `src/app/[locale]/layout.tsx` lines 46-49

**Problem:**
The `<Toaster>` is a sibling to `<header>` but the surrounding indentation treats it as a child of `<NextIntlClientProvider>`. The `<header>` open tag at line 49 is indented one level deeper than `<Toaster>`, creating visual confusion. This is cosmetic but caused the JSX structure to be harder to read at a glance.

```tsx
// Current (indentation inconsistency):
<NextIntlClientProvider messages={messages}>
  <Toaster richColors position="top-right" />
    {/* Modern Header */}
    <header className="...">
    <div ...>  {/* ← this is actually inside header but looks like sibling */}

// Fix: consistent indentation
<NextIntlClientProvider messages={messages}>
  <Toaster richColors position="top-right" />
  <header className="...">
    <div ...>
```

---

## Low Priority

### 6. `modern-card` Has a Duplicate Hover Transform

**File:** `src/styles/globals.css` line 94 and `src/components/ui/KnowledgeCard.tsx` line 75

**Problem:**
`modern-card:hover` in CSS defines `transform: translateY(-4px)`. `KnowledgeCard` also has Tailwind `hover:-translate-y-1` (= 4px) directly on the same element. The CSS rule and the Tailwind utility both fire on hover — they are additive and result in `-8px` total lift, reproducing the original excessive movement. This may be unintentional since the stated goal was to reduce hover movement.

**Fix:** Remove one of the two. Since `KnowledgeCard` owns the element, remove the CSS rule or consolidate:

```css
/* globals.css — remove transform from .modern-card:hover */
.modern-card:hover {
  box-shadow:
    0 20px 40px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  /* transform removed; Tailwind hover:-translate-y-1 on element is sufficient */
}
```

---

### 7. `.nav-link-active::after` Inherits No Transition

**File:** `src/styles/globals.css` lines 200-202

**Problem:**
`.nav-link:hover::after` animates `width` via `transition: all 0.3s ease` defined on `.nav-link::after`. The `.nav-link-active::after { width: 100% }` rule sets the indicator to full-width immediately without animation on page load, which is fine. However, when navigating between active routes, there may be a flash. This is minor and likely acceptable.

---

### 8. Mermaid CSS Block in `globals.css` is Unrelated to This PR

**File:** `src/styles/globals.css` lines 502-594

A 92-line Mermaid diagram styling block was added in this diff. It has no relation to the stated UI/UX fixes (HeaderNav, glass, amber, scale). It inflates `globals.css` beyond its 200-line guideline significantly. Should be split into a `mermaid.css` or scoped to the PostContent/article route.

---

## Edge Cases Found by Scout

- `pathname.startsWith('/en/topics')` on `/en/topics-archive` (hypothetical) — addressed in issue 4
- `Escape` key not handled for mobile menu — addressed in issue 3
- Mobile menu `z-40` occlusion by Sonner toaster `z-50` — addressed in issue 2
- Amber gradient white text at `#f59e0b` — addressed in issue 1
- `hover:-translate-y-1` + `.modern-card:hover transform` additive — addressed in issue 6

---

## Positive Observations

- Removing `* { transition: all 0.2s }` is the right call. It was triggering layout recalculation on every interactive element and causing jank on `width`, `height`, and `border` transitions. The comment explaining why is appreciated.
- `isActive` home-route logic (`pathname === exactHome || pathname === exactHome + '/'`) correctly handles the trailing-slash edge case.
- `<LogoIcon>` extraction eliminates two identical 16-line SVG blocks — clean DRY improvement.
- Mobile menu closes on link click (`onClick={() => setMobileOpen(false)}`) — correct and prevents ghost-open state after navigation.
- `aria-expanded` and `aria-label` on the hamburger button are present — good baseline accessibility.
- `.glass` opacity bump from `0.1` to `0.85` makes the sticky header actually readable over content — this was a real visual bug fix.
- `.modern-card:hover` scale removal is correct — `scale(1.02)` on hover causes layout shift and is a well-known UX anti-pattern for lists of cards.

---

## Recommended Actions (Prioritised)

1. **Fix amber gradient contrast** — use `#d97706` as the light end or flip direction (WCAG AA for white text)
2. **Raise mobile dropdown to `z-50`** — prevents Sonner toast overlap on narrow viewports
3. **Add Escape key handler + `aria-controls`** to `HeaderNav` mobile menu
4. **Harden `isActive` prefix check** to `href + '/'` to prevent future substring false-positives
5. **Resolve duplicate hover transform** on `KnowledgeCard` / `.modern-card:hover`
6. **Fix indentation drift** in `layout.tsx` around `<Toaster>` and `<header>`
7. **Move Mermaid CSS** out of `globals.css` to keep file manageable

---

## Metrics

| Metric | Value |
|---|---|
| Lint errors | 0 (ESLint clean for changed files) |
| Lint warnings | 3 (pre-existing, unrelated `useCallback` deps in `MarkdownImporter`) |
| TypeScript errors | 0 in changed files (pre-existing test file errors unrelated) |
| Accessibility gaps | 2 (Escape key, `aria-controls`) |
| WCAG failures | 1 (amber gradient white text) |

---

## Unresolved Questions

- Is `gradient-amber` used anywhere other than `KnowledgeCard` (Database/Java categories)? If a dark background text is ever placed over it, the dark end (#b45309) is fine, but white text at the light end needs fixing.
- The `Mermaid` CSS block — is there an existing PostContent component that should own this scoping, or is the global approach intentional?
- Should `/en/tags` and `/en/search` pages get active nav highlights? Currently no nav item activates for those routes.
