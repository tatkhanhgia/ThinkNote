---
title: "Fix KnowledgeCard Color Inconsistency"
description: "Replace broken gradient mapping with category-based color assignment for consistent, meaningful card colors"
status: pending
priority: P2
effort: 1h
branch: master
tags: [ui, ux, component, styling]
created: 2026-03-17
---

# Fix KnowledgeCard Color Inconsistency

## Problem

`KnowledgeCard.getGradientClass()` maps frontmatter `gradientFrom`/`gradientTo` combos to CSS classes, but only 4 of 16 unique combos are mapped. Result: ~75% of cards fall back to `gradient-blue`, making the grid monotonous.

### Current state
- 5 CSS gradient classes exist: `gradient-blue`, `gradient-purple`, `gradient-emerald`, `gradient-rose`, `gradient-amber`
- 16 articles with 16 unique from/to combos, only 4 matched
- 14 unique categories: Programming Languages, Development Core, AI, Tool, Database, Security, Design Patterns, Framework, Java, Frontend, Backend, IDE, System Design, Web Performance

### Root cause
The `getGradientClass()` approach of mapping exact from/to string combos is fragile. Adding new articles with new gradient values always breaks.

## Solution: Category-Based Gradient Assignment

Assign gradient class based on article's **primary category** (first in array). This is:
1. Semantically meaningful (Security = rose, Frontend = emerald, etc.)
2. Deterministic (same category = same color everywhere)
3. Zero maintenance (new articles auto-get color from their category)
4. No frontmatter changes needed
5. No Tailwind safelist needed (uses existing CSS custom classes)

### Category-to-Gradient Mapping

| Category | Gradient Class | Visual | Rationale |
|---|---|---|---|
| Security | `gradient-rose` | pink-to-yellow | Alert/warning association |
| AI | `gradient-purple` | pink-to-red | Innovation/futuristic |
| Frontend, Framework | `gradient-emerald` | blue-to-cyan | Cool/creative |
| Database, Backend | `gradient-blue` | indigo-to-purple | Stable/foundational |
| Java, Programming Languages | `gradient-amber` | peach-to-salmon | Warm/classic |
| Design Patterns, System Design | `gradient-purple` | pink-to-red | Abstract/conceptual |
| Tool, IDE | `gradient-emerald` | blue-to-cyan | Utility/productivity |
| Development Core | `gradient-blue` | indigo-to-purple | Core/foundational |
| Web Performance | `gradient-rose` | pink-to-yellow | Speed/energy |
| *(unmapped)* | `gradient-blue` | indigo-to-purple | Safe default |

Distribution across 16 articles (estimated):
- `gradient-blue`: ~4 (Database, Backend, Dev Core)
- `gradient-purple`: ~3 (AI, Design Patterns, System Design)
- `gradient-emerald`: ~4 (Frontend, Framework, Tool, IDE)
- `gradient-rose`: ~2 (Security, Web Performance)
- `gradient-amber`: ~3 (Java, Programming Languages)

All 5 gradient classes get used. Good visual variety.

## Phases

- [Phase 1: Update KnowledgeCard component](./phase-01-update-component.md) - `pending`
- [Phase 2: Verify & clean up](./phase-02-verify-cleanup.md) - `pending`

## Files to Modify

| File | Change |
|---|---|
| `src/components/ui/KnowledgeCard.tsx` | Replace `getGradientClass()` with category-based logic |
| `src/styles/globals.css` | No changes needed (5 classes already sufficient) |
| `tailwind.config.js` | No changes needed |
| Call sites (4 files) | No changes needed (categories already passed as prop) |

## Risk Assessment

- **Low risk**: Pure UI change, no data model or API changes
- **Backward compatible**: `gradientFrom`/`gradientTo` props remain in interface (unused but not breaking)
- **Testable**: Visual inspection on dev server suffices
