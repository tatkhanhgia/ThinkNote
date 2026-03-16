# Design Guidelines

## Design System Philosophy

ThinkNote follows a **modern, clean design** approach with:
- **Glass-morphism** effects for depth and sophistication
- **Gradient accents** for visual hierarchy
- **Responsive mobile-first** design
- **High contrast** for readability and accessibility
- **Meaningful animations** for interactive feedback

## Color Palette

### Primary Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|---|
| **Blue** | `#3b82f6` | Primary actions, links, highlights | `blue-500` |
| **Purple** | `#8b5cf6` | Secondary accents, gradient end | `purple-500` |
| **Emerald** | `#10b981` | Success states, positive feedback | `emerald-500` |
| **Amber** | `#f59e0b` | Warning states, caution | `amber-500` |
| **Rose** | `#f43f5e` | Error states, destructive actions | `rose-500` |

### Neutral Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|---|
| **White** | `#ffffff` | Background, content area | `white` |
| **Gray-50** | `#f9fafb` | Subtle background | `gray-50` |
| **Gray-100** | `#f3f4f6` | Light backgrounds | `gray-100` |
| **Gray-400** | `#9ca3af` | Disabled, muted text | `gray-400` |
| **Gray-600** | `#4b5563` | Secondary text | `gray-600` |
| **Gray-800** | `#1f2937` | Primary text | `gray-800` |
| **Gray-900** | `#111827` | Headings | `gray-900` |

### Gradient Combinations

**Primary Gradient** (used in hero, CTAs):
```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
```

**Card Gradients** (optional per article):
```css
/* Example 1: Blue to Purple */
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

/* Example 2: Emerald to Teal */
background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);

/* Example 3: Rose to Pink */
background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
```

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

This provides:
- Native system fonts on each platform
- Fast loading (no font files needed)
- Consistent with OS design language

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **heading-xl** | 2.25rem (36px) | 700 Bold | 1.2 | Page titles, main headings |
| **heading-lg** | 1.875rem (30px) | 700 Bold | 1.2 | Section headings |
| **heading-md** | 1.5rem (24px) | 700 Bold | 1.2 | Subsection headings |
| **heading-sm** | 1.25rem (20px) | 600 SemiBold | 1.3 | Card titles, labels |
| **body** | 1rem (16px) | 400 Regular | 1.6 | Article content, descriptions |
| **small** | 0.875rem (14px) | 400 Regular | 1.5 | Tags, metadata, captions |
| **tiny** | 0.75rem (12px) | 400 Regular | 1.4 | Help text, timestamps |

### Tailwind Classes

```typescript
// Headings
<h1 className="heading-xl text-gray-900">Page Title</h1>
<h2 className="heading-lg text-gray-800">Section</h2>
<h3 className="heading-md text-gray-800">Subsection</h3>

// Body text
<p className="text-base text-gray-700">Article content</p>
<p className="text-sm text-gray-600">Secondary text</p>
<p className="text-xs text-gray-500">Small caption</p>

// Emphasis
<strong className="font-semibold">Important</strong>
<em className="italic">Emphasized</em>
```

## Spacing System

Base unit: **0.25rem (4px)**

| Scale | Value | Usage |
|-------|-------|-------|
| **0** | 0 | No spacing |
| **1** | 0.25rem | Minimal gaps |
| **2** | 0.5rem | Tight spacing |
| **4** | 1rem | Padding, margins |
| **6** | 1.5rem | Component spacing |
| **8** | 2rem | Section padding |
| **12** | 3rem | Large spacing |
| **16** | 4rem | Page sections |

### Common Spacing Patterns

```typescript
// Component padding
<div className="p-4">Content</div>      // 16px all sides
<div className="p-6">Content</div>      // 24px all sides
<div className="px-4 py-6">Content</div> // Horizontal/vertical

// Component gaps
<div className="flex gap-4">Items</div>  // 16px between items
<div className="grid gap-8">Items</div>  // 32px between items

// Margins
<h1 className="mb-6">Title</h1>          // 24px bottom margin
<section className="mt-12">Section</section> // 48px top margin
```

## Glass-Morphism Pattern

Glass-morphism creates a frosted glass effect with transparency and blur.

### Base Glass Class (in globals.css)

```css
.glass {
  @apply bg-white/80 backdrop-blur-sm border border-gray-200;
}
```

### Usage

