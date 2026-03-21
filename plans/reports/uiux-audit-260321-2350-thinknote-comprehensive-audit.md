# ThinkNote Comprehensive UI/UX Audit Report

**Date:** 2026-03-22
**Auditor:** UI/UX Designer Agent
**Site:** http://localhost:3006
**Stack:** Next.js 14, Tailwind CSS, next-intl (EN/VI)

---

## 1. Executive Summary

### Top 5 Critical Findings

1. **Duplicate Font Loading (Performance)** -- Fonts loaded TWICE: `@import url()` in CSS AND `next/font/google` in layout.tsx. The CSS `@import` blocks rendering and bypasses Next.js font optimization. The `next/font` import does NOT include Vietnamese subset, breaking i18n promise.

2. **Hardcoded Statistics are Misleading** -- Homepage shows "50+ articles, 10+ categories, 25+ technologies" but topics page dynamically counts only 16 articles and 14 categories. Mismatch erodes trust.

3. **Inconsistent Design Language Between Blog and KB** -- Blog page uses a completely different visual system (cream bg, terracotta accents, Georgia serif) that clashes with the main KB's blue/glass aesthetic. Feels like two different products.

4. **Categories Page CTA Links are Non-Localized** -- `href="/topics"` and `href="/tags"` in categories/page.tsx are missing the `/${locale}/` prefix, causing 404s or wrong locale routing.

5. **Topics Page Animation Delay Compounds on Large Lists** -- Each card gets `index * 100ms` delay. With 16 cards, the last card appears after 1.6s. At 50+ articles, the last card would wait 5+ seconds. Poor perceived performance.

---

## 2. Page-by-Page Analysis

### 2.1 Homepage (`/en`)

**Visual Assessment (Desktop):**
- Hero section has a polished dark gradient with radial highlights -- good depth
- Clean stat pills with color-coded numbers
- Featured categories use consistent card pattern with gradient icons
- CTA section (blue-to-purple) with orange button creates visual hierarchy

**Visual Assessment (Mobile):**
- Hero text wraps well; "Knowledge Universe" gradient text readable
- CTA buttons stack vertically correctly
- Stats grid collapses to 2x2 -- appropriate
- Category cards stack to single column with adequate spacing

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| H1 | Hardcoded stats | High | "50+", "10+", "25+", "24/7" are hardcoded JSX, not computed from data |
| H2 | Hero search bar redundant | Medium | Search bar in hero + search bar in header (desktop) = two visible search bars. Confusing. |
| H3 | All 3 category cards link to same URL | Medium | All three featured category cards link to `/${locale}/categories` instead of specific categories (e.g., `/categories/programming-languages`) |
| H4 | "24/7 Always Learning" stat misleading | Low | Not a real metric; filler content weakens data credibility |
| H5 | Quick Access section lacks visual weight | Low | Flat white pills with gray borders blend into background; easily missed |
| H6 | No above-fold indication of content depth | Low | User must scroll past hero+stats to see actual content |

**Recommendations:**
- Compute stats dynamically from `getSortedPostsData()`
- Remove hero search bar OR hide header search on homepage
- Link category cards to specific category detail pages
- Replace "24/7" with real metric (e.g., "5+ Languages")

---

### 2.2 Topics Page (`/en/topics`)

**Visual Assessment (Desktop):**
- Clean header with stats pill component (reused pattern -- good)
- 3-column grid of KnowledgeCards with gradient headers
- Good color variety across cards (blue, purple, emerald, rose, amber)
- CTA footer section provides navigation options

**Visual Assessment (Mobile):**
- Cards stack to single column with good spacing
- Category filter pills visible at top but very small
- Card gradient headers maintain readability
- Tags inside cards wrap correctly

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| T1 | Animation delay scales linearly | High | `animationDelay: index * 100ms` -- with 16 cards the last one appears after 1.6s. Scales terribly. |
| T2 | No filtering/sorting controls | Medium | Topics page shows all articles with no way to filter by category, sort by date, or paginate |
| T3 | Card descriptions truncate inconsistently | Medium | Some cards have 1-line descriptions, others 3-line. No `line-clamp` on description in KnowledgeCard (only has `title` attribute but no clamping class) |
| T4 | KnowledgeCard has `cursor-pointer` on article but Link is inside | Low | The article wrapper has `cursor-pointer` but clicking anywhere except the explicit links/buttons inside does nothing. Misleading affordance. |
| T5 | Tags and categories inside cards are clickable links | Low | Clicking a tag/category navigates away from the topics page. This is useful but unexpected inside a card that itself appears to be a link. |

