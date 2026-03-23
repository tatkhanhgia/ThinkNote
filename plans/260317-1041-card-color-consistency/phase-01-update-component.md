# Phase 1: Update KnowledgeCard Component

## Context
- [Plan overview](./plan.md)
- File: `src/components/ui/KnowledgeCard.tsx` (129 lines)

## Overview
- **Priority**: P2
- **Status**: completed
- **Effort**: 30min

## Key Insights
- `categories` prop is already passed to KnowledgeCard from all 4 call sites
- Primary category = `categories[0]` (first element)
- 5 CSS gradient classes already defined in `globals.css`, no new CSS needed
- `gradientFrom`/`gradientTo` props become unused but can stay for backward compat

## Requirements

### Functional
- Card header gradient determined by primary category, not frontmatter gradient values
- All 5 gradient classes used across the 14 categories
- Unmapped categories get a deterministic fallback (not always blue)

### Non-functional
- No runtime performance regression (simple object lookup)
- Keep component under 200 lines

## Architecture

Replace `getGradientClass(from, to)` with `getCategoryGradient(categories)`:

```typescript
const CATEGORY_GRADIENT_MAP: Record<string, string> = {
  // Security & Performance - rose (pink-to-yellow, alert/energy)
  'Security': 'gradient-rose',
  'Bảo mật': 'gradient-rose',           // vi
  'Web Performance': 'gradient-rose',
  'Hiệu suất Web': 'gradient-rose',     // vi

  // AI & Design - purple (pink-to-red, innovation/abstract)
  'AI': 'gradient-purple',
  'Trí tuệ nhân tạo': 'gradient-purple', // vi
  'Design Patterns': 'gradient-purple',
  'Mẫu thiết kế': 'gradient-purple',     // vi
  'System Design': 'gradient-purple',
  'Thiết kế hệ thống': 'gradient-purple', // vi

  // Frontend & Tools - emerald (blue-to-cyan, creative/utility)
  'Frontend': 'gradient-emerald',
  'Framework': 'gradient-emerald',
  'Tool': 'gradient-emerald',
  'Công cụ': 'gradient-emerald',         // vi
  'IDE': 'gradient-emerald',

  // Data & Backend - blue (indigo-to-purple, foundational)
  'Database': 'gradient-blue',
  'Cơ sở dữ liệu': 'gradient-blue',     // vi
  'Backend': 'gradient-blue',
  'Development Core': 'gradient-blue',
  'Lõi phát triển': 'gradient-blue',     // vi

  // Languages - amber (peach-to-salmon, classic/warm)
  'Java': 'gradient-amber',
  'Programming Languages': 'gradient-amber',
  'Ngôn ngữ lập trình': 'gradient-amber', // vi
};

const GRADIENT_CLASSES = ['gradient-blue', 'gradient-purple', 'gradient-emerald', 'gradient-rose', 'gradient-amber'];

const getCategoryGradient = (categories?: string[]): string => {
  if (!categories || categories.length === 0) return 'gradient-blue';

  // Check primary category first, then others
  for (const cat of categories) {
    if (CATEGORY_GRADIENT_MAP[cat]) {
      return CATEGORY_GRADIENT_MAP[cat];
    }
  }

  // Deterministic fallback: hash category name to pick a gradient
  const hash = categories[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENT_CLASSES[hash % GRADIENT_CLASSES.length];
};
```

## Related Code Files

### Modify
- `src/components/ui/KnowledgeCard.tsx`
  - Remove `getGradientClass()` function (lines 28-38)
  - Add `CATEGORY_GRADIENT_MAP` constant and `getCategoryGradient()` function
  - Change line 40: `const gradientClass = getCategoryGradient(categories);`
  - Optionally remove `gradientFrom`/`gradientTo` from destructured props (or keep for compat)

### No changes needed
- `src/styles/globals.css` - 5 gradient classes already exist
- `src/app/[locale]/topics/page.tsx` - already passes `categories`
- `src/app/[locale]/search/SearchResults.tsx` - already passes `categories`
- `src/app/[locale]/categories/[category]/page.tsx` - already passes `categories` via spread
- `src/app/[locale]/tags/[tag]/page.tsx` - already passes `categories`

## Implementation Steps

1. Open `src/components/ui/KnowledgeCard.tsx`
2. Add `CATEGORY_GRADIENT_MAP` constant above the component (module-level)
3. Add `GRADIENT_CLASSES` array constant
4. Add `getCategoryGradient()` function
5. Remove `getGradientClass()` function (lines 28-38)
6. Replace line 40 (`const gradientClass = getGradientClass(...)`) with `const gradientClass = getCategoryGradient(categories);`
7. Remove `gradientFrom` and `gradientTo` from the destructured props (they become unused)
8. Keep `gradientFrom?` and `gradientTo?` in the `KnowledgeCardProps` interface for backward compat
9. Run `npm run build` to verify no compile errors

## Todo List

- [x] Add category-to-gradient mapping constant
- [x] Add getCategoryGradient function with deterministic fallback
- [x] Remove old getGradientClass function
- [x] Update gradientClass assignment
- [x] Run build check (types pass; Windows ENOENT rename pre-existing infra issue)

## Success Criteria

- All 5 gradient classes appear across the card grid
- Same category = same color on every page (topics, search, categories, tags)
- No compile errors
- Component stays under 200 lines

## Security Considerations

- None. Pure UI/styling change, no user input processing.