```typescript
// Header with glass effect
<header className="glass sticky top-0 z-50">
  <nav>Navigation</nav>
</header>

// Card with glass effect
<div className="glass p-6 rounded-lg">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Glass Variations

```typescript
// Stronger blur for more transparency
className="bg-white/70 backdrop-blur-md border border-gray-200"

// Lighter for subtle effect
className="bg-white/90 backdrop-blur-sm border border-gray-200"

// Dark mode variant
className="bg-gray-900/80 backdrop-blur-sm border border-gray-700"
```

## Components & Patterns

### Buttons

#### Primary Button
```typescript
<button className="btn-primary">
  Click Me
</button>

// CSS in globals.css:
// .btn-primary {
//   @apply inline-flex items-center justify-center px-6 py-3
//          bg-blue-600 text-white font-medium rounded-lg
//          hover:bg-blue-700 active:bg-blue-800
//          transition-colors duration-200;
// }
```

Visual States:
- **Rest:** Blue background
- **Hover:** Darker blue
- **Active:** Even darker blue
- **Disabled:** Gray, no hover effect

#### Secondary Button
```typescript
<button className="btn-secondary">
  Secondary Action
</button>

// CSS:
// .btn-secondary {
//   @apply inline-flex items-center justify-center px-6 py-3
//          bg-white/80 backdrop-blur-sm text-gray-700 font-medium
//          rounded-lg border border-gray-200
//          hover:bg-white transition-colors duration-200;
// }
```

#### Text Button (Link Style)
```typescript
<button className="text-blue-600 hover:text-blue-700 font-medium">
  Text Button
</button>
```

### Cards

#### Knowledge Card (Standard)
```typescript
<div className="modern-card p-6 hover:shadow-lg transition-shadow">
  <h3 className="heading-sm text-gray-900 mb-2">
    Article Title
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Description
  </p>
  <div className="flex gap-2 flex-wrap">
    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
      Tag
    </span>
  </div>
</div>
```

#### Category Card (Home Page)
```typescript
<div className="modern-card p-8 group hover:scale-105
                bg-blue-50 border-blue-200">
  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600
                  rounded-lg flex items-center justify-center mb-6
                  group-hover:scale-110 transition-transform">
    <span className="text-2xl">💻</span>
  </div>
  <h3 className="heading-md text-gray-800 mb-3">
    Category Title
  </h3>
  <p className="text-gray-600 mb-6">
    Description
  </p>
</div>
```

### Tags & Badges

```typescript
// Primary tag (blue)
<span className="inline-flex items-center px-2.5 py-0.5
                 rounded-full text-xs font-medium
                 bg-blue-100 text-blue-800">
  JavaScript
</span>

// Category tag (purple)
<span className="inline-flex items-center px-2.5 py-0.5
                 rounded-full text-xs font-medium
                 bg-purple-100 text-purple-800">
  Frontend
</span>

// Success tag (emerald)
<span className="inline-flex items-center px-2.5 py-0.5
                 rounded-full text-xs font-medium
                 bg-emerald-100 text-emerald-800">
  Complete
</span>
```

### Search Results

```typescript
// Search result item
<div className="flex items-start gap-3 px-3 py-3
                hover:bg-gray-50 rounded-lg transition-colors">
  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
  <div className="flex-1 min-w-0">
    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
      Article Title
    </h4>
    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
      Description preview...
    </p>
  </div>
</div>
```

### Navigation Elements

```typescript
// Navigation link (active)
<a href="/en/topics" className="text-blue-600 font-medium border-b-2 border-blue-600">
  Topics
</a>

// Navigation link (inactive)
<a href="/en/categories" className="text-gray-600 hover:text-gray-900 font-medium">
  Categories
</a>

// Breadcrumb
<nav className="text-sm text-gray-600">
  <a href="/" className="hover:text-gray-900">Home</a>
  <span className="mx-2">/</span>
  <a href="/topics" className="hover:text-gray-900">Topics</a>
  <span className="mx-2">/</span>
  <span className="text-gray-900">Current Page</span>
</nav>
```

## Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| **base** | 0px+ | Mobile (default) |
| **sm** | 640px+ | Small tablets |
| **md** | 768px+ | Tablets |
| **lg** | 1024px+ | Laptops |
| **xl** | 1280px+ | Large screens |
| **2xl** | 1536px+ | Very large screens |

### Mobile-First Approach

```typescript
// Default: mobile layout
// md: tablet layout
// lg: desktop layout

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablets, 3 on desktop */}
</div>

<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  {/* Smaller on mobile, larger on desktop */}
</h1>