**Recommendations:**
- Cap animation delay at 300-500ms max: `Math.min(index * 100, 500)`
- Add client-side category filter tabs above the grid
- Add `line-clamp-2` to card description paragraph
- Make entire card a clickable link rather than embedding multiple links inside

---

### 2.3 Categories Page (`/en/categories`)

**Visual Assessment (Desktop):**
- Well-structured 3-column grid with color-coded cards
- Each card shows category icon, name, article count, and sample article titles
- "Explore" text only appears on hover -- good progressive disclosure
- Stats pill at top (14 categories, 16 articles)

**Visual Assessment (Mobile):**
- Cards stack single-column cleanly
- Category icons render alongside titles correctly
- Sample article titles truncated with `line-clamp-1`
- Adequate touch targets on cards

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| C1 | CTA links missing locale prefix | **Critical** | `href="/topics"` and `href="/tags"` will route to non-localized URLs. Should be `/${locale}/topics` |
| C2 | "Development Core" shows 11 articles, AI shows 2 | Medium | Unbalanced distribution. Consider grouping or sub-categorizing Development Core |
| C3 | System Design, Web Performance, Design Patterns each have 1 article | Low | Very sparse categories. Consider merging under "Architecture & Design" |
| C4 | "Explore" hover text invisible on mobile (no hover state) | Medium | The explore arrow + text uses `opacity-0 group-hover:opacity-100`. On touch devices, this never shows. |
| C5 | Same animation delay issue as Topics page | Medium | `index * 100ms` compounds |

**Recommendations:**
- Fix CTA hrefs to include `/${locale}/` prefix (BUG)
- Add a visible "View" or arrow icon that shows without hover for mobile
- Consider a minimum display: always show the count prominently as a visual CTA
- Cap animation delays

---

### 2.4 Blog Page (`/en/blog`)

**Visual Assessment (Desktop):**
- Completely different design language: cream/beige background, serif intentions, terracotta accents
- Mood filter chips ("All", "Inspired") are functional but appear sparse with only 1 post
- Blog card is clean but lonely -- large empty space below
- "Back to home" link is well-placed

**Visual Assessment (Mobile):**
- Blog hero scales well with centered text
- Single card fills width appropriately
- Mood chips are touch-friendly
- Footer has good spacing

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| B1 | Visual disconnect from main KB | High | Different bg color (cream vs white/blue), different font family intent (Georgia serif vs Fira Sans), different accent color (terracotta vs blue). Feels like a separate app. |
| B2 | Only 1 post makes page look abandoned | Medium | "1 post - 1 moods" text at top. If few posts expected, consider a different layout (single-column journal) instead of a grid layout designed for many items. |
| B3 | "1 moods" -- grammar | Low | Should be "1 mood" (singular). Missing plural logic for moods count. |
| B4 | Hardcoded strings | Low | `'Về trang chủ'` and `'Back to home'` hardcoded in blog/page.tsx instead of using i18n translations |
| B5 | Blog hero uses hardcoded font-family Inter | Low | `.blog-prose` references Inter font but it's not loaded anywhere |

**Recommendations:**
- Align blog visual language with KB: use the same background gradient, the same blue primary color, keep Fira Sans as primary font
- Or: deliberately brand the blog as distinct but add a clear visual transition/divider
- Use locale-based plural rules for mood count
- Move all strings to `messages/{locale}.json`

---

### 2.5 Search Page (`/en/search`)

**Visual Assessment (Desktop):**
- Clean empty state with search icon illustration
- "Start your search" heading with instructional text
- Two CTA buttons: "Browse All Topics" (blue, primary) and "Explore Categories" (white, secondary)
- Large empty space between header gradient and empty state

