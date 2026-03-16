# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ThinkNote** is a personal knowledge base built with Next.js. It's a searchable, organized repository for technical notes and knowledge across multiple locales (English and Vietnamese). Content is authored in Markdown files with YAML frontmatter and organized by categories and tags.

## Development Commands

- **`npm run dev`** - Start development server at `http://localhost:3000`
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run lint`** - Run ESLint

## Architecture Overview

### Technology Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with PostCSS
- **i18n:** `next-intl` for English/Vietnamese localization
- **Markdown:** `remark`, `remark-gfm`, `remark-html`, `gray-matter`
- **Diagram Support:** Mermaid

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-specific pages (en, vi)
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Locale layout with header/footer
│   │   ├── search/               # Full-text search pages
│   │   ├── categories/           # Category browsing pages
│   │   ├── tags/                 # Tag browsing pages
│   │   └── topics/               # Individual article detail page (renamed from [topic])
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect to default locale
│   └── not-found.tsx             # Custom 404 page
├── lib/
│   └── posts.ts                  # Core post data loading and filtering logic
├── components/ui/                # Reusable React components
│   ├── SearchBar.tsx
│   ├── LanguageSwitcher.tsx
│   ├── PostContent.tsx           # Renders markdown with HTML
│   ├── KnowledgeCard.tsx
│   └── CustomButton.tsx
├── data/                         # Markdown content files
│   ├── en/                       # English articles
│   ├── vi/                       # Vietnamese articles (translated)
│   └── [root]                    # Legacy articles (migrating to locale folders)
├── messages/                     # i18n translation files
│   ├── en.json
│   └── vi.json
├── middleware.ts                 # Locale detection middleware
├── i18n.ts                       # i18n configuration
└── styles/globals.css            # Global Tailwind CSS
```

### Key Data Flow

1. **Content Source:** Markdown files in `src/data/[locale]/` with YAML frontmatter
2. **Post Metadata:** Each markdown file must include frontmatter with:
   ```
   ---
   title: Article Title
   description: Brief description
   date: YYYY-MM-DD
   tags: [tag1, tag2]
   categories: [Category1]
   gradientFrom: optional-hex-color
   gradientTo: optional-hex-color
   ---
   ```
3. **Loading:** `src/lib/posts.ts` provides utility functions:
   - `getSortedPostsData(locale)` - Get all posts for a locale, sorted by date descending
   - `getPostData(id, locale)` - Get single post with rendered HTML
   - `getAllPostIds(locales)` - Get all post IDs for static generation
   - `getAllCategories(locale)` / `getPostsByCategory(slug, locale)` - Category filtering
   - `getAllTags(locale)` / `getPostsByTag(tag, locale)` - Tag filtering
   - `slugify(text)` - Convert category/tag names to URL-safe slugs

### Internationalization (i18n)

- **Locales:** English (`en`) and Vietnamese (`vi`)
- **Default Locale:** English
- **Implementation:** `next-intl` middleware in `src/middleware.ts`
- **Translations:** `src/messages/{locale}.json` for UI strings (Layout, navigation, footer)
- **Category Translation:** `src/lib/posts.ts` includes a `categoryTranslationMap` for category names
- **Routing:** All routes are prefixed with `[locale]` (e.g., `/en/categories`, `/vi/categories`)
- **Language Switching:** `LanguageSwitcher` component preserves current page path when switching locales

### Page Generation

Pages use **dynamic parameters** for flexibility:
- **Static (with ISR):** Home, categories, tags pages
- **Dynamic:** Individual posts, category detail pages, tag detail pages
- Path patterns use `[locale]` for all pages, enabling locale-specific content

### Component Patterns

- **PostContent.tsx** - Renders markdown HTML; sanitization set to `false` (allow HTML injection)
- **SearchBar.tsx** - Full-text search across all posts in current locale
- **LanguageSwitcher.tsx** - Locale switcher maintaining current page context
- **KnowledgeCard.tsx** - Card component for post display

### Styling

- Tailwind CSS with custom classes
- Glass-morphism design in header (`glass` class)
- Gradient backgrounds for cards
- Responsive design (mobile-first with `md:`, `lg:` breakpoints)

## Common Tasks

### Adding a New Article
1. Create a `.md` file in `src/data/en/` (or `src/data/vi/` for Vietnamese)
2. Include required YAML frontmatter (title, description, date, tags, categories)
3. Write content in Markdown with GitHub Flavored Markdown support
4. Optional: Add `gradientFrom` and `gradientTo` for card styling

### Adding a New Category
1. Add category name to an article's frontmatter `categories` array
2. Optionally add translation to `categoryTranslationMap` in `src/lib/posts.ts`
3. The category automatically appears in the categories page

### Changing UI Translations
1. Edit `src/messages/en.json` or `src/messages/vi.json`
2. Use keys like `Layout.navigation.home`, `Layout.footer.copyright`
3. Keys are used with `useTranslations()` hook in components

### Styling the Site
- Global CSS: `src/styles/globals.css`
- Component classes: Edit component `.tsx` files directly
- Tailwind config: Check `tailwind.config.js` (not shown but implied)

## Important Notes

- **Markdown Processing:** `remark-html` is configured with `sanitize: false`, meaning raw HTML in markdown is rendered (potential XSS risk if content is user-generated)
- **Category Slugs:** Generated via `slugify()` function; diacritics are removed (e.g., "Lập trình" → "lap-trinh")
- **Content Organization:** English articles in `src/data/en/` serve as the canonical set; Vietnamese translations go in `src/data/vi/`
- **Static Generation:** The app uses dynamic pages, but Next.js caches aggressively; rebuild for new content
- **Search:** Uses client-side search across loaded posts; no backend search index
