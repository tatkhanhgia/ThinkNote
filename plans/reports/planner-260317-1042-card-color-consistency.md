# Planner Report: KnowledgeCard Color Consistency

**Date**: 2026-03-17
**Plan**: `plans/260317-1041-card-color-consistency/`

## Summary

Created a 2-phase plan to fix KnowledgeCard gradient color inconsistency. Root cause: `getGradientClass()` only maps 4 of 16 frontmatter gradient combos, causing ~75% of cards to fall back to `gradient-blue`.

## Solution

**Category-based gradient assignment** -- replace fragile from/to string matching with a simple category-to-gradient-class lookup. Zero-maintenance: new articles auto-get colors from their category.

### Key decisions
- Reuse existing 5 CSS gradient classes (no CSS changes)
- Include both English AND Vietnamese category keys in map (Vietnamese frontmatter uses translated names)
- Deterministic hash fallback for unmapped categories
- No frontmatter changes required
- No Tailwind safelist needed

### Category distribution
| Gradient | Categories | ~Count |
|---|---|---|
| `gradient-blue` | Database, Backend, Dev Core | 4 |
| `gradient-purple` | AI, Design Patterns, System Design | 3 |
| `gradient-emerald` | Frontend, Framework, Tool, IDE | 4 |
| `gradient-rose` | Security, Web Performance | 2 |
| `gradient-amber` | Java, Programming Languages | 3 |

## Phases
1. **Update component** (30min) -- Replace `getGradientClass` with `getCategoryGradient`, add bilingual category map
2. **Verify & cleanup** (15min) -- Build check, visual verification, optional removal of unused `gradientFrom`/`gradientTo` props

## Files to modify
- `src/components/ui/KnowledgeCard.tsx` (primary change)
- Call sites: optional cleanup only (4 files)

## Risk: Low
Pure UI change. No data model, API, or behavioral changes.