**Visual Assessment (Mobile):**
- Empty state centered well
- CTA buttons stack vertically on narrow screens
- Search icon illustration scales appropriately
- Lots of vertical empty space feels sparse

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| S1 | No search input on the search results page itself | High | The page relies entirely on the header SearchBar, but the search results page has a gradient header that says "Search Results" with no visible search input in the main content area. User must use the small header bar. |
| S2 | Empty state has too much whitespace | Medium | The search icon + text sits in the middle of a very large blank area. Looks unfinished. |
| S3 | No search suggestions or popular tags | Medium | Empty state could show trending tags, recent articles, or popular searches to guide users |
| S4 | "Search Results" title shows even when no search performed | Low | Semantically misleading -- no search was performed, so "Search Results" label is premature |

**Recommendations:**
- Add a prominent search input field in the search page content area (below header)
- Show popular tags or recent articles in empty state
- Change title to "Search" when no query is active, "Search Results" only when showing results
- Tighten empty state layout to reduce whitespace

---

### 2.6 Tags Page (`/en/tags`)

**Visual Assessment (Desktop):**
- Well-organized: tags grouped by category with color-coded chips
- Category headers with icons provide clear hierarchy
- Stats pill at top matches other pages (consistent pattern)
- "Other Tags" section for uncategorized tags uses neutral gray

**Visual Assessment (Mobile):**
- Tags listed in single-column rows
- Each tag shows count badge on right
- Category headers have icon + name + count badge
- Very long page on mobile (54 tags = lots of scrolling)

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| TG1 | "Other Tags" section is enormous | Medium | 30+ uncategorized tags dominate the page. Many are generic terms (Performance, Logging, CDN, OOP). Consider improving categorization. |
| TG2 | Tag grid on desktop uses 4 columns | Low | With 4 columns, some tags with long names (e.g., "Memory Management") get cramped |
| TG3 | No search/filter for tags | Medium | With 54 tags, finding a specific one requires scanning. A search or alphabetical jump would help. |
| TG4 | `hover:scale-105` on tag cards | Low | Scale transform on small list items feels excessive. `hover:scale-102` or just background color change would be more refined. |

**Recommendations:**
- Improve tag categorization to reduce "Other Tags" section
- Add a search input or alphabetical index for quick tag finding
- Use `hover:scale-[1.02]` instead of `hover:scale-105` for subtlety
- Consider a compact list view alternative for the tags page

---

### 2.7 Article Detail Page (`/en/topics/vibecode-ai-tools-rebuilt`)

**Visual Assessment (Desktop):**
- Dark header (gray-900) with breadcrumb, title, date, tags -- professional look
- Content wrapped in modern-card with ample padding (p-8 lg:p-12)
- Tables render with proper borders and alternating header styles
- Mermaid diagrams render in white containers with black borders

**Visual Assessment (Mobile):**
- Title text wraps well on narrow screens
- Breadcrumb may overflow on very long article titles
- Tables need horizontal scroll (handled by prose css)
- Content padding reduces to p-8 (still generous)

**Issues Found:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| A1 | Read time hardcoded to 5 minutes | High | `t('meta.readTime', { minutes: 5 })` -- always shows 5 min regardless of article length |
| A2 | No table of contents for long articles | Medium | The Vibecode article is very long with multiple h2/h3 sections. No TOC or sticky navigation to help readers. |
| A3 | Like and Share buttons are non-functional | Medium | Buttons exist with `aria-label` but no click handlers. Decorative-only buttons are misleading. |
| A4 | Article content uses Vietnamese text in some sections | Low | The article mixes Vietnamese and English content. This is content-level, not a UI bug. |
| A5 | Breadcrumb truncation | Low | On mobile, breadcrumb shows full article title which can be very long. Should truncate with ellipsis. |
| A6 | Mermaid CSS forces black borders (`border: 2px solid #000000`) | Low | Harsh; a softer gray border would integrate better with the card aesthetic |
| A7 | `dangerouslySetInnerHTML` with `sanitize: false` | High | XSS risk. Documented in CLAUDE.md but still a security concern. |

**Recommendations:**
- Compute reading time from word count (~200 words/min)
- Add auto-generated TOC sidebar or sticky header for long articles
- Either implement Like/Share functionality or remove the buttons
- Truncate breadcrumb article title to ~40 chars on mobile
- Soften Mermaid borders to `border-color: var(--gray-300)`

