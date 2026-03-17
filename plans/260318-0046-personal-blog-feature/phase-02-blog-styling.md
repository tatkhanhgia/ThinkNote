# Phase 2: Blog Styling (CSS)

## Overview
- **Priority:** P1
- **Status:** Completed ✓
- **Effort:** 1h
- Add warm & cozy blog-specific CSS scoped under `.blog-layout` class

## Key Insights
- Blog styling MUST NOT leak into KB pages
- All blog styles scoped via `.blog-layout` ancestor selector
- Warm palette: cream bg `#F9F7F3`, terracotta accent `#C17765`, sage `#8B9D83`
- Serif body font for reading comfort (Georgia)
- Max content width 720px for optimal reading

## Related Code Files

### Modify
- `src/styles/globals.css` — append blog-specific CSS section

## Implementation Steps

1. Add CSS custom properties for blog palette under `.blog-layout`
2. Add blog typography styles (serif body, tight headings)
3. Add blog card styles (warm shadow, hover effects)
4. Add mood tag chip styles (pastel backgrounds per mood)
5. Add blog prose styles (wider line-height, larger font)
6. Add blog listing grid styles

### CSS Classes to Create

```css
/* Blog Layout Wrapper */
.blog-layout { /* warm cream background, blog color vars */ }

/* Blog Cards */
.blog-card { /* white bg, warm shadow, hover lift */ }

/* Mood Chips */
.mood-chip { /* rounded pill, pastel bg, small text */ }
.mood-chip--reflective { /* soft pink bg */ }
.mood-chip--joyful { /* warm yellow bg */ }
/* ... per mood */

/* Blog Prose (article content) */
.blog-prose { /* serif font, 18px, 1.8 line-height, max-w-720px */ }
.blog-prose h1, h2, h3 { /* sans-serif headings */ }
.blog-prose blockquote { /* terracotta left border */ }
.blog-prose a { /* terracotta color */ }

/* Blog Hero */
.blog-hero { /* large title, warm gradient overlay */ }
```

## Todo List
- [ ] Add blog CSS variables (palette)
- [ ] Add `.blog-layout` wrapper styles
- [ ] Add `.blog-card` styles
- [ ] Add `.mood-chip` styles (8 moods)
- [ ] Add `.blog-prose` content styles
- [ ] Add `.blog-hero` styles
- [ ] Verify no style leakage to KB pages

## Success Criteria
- Blog pages have warm cream background
- KB pages unaffected (no style leakage)
- Serif font used in blog content, sans-serif in KB
- Mood chips visually distinct with pastel colors
- Responsive on mobile

## Risk Assessment
- **CSS specificity conflicts**: Mitigated by scoping all blog styles under `.blog-layout`
- **Font loading**: Georgia is a system font — no extra downloads needed
