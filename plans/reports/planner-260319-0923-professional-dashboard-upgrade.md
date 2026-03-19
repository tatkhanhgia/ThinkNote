---
type: planner
date: 2026-03-19
slug: professional-dashboard-upgrade
plan: plans/260319-0923-professional-dashboard-upgrade/
---

# Planner Report: Professional Dashboard Upgrade

## Summary

Created a 5-phase implementation plan to upgrade ThinkNote's dashboard to a professional, data-dense design. Audited 15 components and 8 page files, identified 8 major design gaps, and produced detailed phase files with exact Tailwind classes, code snippets, and file-by-file instructions.

## Key Findings

1. **Color mismatch**: Primary palette uses sky-500 (`#0ea5e9`) but spec requires blue-500 (`#3B82F6`). All `--primary-*` CSS vars and button shadows need update.
2. **Font swap needed**: Inter -> Fira Sans (body), JetBrains Mono -> Fira Code (code). Requires both `next/font` and CSS var updates.
3. **26+ emojis** in knowledge-base section (categories page alone has 2 x 13 locale-specific emoji maps). All must become inline SVG.
4. **CustomButton** uses purple/pink colors completely disconnected from any design system.
5. **No CTA orange** exists anywhere -- needs new `.btn-cta` class and CSS vars.
6. **Accessibility gaps**: `focus:outline-none` without `focus-visible` replacement, no keyboard nav in SearchBar/LanguageSwitcher dropdowns, missing ARIA roles.
7. **`transition: all`** on 3 CSS classes is a perf concern -- replace with specific properties.
8. **No `prefers-reduced-motion`** support.

## Plan Structure

| Phase | Focus | Effort | Files |
|-------|-------|--------|-------|
| 01 | Audit (complete) | 0.5h | -- |
| 02 | Style system (colors, fonts, tokens) | 1.5h | 3 files |
| 03 | Component improvements (SVG, chips, cursor) | 2h | 10 files + 1 new |
| 04 | Accessibility (focus, keyboard, ARIA) | 1h | 7 files |
| 05 | Polish (transitions, spinners, tooltips) | 1h | 5 files |
| **Total** | | **6h** | **~18 files** |

## Recommendations

- Execute phases sequentially (02 -> 03 -> 04 -> 05) since style tokens must land before component updates
- Phase 03 is highest effort: consider splitting emoji SVG replacement into a sub-task
- Blog section (`.blog-layout` scope) is intentionally isolated and should NOT be modified
- Run `npm run build` after each phase to catch regressions early

## Plan Location

`plans/260319-0923-professional-dashboard-upgrade/plan.md`