---

## 3. Cross-Cutting Issues

### 3.1 Design System Consistency

| Area | Assessment | Details |
|------|-----------|---------|
| Color Palette | **Good** | Consistent blue primary across KB pages. CSS variables well-defined. |
| Typography | **Fair** | `heading-xl/lg/md` classes provide hierarchy. But blog uses different font stack. |
| Spacing | **Good** | Consistent use of `py-16`, `px-6`, `gap-8` patterns. |
| Card Patterns | **Good** | `modern-card` class reused across pages. Blog uses separate `blog-card`. |
| Button Patterns | **Good** | `btn-primary`, `btn-secondary`, `btn-cta` are well-defined with hover states. |
| Icons | **Good** | Consistent Heroicons (outline) style throughout. |
| Page Structure | **Good** | Consistent pattern: gradient header > content section > CTA footer. |

**Improvement Needed:**
- Blog design system diverges significantly -- needs reconciliation
- No shared "page header" component; each page rebuilds the gradient header + stats pill pattern
- Missing: Badge/chip component, Pagination component, Toast/notification component

### 3.2 Accessibility Audit

| Criteria | Status | Details |
|----------|--------|---------|
| Focus states | **Pass** | `*:focus-visible` with blue outline + offset globally defined. Dark background variant exists. |
| ARIA labels | **Pass** | SearchBar has `role="combobox"`, `aria-expanded`, `aria-activedescendant`. LanguageSwitcher has `role="listbox"`. HeaderNav has `aria-label`, `aria-expanded`, `aria-controls`. |
| Keyboard navigation | **Pass** | SearchBar supports Arrow/Enter/Escape. LanguageSwitcher has full keyboard support. Mobile menu has focus trap. |
| Color contrast | **Mostly Pass** | `.gradient-amber` has comment noting WCAG compliance. However: gray-400 text on white bg (stats labels, tag counts) is 4.48:1 -- borderline. Gray-300 text (breadcrumb) is 3.5:1 -- fails AA for normal text. |
| Touch targets | **Pass** | Mobile nav links have `py-3` padding (48px). Buttons have `py-3`/`py-4`. |
| Screen reader | **Good** | Live region for search results. `aria-hidden` on decorative SVGs. `aria-current="page"` on active nav links. |
| Reduced motion | **Pass** | `prefers-reduced-motion` media query disables all animations. |
| Skip to content | **Fail** | No skip-to-main-content link. |
| Landmark roles | **Partial** | `<header>`, `<main>`, `<footer>` present. Multiple `<nav>` elements have `aria-label`. No `<aside>` for secondary content. |
| Language attributes | **Pass** | `<html lang={locale}>` dynamically set. |

**Critical Accessibility Gaps:**
1. No skip-to-content link
2. Gray-300 text on white backgrounds fails WCAG AA
3. Some decorative SVGs missing `aria-hidden="true"` (hero section SVGs in page.tsx)

### 3.3 Performance Concerns

| Metric | Value | Assessment |
|--------|-------|-----------|
| FCP | 116ms | Excellent |
| TTFB | 67.7ms | Excellent |
| CLS | 0 | Perfect |
| DOM Nodes | 2,495 | **Warning** -- above recommended 1,500. Likely from rendering all 16 cards + tags + categories inline. |
| JS Heap | 49MB | Moderate. Acceptable for dev, monitor in prod. |
| Event Listeners | 638 | **Warning** -- high count. Likely from multiple click-outside handlers, search handlers, and animation listeners. |
| Resources | 17 | Good. |

**Font Loading Issue (Critical):**
```
globals.css:41   -> @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:...')
layout.tsx:14    -> Fira_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] })
```
- Fonts loaded twice: CSS `@import` (render-blocking) + `next/font` (optimized)
- CSS `@import` includes Fira Code but does NOT specify Vietnamese subset
- `next/font` config specifies only `latin` subset -- no Vietnamese support
- **Result:** Vietnamese diacritics may fall back to system font, causing visual inconsistency

