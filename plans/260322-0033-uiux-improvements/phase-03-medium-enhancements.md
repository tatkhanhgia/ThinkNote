# Phase 3: Medium Enhancements

**Priority:** Medium
**Effort:** ~4 hours
**Dependencies:** Phase 2 complete

## Context

- [Audit Report](../reports/uiux-audit-260321-2350-thinknote-comprehensive-audit.md)
- [Plan Overview](./plan.md)

## Items (5)

### 3.1 Align Blog Visual Language with KB (2 hr)
**Files:** `src/app/[locale]/blog/page.tsx`, `src/styles/globals.css` (blog section)
**Issue:** Blog uses cream bg, Georgia serif, terracotta accents — feels like separate app from KB's blue/glass/Fira Sans.

**Decision needed:** Converge with KB or keep distinct? Recommendation: converge.

**Steps (converge approach):**
1. Replace `.blog-layout` background from cream/beige to white with subtle blue gradient (match KB pages)
2. Remove Georgia/serif font references — use Fira Sans consistently
3. Replace terracotta accent color with blue primary (`--primary-500`)
4. Keep `.blog-card` component but align border/shadow with `modern-card` patterns
5. Keep mood filter chips but style with blue tones instead of terracotta
6. Update blog hero gradient to match KB page header gradient pattern
7. Move hardcoded blog strings to `messages/{locale}.json`

**Related files:** `src/components/ui/BlogCard.tsx`, `src/components/ui/MoodFilter.tsx`

### 3.2 Add TOC Sidebar for Long Articles (3 hr → scoped to 1.5 hr)
**File:** `src/app/[locale]/topics/[topic]/page.tsx`
**Issue:** Long articles have no table of contents or navigation.

**Scoped approach (KISS):** Auto-generated TOC from headings, displayed above article content (not sidebar — simpler).

**Steps:**
1. Parse `postData.contentHtml` for `<h2>` and `<h3>` elements
2. Extract heading text and generate anchor IDs
3. Render TOC list above article content (collapsible on mobile)
4. Add `id` attributes to rendered headings via regex or remark plugin
5. Style with indentation for h3 under h2
6. Add smooth scroll behavior

**Note:** Skip sticky sidebar to avoid layout complexity. Simple in-content TOC is sufficient for now.

### 3.3 Show Popular Tags in Search Empty State (1 hr → scoped to 30 min)
**File:** `src/app/[locale]/search/page.tsx`
**Issue:** Empty state is just an icon + text with excessive whitespace.

**Steps:**
1. Import `getAllTags` from `@/lib/posts`
2. Get top 8-10 tags by article count
3. Render as clickable chips below empty state text
4. Link each tag to `/${locale}/tags/${tagSlug}`
5. Tighten empty state vertical spacing

### 3.4 Improve Tag Categorization (1 hr → scoped to content task)
**File:** `src/lib/posts.ts` or tag data
**Issue:** "Other Tags" section has 30+ uncategorized tags dominating the page.

**Steps:**
1. Review uncategorized tags: Performance, Logging, CDN, OOP, etc.
2. Map more tags to existing categories in tag grouping logic
3. Suggested mappings:
   - Performance, CDN, Edge Computing → "Web Performance"
   - OOP, Design Patterns → "Development Core"
   - Logging, Monitoring → "Backend"
4. Add tag search/filter input to tags page
5. Reduce "Other Tags" to <10 truly generic items

### 3.5 Fix Card Description Truncation (15 min)
**File:** `src/components/ui/KnowledgeCard.tsx`
**Issue:** Card descriptions have inconsistent heights — no `line-clamp`.

**Steps:**
1. Find the description `<p>` element
2. Add `line-clamp-2` class for consistent 2-line truncation
3. Verify cards align in grid with uniform heights

## Success Criteria

- [x] Blog visually consistent with KB (same colors, fonts, patterns)
- [x] Long articles have auto-generated TOC
- [x] Search empty state shows popular tags
- [x] "Other Tags" section reduced to <10 items
- [x] Card descriptions consistently truncated at 2 lines
