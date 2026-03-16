# Code Standards & Conventions

## TypeScript Standards

### Strict Mode
All code uses TypeScript strict mode (`"strict": true` in tsconfig.json):
- All variables require explicit type annotations or inference
- Null checks required before accessing properties
- Implicit `any` types forbidden
- Use union types for optional values: `string | undefined`

### Type Declarations

```typescript
// GOOD: Explicit types
function getSortedPostsData(locale: string = 'en'): PostData[] {
  // ...
}

const posts: PostData[] = [];
const count: number = 0;
const isActive: boolean = true;

// BAD: Implicit any
function getData(locale) {  // Error: implicit any
  return [];
}
```

### Interfaces vs Types
- Use `interface` for object shapes (extendable, good for components)
- Use `type` for unions, tuples, or when you need `&` intersection
- Always export types that are used across modules

```typescript
// Shared across modules - interface
export interface PostData {
  id: string;
  title: string;
  date: string;
}

// Component props - interface
interface SearchBarProps {
  className?: string;
}

// Union type - type alias
type Locale = 'en' | 'vi';
type PostOrNull = PostData | null;
```

### Path Aliases
Always use `@/` alias instead of relative paths:

```typescript
// GOOD
import { getSortedPostsData } from '@/lib/posts';
import SearchBar from '@/components/ui/SearchBar';
import { useTranslations } from 'next-intl';

// BAD
import { getSortedPostsData } from '../../../lib/posts';
import SearchBar from '../../components/ui/SearchBar';
```

## React & Component Patterns

### Server Components (Default)
Next.js App Router uses Server Components by default. Use them for:
- Data fetching directly in components
- Access to databases, files, sensitive credentials
- Large dependencies
- Page-level components

```typescript
// src/app/[locale]/page.tsx - Server Component
import { getSortedPostsData } from '@/lib/posts';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const posts = await getSortedPostsData(params.locale);
  return <div>{/* render posts */}</div>;
}
```

### Client Components
Use `'use client'` for:
- Event handling (onClick, onChange, onFocus)
- React hooks (useState, useEffect, useRef)
- Browser APIs (localStorage, window)
- Interactive features (search, filtering, modals)

```typescript
// src/components/ui/SearchBar.tsx - Client Component
'use client';

import { useState, useEffect } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Browser-only logic
  }, []);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

### Component Naming & File Structure

```typescript
// File: src/components/ui/SearchBar.tsx
// Pattern: PascalCase filename = PascalCase component name

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  // Component implementation
  return <div className={className}>{/* content */}</div>;
};

export default SearchBar;
```

### Props Pattern
- Always define interface for props
- Mark optional props with `?`
- Use default parameters instead of defaultProps

```typescript
interface PostCardProps {
  title: string;
  description: string;
  category?: string;
  className?: string;
}

export default function PostCard({
  title,
  description,
  category,
  className = '',
}: PostCardProps) {
  return <div className={className}>{/* content */}</div>;
}
```

### No Prop Drilling - Use Composition
For deeply nested content, use component composition:

```typescript
// GOOD: Composition
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// BAD: Prop drilling
export function Layout({
  title,
  description,
  tags,
  categories,
  content,
}: LayoutProps) {
  // Props passed down multiple levels
}
```

## File Naming Conventions

### TypeScript/TSX Files
- **Component files:** PascalCase (e.g., `SearchBar.tsx`, `PostContent.tsx`)
- **Utility files:** camelCase or kebab-case (e.g., `posts.ts`, `markdown-utils.ts`)
- **Page files:** Use dynamic route notation (e.g., `[locale]`, `[topic]`, `[category]`)
- **API routes:** kebab-case (e.g., `route.ts` in API directory)

```
src/
├── components/ui/
│   ├── SearchBar.tsx           # Component - PascalCase
│   ├── PostContent.tsx         # Component - PascalCase
│   └── LanguageSwitcher.tsx    # Component - PascalCase
├── lib/
│   └── posts.ts                # Utility - camelCase
├── app/
│   └── [locale]/
│       ├── topics/
│       │   └── [topic]/page.tsx    # Dynamic route - snake-case in brackets
│       └── api/posts/route.ts      # API route
```

### Markdown Content Files
- **Format:** kebab-case with .md extension
- **Content:** Articles in `src/data/[locale]/`
- **Example:** `react-basics.md`, `typescript-setup.md`, `java-fundamentals.md`

## Import Organization

Order imports consistently:

1. **External packages** (node_modules)
2. **Next.js / next-intl imports**
3. **Internal absolute imports** (@/)
4. **Blank line separating groups**

```typescript
// 1. External packages
import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';