**Animation Performance:**
- `hover:scale-105` on cards triggers layout repaints. Use `will-change: transform` or GPU-composited properties only.
- The `float` animation on `.hero-section::before` runs infinitely. Combined with `transform: rotate()`, this creates ongoing GPU compositing. Acceptable for hero but should be scoped.
- `search-input` uses `transition: all 0.2s ease` (line 565) -- should be `transition: border-color 0.2s, box-shadow 0.2s` for perf.

### 3.4 Responsive Design

| Breakpoint | Assessment |
|------------|-----------|
| 320px (small mobile) | **Untested** -- smallest seen in screenshots is ~375px. Header may overflow. |
| 375px (iPhone SE) | Good. Content readable, cards stack properly. |
| 768px (tablet) | Good. Grid transitions from 1 to 2 columns. |
| 1024px (small desktop) | Good. Grid transitions to 3 columns. |
| 1440px+ (large desktop) | Content constrained by `container` -- max width may be too narrow for ultra-wide. |

**Mobile-Specific Issues:**
1. Header has both hamburger menu AND language/import icons all squeezed in `flex items-center gap-4`. On 320px screens this may overflow.
2. Mobile search bar sits below header in its own bordered section -- takes 2 rows of vertical space.
3. Tags page mobile layout shows each tag in a full-width row. With 54+ tags, this is an extremely long scroll.

---

## 4. Prioritized Improvement List

### HIGH Impact (Fix First)

| # | Issue | Page | Effort |
|---|-------|------|--------|
| 1 | Fix duplicate font loading: remove CSS `@import`, add `vietnamese` to `next/font` subsets | Global | 30 min |
| 2 | Fix non-localized CTA links in categories page | Categories | 15 min |
| 3 | Replace hardcoded stats with dynamic counts | Homepage | 45 min |
| 4 | Add search input field to search results page content area | Search | 1 hr |
| 5 | Cap animation delays (`Math.min(index * 80, 400)`) | Topics, Categories | 15 min |
| 6 | Compute actual reading time from word count | Article Detail | 30 min |
| 7 | Add skip-to-main-content link | Layout | 15 min |

### MEDIUM Impact

| # | Issue | Page | Effort |
|---|-------|------|--------|
| 8 | Link featured category cards to specific categories | Homepage | 30 min |
| 9 | Remove or implement Like/Share buttons | Article Detail | 30 min |
| 10 | Align blog visual language with main KB or add clear transition | Blog | 2 hr |
| 11 | Add category filter tabs to Topics page | Topics | 2 hr |
| 12 | Improve "Other Tags" categorization | Tags | 1 hr |
| 13 | Fix breadcrumb truncation on mobile | Article Detail | 20 min |
| 14 | Show popular tags/recent articles in search empty state | Search | 1 hr |
| 15 | Fix "1 moods" grammar (singular/plural) | Blog | 15 min |
| 16 | Add TOC sidebar for long articles | Article Detail | 3 hr |
| 17 | Improve color contrast for gray-300/gray-400 text | Global | 30 min |
| 18 | Make mobile "Explore" visible without hover state | Categories | 20 min |

### LOW Impact (Polish)

| # | Issue | Page | Effort |
|---|-------|------|--------|
| 19 | Replace "24/7" stat with meaningful metric | Homepage | 10 min |
| 20 | Soften Mermaid diagram borders | Global CSS | 10 min |
| 21 | Reduce `hover:scale-105` to `hover:scale-[1.02]` on tag cards | Tags | 10 min |
| 22 | Fix `transition: all` on `.search-input` to specific properties | Global CSS | 5 min |
| 23 | Move hardcoded blog strings to i18n messages | Blog | 20 min |
| 24 | Add `will-change: transform` to card hover animations | Global CSS | 10 min |
| 25 | Extract shared "PageHeader" component for gradient header + stats | All pages | 1.5 hr |
| 26 | Add aria-hidden to decorative SVGs in homepage | Homepage | 10 min |
| 27 | Reduce "Other Tags" items per row from 4 to 3 on desktop for readability | Tags | 5 min |

---

## 5. Quick Wins (Under 1 Hour Each)

