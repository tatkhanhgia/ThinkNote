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
// Note: Don't use React.FC pattern; use function declaration instead

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = '' }: SearchBarProps) {
  // Component implementation
  return <div className={className}>{/* content */}</div>;
}
```

### Client Components with Navigation & State

For client components that manage interaction state (navigation, modals, dropdowns):

```typescript
// File: src/components/ui/HeaderNav.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface HeaderNavProps {
  locale: string;
}

export default function HeaderNav({ locale }: HeaderNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Use usePathname for detecting active routes
  const isActive = (href: string) => {
    const exactHome = `/${locale}`;
    if (href === exactHome) return pathname === exactHome || pathname === `${exactHome}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Manage focus and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop: hidden below lg breakpoint */}
      <nav className="hidden lg:flex items-center gap-8">
        {/* nav items */}
      </nav>

      {/* Mobile: toggle button with Escape key support */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-menu"
      >
        {/* menu icon */}
      </button>

      {/* Mobile: fixed dropdown menu (z-50 to stay above content) */}
      {mobileOpen && (
        <div id="mobile-nav-menu" className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md z-50">
          {/* dropdown content */}
        </div>
      )}
    </>
  );
}
```

**Key Patterns:**
- Use `usePathname()` to detect active routes (replaces manual prop passing)
- Separate desktop/mobile UI via `hidden lg:flex` and `lg:hidden`
- Fixed positioning with `z-50` for dropdowns above sticky headers
- `aria-expanded`, `aria-controls` for accessibility
- Escape key handling for closing dropdowns

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

## Database Patterns (Prisma)

### Using Prisma Client
```typescript
import { prisma } from '@/lib/prisma';  // Client instance

// Create
const user = await prisma.user.create({
  data: { email, name, role: 'user' }
});

// Read
const article = await prisma.article.findUnique({
  where: { id },
  include: { author: true }
});

// Update
await prisma.article.update({
  where: { id },
  data: { status: 'PUBLISHED' }
});

// Delete
await prisma.article.delete({ where: { id } });
```

### Authentication Guards
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth-guard';

// Protect route (require authentication)
export async function POST(req: Request) {
  const user = await requireAuth(req);
  // user is guaranteed; throws 401 if not authenticated
  const article = await createArticle(req, user.id);
  return NextResponse.json(article);
}

// Protect route (require admin role)
export async function POST(req: Request) {
  const user = await requireAdmin(req);
  // user is guaranteed to have role='admin'; throws 403 otherwise
  // ...
}
```

### Community Article Patterns
```typescript
// Check ownership before edit/delete
const article = await prisma.article.findUnique({ where: { id } });
if (article.authorId !== userId && user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// Validate article status workflow
if (article.status === 'PUBLISHED') {
  return NextResponse.json(
    { error: 'Cannot edit published articles' },
    { status: 400 }
  );
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

### API Error Handling with Auth
```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const data = await req.json();
    // Process data
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

Core component styles:

```css
/* Navigation Links */
.nav-link {
  position: relative;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--gray-600);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--primary-600);
  background: rgba(14, 165, 233, 0.1);
}

/* Underline animation on hover */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-500);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 100%;
}

/* Active nav link state (applied via JS) */
.nav-link-active {
  color: var(--primary-600);
  background: rgba(14, 165, 233, 0.08);
}

.nav-link-active::after {
  width: 100%;
}

