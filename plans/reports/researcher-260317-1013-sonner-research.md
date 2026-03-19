# Sonner Toast Library Research

## 1. Installation
```bash
npm install sonner
```
Alternatives: `pnpm i sonner`, `yarn add sonner`, `bun add sonner`

---

## 2. Next.js App Router Setup
Add to root layout (`app/layout.tsx`):
```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```
Toaster can be placed in server or client components.

---

## 3. Basic API Signatures

```tsx
import { toast } from 'sonner';

// Basic toasts
toast('Message');
toast.success('Success message');
toast.error('Error message');
toast.warning('Warning message');
toast.info('Info message');

// Promise handling
toast.promise(promise, {
  loading: 'Loading...',
  success: (data) => `Success: ${data.name}`,
  error: 'Failed'
});

// Advanced
toast.loading('Loading...');
toast.custom((t) => <JSX />);
```

Common options: `description`, `duration` (ms), `position`, `action`, `icon`, `dismissible`, `onDismiss`

---

## 4. Customization

**Toaster props:**
- **Theme:** `theme="light" | "dark" | "system"` (default: system)
- **Position:** `position="top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"` (default: bottom-right)
- **Duration:** Override per-toast: `toast('msg', { duration: 5000 })`
- **Additional:** `expand`, `closeButton`, `richColors`, `offset`, `visibleToasts`

---

## 5. Testing with Vitest/Jest

**Approach:** Mock the `sonner` module:
```tsx
import { vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    promise: vi.fn((p) => p), // Returns promise for testing
  },
}));
```

**Known Issue:** `toast.promise()` with Jest mocks can fail; workaround: manually handle promise with `.then().catch()` in tests.

**Reset between tests:**
```tsx
afterEach(() => {
  vi.clearAllMocks();
});
```

---

## Key Notes
- Default duration: 4000ms
- Default visible toasts: 3
- Integrates with `next-themes` for theme providers
- Works in server components (can be placed in layout)
- 13M+ weekly npm downloads; used by Cursor, X, Vercel
- Default toast component in shadcn/ui

---

## Sources
- [Sonner Official Docs - Toast](https://sonner.emilkowal.ski/toast)
- [Sonner Official Docs - Toaster](https://sonner.emilkowal.ski/toaster)
- [Sonner GitHub](https://github.com/emilkowalski/sonner)
- [Sonner NPM](https://www.npmjs.com/package/sonner)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