<div className="flex flex-col md:flex-row gap-4">
  {/* Stacked on mobile, side-by-side on desktop */}
</div>
```

### Common Responsive Patterns

```typescript
// Container with responsive padding
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  Content
</div>

// Grid that adapts
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>

// Navigation that hides on mobile
<nav className="hidden md:flex gap-6">
  Links
</nav>

// Mobile menu button
<button className="md:hidden">
  Menu
</button>
```

## Animations & Transitions

### Duration Scales

| Duration | Time | Usage |
|----------|------|-------|
| **fast** | 100ms | Quick feedback |
| **normal** | 200-300ms | Standard transitions |
| **slow** | 500ms | Noticeable animations |

### Transition Classes

```typescript
// Color transition
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
  Hover me
</button>

// Transform transition
<div className="scale-100 hover:scale-105 transition-transform duration-200">
  Scale effect
</div>

// Shadow transition
<card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
  Hover for shadow
</card>

// Opacity transition
<div className="opacity-100 hover:opacity-80 transition-opacity duration-200">
  Fade on hover
</div>

// Combined transitions
<div className="transition-all duration-200">
  Animate all properties
</div>
```

### Custom Animations (if needed)

In `globals.css`:
```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  @apply animate-in;
  animation: slideIn 0.3s ease-out;
}
```

## Accessibility Guidelines

### Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text:** Minimum 3:1 contrast ratio
- **All text on colored backgrounds:** Meet WCAG AA standard

### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Focusable button
</button>

// Tab order should be logical
<form>
  <input type="text" /> {/* Tab first */}
  <input type="email" /> {/* Tab second */}
  <button type="submit">Submit</button> {/* Tab third */}
</form>
```

### ARIA Labels

```typescript
// For icon buttons, always provide aria-label
<button aria-label="Close menu" className="hover:bg-gray-100">
  ✕
</button>

// For search results, use semantic HTML
<nav aria-label="search results">
  {results.map(result => (
    <article key={result.id}>
      <h3>{result.title}</h3>
    </article>
  ))}
</nav>
```

### Focus Indicators

```typescript
// Always show focus indicators
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Custom focus style
<button className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  Click me
</button>
```

## Imagery Guidelines

### Images

- **Use alt text** for all images
- **Optimize file size:** Use WebP format when possible
- **Use Next.js Image component:** Automatic optimization

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.webp"
  alt="Descriptive alt text"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### Icons

- Use **inline SVGs** for consistency
- Ensure **sufficient size:** Minimum 24x24px for interactive icons
- **Match color scheme:** Use current text color or explicit colors

```typescript
// Icon button
<button className="p-2 hover:bg-gray-100 rounded-lg">
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
</button>
```

## Dark Mode (Future Enhancement)

When dark mode is added, use:

```typescript
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">Heading</h1>
  <p className="text-gray-600 dark:text-gray-300">Text</p>
</div>
```

## Form Elements

### Input Fields

```typescript
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all duration-200"
/>
```

### Textareas

```typescript
<textarea
  placeholder="Enter content..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             resize-vertical min-h-32"
/>
```

### Select Dropdowns

```typescript
<select className="px-4 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option>Select an option</option>
  <option value="1">Option 1</option>
</select>
```

## Empty States

```typescript
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
  <p className="text-gray-600 text-center max-w-sm">
    Try adjusting your search terms or filters to find what you're looking for.
  </p>
</div>
```

## Error States

```typescript
// Error input
<input
  type="email"
  className="border-rose-500 focus:ring-rose-500"
  aria-invalid="true"
/>

// Error message
<p className="text-sm text-rose-600 font-medium">
  Please enter a valid email address
</p>

// Error alert
<div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
  <h4 className="font-semibold text-rose-900 mb-1">Error occurred</h4>
  <p className="text-sm text-rose-800">Something went wrong. Please try again.</p>
</div>
```

## Design Tokens Summary

| Token | Value |
|-------|-------|
| **Primary Color** | Blue (#3b82f6) |
| **Secondary Color** | Purple (#8b5cf6) |
| **Text Color** | Gray-900 (#111827) |
| **Background** | White (#ffffff) |
| **Border Radius** | 8px (rounded-lg) |
| **Shadow** | Small (shadow-sm), Medium (shadow-md), Large (shadow-lg) |
| **Transition Time** | 200ms (duration-200) |
| **Font Family** | System fonts (sans-serif) |
| **Base Font Size** | 16px (1rem) |

---

**Last Updated:** March 2026