/* Glass Morphism Effect */
.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Card Hover (minimal lift, no scale) */
.modern-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Typography */
.heading-xl {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.heading-lg {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.heading-md {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  line-height: 1.3;
}
```

**Key Styling Decisions:**
- **Global transitions removed:** Removed `* { transition: all }` for performance; individual elements define their own transitions
- **Nav active state:** Applied via CSS class `.nav-link-active`, detected by JS `usePathname()`
- **Card hover:** `translateY(-4px)` for subtle lift; no scale transform (reduces jank)
- **Glass opacity:** 0.85 for better contrast; backdrop-filter blur for depth

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
gradientFrom: '#3b82f6'
gradientTo: '#8b5cf6'
---

# Article content in Markdown...
```

**Field Details:**
- **title** (string, required): Article title (max 200 chars recommended)
- **description** (string, required): Brief summary for listings (max 160 chars)
- **date** (string, required): ISO format YYYY-MM-DD
- **tags** (array, required): 1+ tags for classification
- **categories** (array, required): 1+ categories (will be auto-translated)
- **gradientFrom** (hex string, optional): Starting color (#xxxxxx format)
- **gradientTo** (hex string, optional): Ending color (#xxxxxx format)

**Validation:**
- All required fields must be present (enforced in FileValidator)
- Tags/categories cannot be empty arrays
- Date must be valid ISO format
- Gradient colors must be valid hex if provided

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

### Test Framework & Setup
- **Framework:** vitest 4.0.8
- **React Testing:** @testing-library/react 16
- **Coverage Target:** 95%+ for Phase 1

### Unit Tests Pattern
- Test behavior, not implementation; Arrange-Act-Assert pattern
- Descriptive test names, focused and small
- Test both success and error paths

### Test Categories
- **Unit Tests:** Posts.ts functions, utility modules, helpers
- **Integration Tests:** API routes, page rendering, data flow
- **Security Tests:** ContentSanitizer, XSS prevention, validation
- **i18n Tests:** Locale detection, translation mapping, bilingual content
- **Error Handling Tests:** Edge cases, error codes, recovery

## Security Considerations

### 5-Layer XSS Prevention Pipeline
1. **Input Validation:** FileValidator.ts checks MIME type, size, frontmatter
2. **Content Sanitization:** ContentSanitizer.ts (isomorphic-dompurify 2.36.0) removes XSS vectors
3. **Style Conversion:** StyleConverter.ts maps only safe HTML to Tailwind classes
4. **React Escaping:** React's default escaping + safe Tailwind classes
5. **Rendering Context:** No dangerouslySetInnerHTML except in sanitized PostContent

**Allowed Elements:** h1-h6, p, code, ul, ol, li, table, blockquote, a, img, strong, em, pre
**Blocked:** script, iframe, style, onX attributes, dangerous URLs

### Authentication & Authorization
- **Setup:** better-auth with email/password provider
- **Session:** 7-day expiry, 1-day refresh window
- **Guards:** Always use `requireAuth()` or `requireAdmin()` in protected routes
- **Ownership:** Verify `article.authorId === userId` before allowing edits
- **Roles:** Check `user.role === 'admin'` for admin-only operations

### File Upload Security
- **Markdown:** Max 10MB, MIME validation (text/markdown, text/plain), base64 encoding
- **Image:** Max 5MB, PNG/JPG/WebP only, magic bytes validation, stored in `public/uploads/`
- **URLs:** Allow http/https/mailto only; block javascript:/data:/vbscript:

### Environment Variables
- Never commit `.env.local`; use `.env.example` for documentation
- Required: DATABASE_URL, SMTP_HOST/PORT/USER/PASS, TRUSTED_ORIGINS

### HTML Sanitization (Community Articles)
- DOMPurify strict mode: strips script tags, event handlers, style tags
- Only whitelisted elements allowed in output

## Linting & Formatting

- **ESLint:** `npm run lint` (next/eslint config)
- Run linting before committing; fix warnings/errors
- Don't suppress ESLint rules without good reason

### Code Review Checklist
- [ ] TypeScript strict mode, no implicit `any`
- [ ] Proper error handling, clear naming
- [ ] No console.log in production code
- [ ] Components under 200 lines, props typed
- [ ] Correct import organization, comments explain "why"

## Commit Messages

Conventional Commit format: `<type>: <description>`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Performance Guidelines

- Memoize expensive calculations, use `useCallback` for stable refs
- Fetch data at page level (Server Components), cache when possible
- Lazy load heavy deps with Next.js dynamic imports
- Monitor bundle size in builds