### 1. Fix Duplicate Font Loading (30 min)
**File:** `src/styles/globals.css` line 41, `src/app/[locale]/layout.tsx` line 14
- Delete the `@import url(...)` line from globals.css
- Update layout.tsx font config:
```tsx
const firaSans = Fira_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-sans',
});
```
- Add Fira Code via `next/font` as well, or load via `<link>` in metadata

### 2. Fix Non-Localized CTA Links (15 min)
**File:** `src/app/[locale]/categories/page.tsx` lines 178, 183-184
- Change `href="/topics"` to `href={/${locale}/topics}`
- Change `href="/tags"` to `href={/${locale}/tags}`

### 3. Dynamic Homepage Stats (45 min)
**File:** `src/app/[locale]/page.tsx`
- Import `getSortedPostsData` and `getAllCategoriesWithSlug`
- Compute article count, category count, tag count at build time
- Replace hardcoded "50+", "10+", "25+" with actual numbers

### 4. Cap Animation Delays (15 min)
**Files:** Topics and Categories page.tsx
- Replace `animationDelay: ${index * 100}ms` with `animationDelay: ${Math.min(index * 80, 400)}ms`

### 5. Add Skip-to-Content Link (15 min)
**File:** `src/app/[locale]/layout.tsx`
- Add as first child of `<body>`:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
  Skip to main content
</a>
```
- Add `id="main-content"` to `<main>`

### 6. Fix Blog Plural Grammar (15 min)
**File:** `src/app/[locale]/blog/page.tsx` line 33
- Change: `{posts.length === 1 ? 'post' : 'posts'}` (already done for posts)
- Add same for moods: `{moods.length} {moods.length === 1 ? 'mood' : 'moods'}`
- Move both strings to i18n messages

### 7. Compute Reading Time (30 min)
**File:** `src/app/[locale]/topics/[topic]/page.tsx` line 83
- Calculate from `postData.contentHtml`:
```tsx
const wordCount = (postData.contentHtml || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
const readingTime = Math.max(1, Math.ceil(wordCount / 200));
```
- Replace hardcoded `5` with computed `readingTime`

### 8. Fix Color Contrast (30 min)
**File:** `src/styles/globals.css` and component files
- Replace `text-gray-300` on dark backgrounds with `text-gray-200` (contrast ratio 7.5:1)
- Replace `text-gray-400` on white backgrounds with `text-gray-500` (contrast ratio 5.9:1)
- Specifically: breadcrumb `text-gray-300` -> `text-gray-200`, stat labels `text-gray-600` is fine

---

## 6. Design System Observations

### What Works Well
- **CSS custom properties** for colors (`:root` variables) -- extensible
- **Utility classes** (`heading-xl`, `modern-card`, `btn-primary`) -- well-abstracted
- **Animation respect** -- `prefers-reduced-motion` is properly handled
- **Consistent page structure** -- header gradient > content > CTA pattern across all KB pages
- **Glassmorphism header** -- `backdrop-filter: blur(10px)` with semi-transparent bg looks modern
- **Card hover effects** -- `translateY(-4px)` with shadow transition feels premium
- **Accessibility infrastructure** -- ARIA roles, keyboard nav, focus states are thoughtfully implemented

### What Needs Improvement
- **Component reuse** -- Each page rebuilds the "gradient header + stats pill" pattern. Extract a `PageHeader` component.
- **Blog isolation** -- Blog has its own design system scoped under `.blog-layout`, but the visual gap is too stark.
- **Stagger animation pattern** -- Needs a utility like `stagger-entrance` with built-in cap instead of inline delays.
- **Empty state pattern** -- Search, topics, tags, and categories all have slightly different empty states. Standardize into a shared `EmptyState` component.
- **No dark mode** -- CSS variables for dark mode exist in comments but are unused. Consider implementing or removing dead code.

---

## 7. Unresolved Questions

1. Is the blog intentionally a separate visual identity from the KB, or should they converge?
2. Are the Like/Share buttons on article detail planned for future implementation, or should they be removed?
3. What is the target maximum number of articles? This affects whether current pagination-free design is sustainable.
4. Is dark mode a planned feature? `globals.css` has dark mode variables but they're dormant.
5. Should the "Import Markdown" button in the header be visible to all users or only to admins?

---

*End of audit report.*
