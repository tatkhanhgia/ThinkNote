# Phase 3: UI Components

## Overview
- **Priority:** P1
- **Status:** Completed ✓
- **Effort:** 1.5h
- Create BlogCard, MoodFilter, and ReadingTime components

## Related Code Files

### Create
- `src/components/ui/BlogCard.tsx` — blog post card for listing
- `src/components/ui/MoodFilter.tsx` — mood tag filter chips
- `src/components/ui/ReadingTime.tsx` — reading time display

### Reference
- `src/components/ui/KnowledgeCard.tsx` — card pattern reference
- `src/lib/blog-posts.ts` — data types (Phase 1)

## Component Specifications

### BlogCard.tsx (~80 LOC)

**Props:**
```typescript
interface BlogCardProps {
  title: string;
  description: string;
  date: string;
  mood: string;
  readingTime: number;
  tags: string[];
  href: string;
  locale: string;
}
```

**Visual:**
- White card with warm shadow on cream bg
- Date + reading time in header
- Mood chip with icon
- Title (bold, sans-serif)
- Description excerpt (2 lines max)
- Tags as small pills
- Hover: subtle lift + shadow increase
- Uses `.blog-card` CSS class

### MoodFilter.tsx (~60 LOC)

**Props:**
```typescript
interface MoodFilterProps {
  moods: { mood: string; count: number }[];
  activeMood: string | null;
  onMoodChange: (mood: string | null) => void;
  locale: string;
}
```

**Visual:**
- Horizontal row of mood chips (scrollable on mobile)
- "All" chip + one per available mood
- Active mood highlighted with filled background
- Click toggles filter
- Shows count badge
- Uses `.mood-chip` CSS classes
- Client component ('use client')

### ReadingTime.tsx (~20 LOC)

**Props:**
```typescript
interface ReadingTimeProps {
  minutes: number;
  locale: string;
}
```

**Visual:**
- Simple inline text: "5 min read" / "5 phút đọc"
- Clock icon (SVG inline)
- Uses i18n for "min read" text

## Implementation Steps

1. Create `ReadingTime.tsx` — simplest component first
2. Create `BlogCard.tsx` — uses ReadingTime, mood chip display
3. Create `MoodFilter.tsx` — client component with state handling

## Todo List
- [ ] Create `src/components/ui/ReadingTime.tsx`
- [ ] Create `src/components/ui/BlogCard.tsx`
- [ ] Create `src/components/ui/MoodFilter.tsx`
- [ ] Verify TypeScript compilation

## Success Criteria
- BlogCard renders all fields correctly
- MoodFilter toggles active mood
- ReadingTime shows localized text
- All components under 100 LOC
- No TypeScript errors
