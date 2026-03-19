## Phase Implementation Report

### Executed Phase
- Phase: 04 (Accessibility) + 05 (Polish & Effects)
- Plan: plans/260319-0923-professional-dashboard-upgrade/
- Status: completed

### Files Modified

| File | Changes |
|------|---------|
| `src/styles/globals.css` | Replace `transition:all` on 4 classes, fix nav-link::after transition, upgrade focus-visible ring (2px→3px), add dark-bg focus override, add prefers-reduced-motion block, refine animate-in (expo easing, 20px→16px), update modern-card:hover to full bg opacity |
| `src/components/ui/CustomButton.tsx` | Replace `focus:outline-none focus:ring-2` with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`; update all variant focus classes to `focus-visible:` |
| `src/components/ui/SearchBar.tsx` | Full rewrite: keyboard nav (ArrowUp/Down/Enter/Escape), `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant` on input, `role="listbox"` + `role="option"` + `aria-selected` on results, `aria-live="polite"` SR announcement region, loading spinner SVG with `role="status"`, `disabled` input while loading, title tooltips on results, `transition-colors` replacing `transition-all` |
| `src/components/ui/LanguageSwitcher.tsx` | Add keyboard nav: separate `handleTriggerKeyDown` (opens on ArrowDown/Enter/Space, sets activeIndex) and `handleDropdownKeyDown` (cycle, select, Escape returns focus to trigger, Tab closes); add `aria-label="Select language"`, `aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"`, `role="option"`, `aria-selected`; `triggerRef` for focus return after Escape |
| `src/components/ui/HeaderNav.tsx` | Add `menuContainerRef` + focus trap effect (auto-focus first item, Tab cycle between first/last); `aria-current="page"` on active links in both desktop and mobile nav; `aria-label` on both `<nav>` elements; `transition-colors duration-150` on mobile links |
| `src/components/ui/KnowledgeCard.tsx` | `aria-label={title}` on article, `title={title}` on h3, `title={description}` on p; Read More link: `transition-colors` + `focus-visible:ring-2` focus state; arrow icon: `transition-transform duration-200` |
| `src/components/ui/BlogCard.tsx` | `title={title}` on h2, `title={description}` on p; `transition-colors duration-150` on h2 hover |

### Tasks Completed

- [x] Fix CustomButton: replace `focus:outline-none focus:ring-2` with `focus-visible:` variants on all 4 variant focus classes
- [x] Add dark-background focus-visible override in `globals.css` (blue-300 outline on gray-900/gray-800/from-gray-900 contexts)
- [x] Add keyboard navigation (ArrowDown, ArrowUp, Escape, Enter) to SearchBar dropdown
- [x] Add `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` to SearchBar input
- [x] Add `aria-live="polite"` region for search result count announcements
- [x] Add keyboard navigation to LanguageSwitcher dropdown (ArrowDown/Up to cycle, Enter/Space to select, Escape returns focus)
- [x] Add `aria-label`, `aria-haspopup="listbox"`, `role="listbox"`, `role="option"` to LanguageSwitcher
- [x] Add focus trap to HeaderNav mobile menu (Tab cycles within, Escape returns focus to trigger)
- [x] Auto-focus first menu item when mobile menu opens
- [x] Add `aria-current="page"` to active nav links (desktop + mobile)
- [x] Add `aria-label={title}` to KnowledgeCard article element
- [x] Topic detail page already had `aria-label` on heart/share buttons — no change needed
- [x] Replace `transition: all` with specific properties on `.modern-card`, `.btn-primary`, `.btn-secondary`, `.btn-cta`, `.nav-link`
- [x] Add `prefers-reduced-motion: reduce` media query disabling all non-essential animations
- [x] Add loading state + spinner to SearchBar during post fetch
- [x] Add `title` attribute to truncated text in KnowledgeCard (h3, p), BlogCard (h2, p), SearchBar results (h4, p)
- [x] Update `.modern-card:hover` background to full opacity (0.95 → 1)
- [x] Refine `.animate-in` with expo easing `cubic-bezier(0.16, 1, 0.3, 1)` and 16px translateY
- [x] Upgrade global focus-visible ring from 2px to 3px with 3px offset

### Tests Status
- Type check: pass (zero TypeScript errors)
- Build: pass (`next build` — 192 static pages generated)
- Lint: pass (only pre-existing warnings in MarkdownImporter.tsx, unchanged)
- Unit tests: not run (no test files for these components)

### Issues Encountered

- Topic detail page buttons already had `aria-label` attributes — no i18n key addition needed
- BlogCard `transition-colors` was using non-specific class; added `duration-150` for specificity
- `transition-colors transition-transform` in CustomButton baseStyle: Tailwind merges these correctly as they target different properties

### Next Steps

- Run `npm run build` again after any further changes to verify
- Manual keyboard-only navigation test on `/en`, `/en/topics`, `/en/blog` pages
- DevTools accessibility audit (Lighthouse) to confirm score improvement
- Optional: add visual regression snapshots for card hover states