// 2. Next.js & next-intl
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

// 3. Internal absolute imports
import { getSortedPostsData } from '@/lib/posts';
import SearchBar from '@/components/ui/SearchBar';
import { PostData } from '@/lib/posts';
```

## Comments & Documentation

### JSDoc for Exported Functions
```typescript
/**
 * Fetches all posts for a given locale, sorted by date descending.
 * @param locale - The locale code ('en' or 'vi')
 * @returns Array of posts with metadata (no HTML content)
 */
export function getSortedPostsData(locale: string = 'en'): PostData[] {
  // ...
}
```

### Inline Comments
- Explain "why", not "what"
- Keep comments close to the code they describe
- Remove commented-out code (use git history instead)

```typescript
// GOOD: Explains intent
// Remove leading/trailing whitespace and replace with hyphens for URL safety
const slug = text.trim().toLowerCase().replace(/\s+/g, '-');

// BAD: Explains what code does (obvious)
// Loop through posts array
for (const post of posts) {
  // ...
}

// BAD: Stale commented code
// const oldFunction = () => { ... };
```

### Type Comments
Use TypeScript interfaces instead of JSDoc type comments:

```typescript
// GOOD: TypeScript interface
interface PostData {
  id: string;
  title: string;
  date: string;
}

function getPost(id: string): PostData {
  // ...
}

// OUTDATED: JSDoc (less readable with TypeScript)
/**
 * @param {string} id
 * @returns {{id: string, title: string, date: string}}
 */
function getPost(id) {
  // ...
}
```

## Error Handling

### Try-Catch Pattern
Always catch file system errors and API errors:

```typescript
export function getSortedPostsData(locale: string = 'en'): PostData[] {
  const localePostsDirectory = path.join(postsDirectory, locale);
  let fileNames: string[] = [];

  try {
    fileNames = fs.readdirSync(localePostsDirectory);
  } catch (err) {
    console.error("Error reading posts directory:", localePostsDirectory, err);
    return [];  // Return empty array on error
  }

  // Continue processing
}
```

### API Error Handling
```typescript
export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const posts = getSortedPostsData(params.locale);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

## Code Organization & File Size

### Maximum File Size: 200 Lines
Large files should be split:
- **Components:** Extract sub-components to separate files
- **Utils:** Break large utility files into focused modules
- **Pages:** Use separate client components for interactive sections

### Example: Refactoring Large Component
```typescript
// GOOD: Split into focused components
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <CTASection />
    </>
  );
}

// BAD: Single 800+ line component
export default function HomePage() {
  // Hero, stats, categories, CTA all in one file
}
```

## Tailwind CSS Conventions

### Class Organization
Order Tailwind classes logically:
1. **Layout:** flex, grid, block, etc.
2. **Sizing:** w-, h-, max-w-, etc.
3. **Spacing:** p-, m-, gap-, etc.
4. **Colors:** bg-, text-, border-, etc.
5. **Typography:** text-sm, font-bold, etc.
6. **Interactive:** hover:, focus:, etc.
7. **Responsive:** sm:, md:, lg:, etc.

```typescript
// GOOD: Organized class ordering
<div className="flex flex-col gap-4 w-full max-w-2xl mx-auto p-6 bg-white rounded-lg hover:shadow-lg transition-shadow md:flex-row">
  {/* content */}
</div>

// BAD: Random class order
<div className="hover:shadow-lg p-6 md:flex-row flex gap-4 bg-white w-full rounded-lg max-w-2xl flex-col transition-shadow mx-auto">
  {/* content */}
</div>
```

