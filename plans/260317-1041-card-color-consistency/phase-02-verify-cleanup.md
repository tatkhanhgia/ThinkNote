# Phase 2: Verify & Clean Up

## Context
- [Plan overview](./plan.md)
- Depends on: [Phase 1](./phase-01-update-component.md)

## Overview
- **Priority**: P3
- **Status**: pending
- **Effort**: 15min

## Key Insights
- 4 call sites pass `gradientFrom`/`gradientTo` which are now unused
- Removing these from call sites is optional cleanup (not breaking)
- Visual verification on dev server is the primary validation method

## Requirements

### Functional
- All card pages render with varied, category-consistent colors
- No visual regressions on mobile or desktop

### Non-functional
- Clean unused prop references from call sites (DRY principle)

## Implementation Steps

1. **Build check**: Run `npm run build` to confirm no errors
2. **Visual verification**: Start dev server, check these pages:
   - `/en/topics` (main card grid)
   - `/en/categories/security` (should all be rose)
   - `/en/search?q=java` (should show amber cards)
3. **Optional cleanup** - Remove unused `gradientFrom`/`gradientTo` from call sites:
   - `src/app/[locale]/topics/page.tsx` line 114-115
   - `src/app/[locale]/search/SearchResults.tsx` line 120-121
   - `src/app/[locale]/tags/[tag]/page.tsx` (similar pattern)
   - `src/app/[locale]/categories/[category]/page.tsx` (uses spread, auto-handled)
4. **Optional**: Remove `gradientFrom?`/`gradientTo?` from `KnowledgeCardProps` interface
5. **Optional**: Remove `gradientFrom`/`gradientTo` from `PostData` interface in `src/lib/posts.ts` and frontmatter parsing
6. Run `npm run lint` to verify no warnings

## Todo List

- [ ] Build check passes
- [ ] Visual verification on dev server
- [ ] (Optional) Remove gradientFrom/gradientTo from call sites
- [ ] (Optional) Clean PostData interface
- [ ] Lint check passes

## Success Criteria

- Build succeeds with zero errors
- Cards display with 5 distinct gradient colors distributed across categories
- No lint warnings related to unused props

## Risk Assessment

- **Very low**: Optional cleanup steps can be skipped without impact
- If Vietnamese categories have different names, the mapping still works because `getCategoryGradient` iterates all categories in the array (the translated Vietnamese category might not match, but if the English canonical category is also in the array it will match -- need to verify)

## Resolved Questions

- **Vietnamese categories**: Confirmed Vietnamese articles use translated names (e.g., "Bao mat", "Loi phat trien", "Co so du lieu"). The `CATEGORY_GRADIENT_MAP` in Phase 1 includes both English and Vietnamese keys to handle this.
