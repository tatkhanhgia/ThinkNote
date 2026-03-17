# Phase 5: Navigation & i18n

## Overview
- **Priority:** P1
- **Status:** Completed ✓
- **Effort:** 0.5h
- Add Blog tab to nav bar + i18n keys for all blog UI strings

## Related Code Files

### Modify
- `src/components/ui/HeaderNav.tsx` — add Blog nav link
- `src/messages/en.json` — add Blog i18n keys
- `src/messages/vi.json` — add Blog i18n keys

## Implementation Steps

### 1. Update HeaderNav.tsx

Add Blog link to `navLinks` array:
```typescript
const navLinks = [
  { href: `/${locale}`, label: t('navigation.home') },
  { href: `/${locale}/topics`, label: t('navigation.topics') },
  { href: `/${locale}/categories`, label: t('navigation.categories') },
  { href: `/${locale}/blog`, label: t('navigation.blog') },  // NEW
];
```

### 2. Update en.json

Add keys:
```json
{
  "Layout": {
    "navigation": {
      "blog": "Blog"
    }
  },
  "BlogPage": {
    "hero": {
      "title": "My Blog",
      "subtitle": "Personal thoughts, reflections, and life experiences"
    },
    "filter": {
      "all": "All",
      "mood": "Mood"
    },
    "noPosts": {
      "title": "No Posts Yet",
      "description": "Blog posts will appear here soon."
    },
    "readingTime": "{minutes} min read"
  },
  "BlogDetail": {
    "breadcrumb": {
      "home": "Home",
      "blog": "Blog"
    },
    "meta": {
      "readTime": "{minutes} min read"
    },
    "navigation": {
      "backToBlog": "Back to Blog"
    }
  }
}
```

### 3. Update vi.json

Add matching Vietnamese keys:
```json
{
  "Layout": {
    "navigation": {
      "blog": "Blog"
    }
  },
  "BlogPage": {
    "hero": {
      "title": "Blog Của Tôi",
      "subtitle": "Suy nghĩ cá nhân, chiêm nghiệm và trải nghiệm cuộc sống"
    },
    "filter": {
      "all": "Tất cả",
      "mood": "Tâm trạng"
    },
    "noPosts": {
      "title": "Chưa Có Bài Viết",
      "description": "Bài viết blog sẽ xuất hiện ở đây sớm."
    },
    "readingTime": "{minutes} phút đọc"
  },
  "BlogDetail": {
    "breadcrumb": {
      "home": "Trang Chủ",
      "blog": "Blog"
    },
    "meta": {
      "readTime": "{minutes} phút đọc"
    },
    "navigation": {
      "backToBlog": "Quay về Blog"
    }
  }
}
```

## Todo List
- [ ] Add `blog` to `navigation` in en.json
- [ ] Add `BlogPage` and `BlogDetail` namespaces to en.json
- [ ] Add matching keys to vi.json
- [ ] Add Blog link to HeaderNav.tsx navLinks array
- [ ] Verify nav renders correctly in both locales
- [ ] Test mobile menu includes Blog link

## Success Criteria
- "Blog" appears in nav bar (desktop + mobile)
- Blog tab highlights when on `/[locale]/blog` pages
- All blog UI strings localized (en + vi)
- No missing i18n keys warnings
- Existing nav links unaffected