### Custom CSS Classes (in globals.css)
```css
/* Component-level abstractions */
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors;
}

.glass {
  @apply bg-white/80 backdrop-blur-sm border border-gray-200;
}

.heading-xl {
  @apply text-4xl md:text-5xl font-bold leading-tight;
}

.heading-lg {
  @apply text-3xl md:text-4xl font-bold leading-tight;
}

.heading-md {
  @apply text-2xl md:text-3xl font-bold leading-tight;
}
```

### Responsive Design Pattern
- **Mobile-first:** Default styles apply to all sizes
- **Breakpoints:** Use md:, lg:, xl: for larger screens

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on medium, 3 on large */}
</div>
```

## Markdown Content Standards

### YAML Frontmatter (Required)
Every markdown file must include:

```yaml
---
title: Article Title Here
description: A brief one-line description of the article
date: 2024-03-17
tags: [tag1, tag2, tag3]
categories: [Category1, Category2]
gradientFrom: '#3b82f6'  # Optional hex color
gradientTo: '#8b5cf6'    # Optional hex color
---

# Article content in Markdown...
```

### Content Format
- Use GitHub Flavored Markdown (GFM)
- Code blocks with syntax highlighting:
  ```typescript
  const example = 'code';
  ```
- Tables for structured data
- Lists (ordered and unordered)
- Blockquotes for emphasis
- Mermaid diagrams for visual content

```markdown
## Section Title

Here's a paragraph with **bold** and *italic* text.

### Subsection

- Bullet 1
- Bullet 2
  - Nested bullet

```typescript
const code = 'example';
```

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

> **Note:** Important information highlighted as blockquote
```

### Content Best Practices
- Keep articles focused on one topic
- Include practical examples
- Add code snippets where helpful
- Link to related articles (if available)
- Use clear headings for navigation
- Keep line length reasonable (80-120 chars)

## Testing Standards

### Unit Tests Pattern
When writing tests:
- Test behavior, not implementation
- Use descriptive test names
- Keep tests focused and small
- Arrange-Act-Assert pattern

```typescript
describe('getSortedPostsData', () => {
  it('should return posts sorted by date descending', () => {
    // Arrange
    const locale = 'en';

    // Act
    const posts = getSortedPostsData(locale);

    // Assert
    expect(posts[0].date).toBeGreaterThanOrEqual(posts[1].date);
  });
});
```

## Security Considerations

### XSS Prevention
- **Aware:** remark-html uses `sanitize: false` (trusted content only)
- **Implications:** User-generated content not supported
- **Mitigation:** All markdown content is git-controlled

### Environment Variables
- Never commit `.env.local` files
- Use `.env.example` for documentation
- Reference `.env.example` in deployment docs

### Trusted Content Only
- This application assumes all markdown content is from trusted sources
- Do not enable user-generated markdown without proper sanitization

## Linting & Formatting

### ESLint Configuration
Uses next/eslint config (built into Next.js):

```bash
npm run lint
```

### Pre-commit Best Practices
- Run linting before committing
- Fix warnings and errors
- Don't suppress ESLint rules without good reason

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] No implicit `any` types
- [ ] Proper error handling
- [ ] Clear variable/function names
- [ ] No console.log in production code
- [ ] Tailwind classes properly ordered
- [ ] Components under 200 lines
- [ ] Props properly typed
- [ ] Correct import organization
- [ ] Comments explain "why", not "what"

## Commit Message Standards

Use Conventional Commit format:

```
feat: add search functionality to knowledge base
fix: resolve timezone issue in article dates
docs: update codebase documentation
refactor: simplify markdown processing logic
test: add unit tests for posts.ts utility functions
chore: update dependencies to latest versions
```

Format: `<type>: <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Performance Guidelines

### Component Performance
- Memoize expensive calculations
- Use `useCallback` for stable function references
- Lazy load components when appropriate

### Data Fetching
- Fetch data at page level (Server Components)
- Cache results when possible
- Handle loading and error states

### Bundle Size
- Lazy load heavy dependencies
- Use Next.js dynamic imports for code splitting
- Monitor bundle size in builds

## Documentation Standards

### README or Contributing Guide
When applicable, document:
- Setup instructions
- How to add new content
- Build and deployment process
- Common troubleshooting steps

### Code Comments
- Document complex algorithms
- Explain business logic
- Note performance-critical sections
- Link to related documentation
