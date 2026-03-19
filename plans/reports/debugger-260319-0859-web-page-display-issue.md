# Debugger Report: Web Page Display Issue
**Date:** 2026-03-19 09:00 | **Severity:** High (2 pages returning HTTP 500)

---

## Executive Summary

Two pages — `/en/markdown-import` and `/en/search` — are returning HTTP 500 Server Errors due to missing webpack vendor chunk files in the `.next/server/vendor-chunks/` directory. The dev server (PID 20832, port 3000) is running with an **incomplete `.next` cache** left over from a partial recompile triggered by recent dependency changes.

All other pages (`/en`, `/en/topics`, `/en/categories`, `/en/blog`) are returning HTTP 200 correctly.

---

## Root Cause

**Stale / incomplete `.next` dev cache after `sonner` was added as a new dependency.**

The recent refactor (uncommitted working-tree changes) replaced the custom `NotificationContext`/`NotificationSystem` with `sonner` (a toast library). This introduced `sonner` as a new import in:
- `src/app/[locale]/layout.tsx` (`Toaster` component)
- `src/app/[locale]/markdown-import/page.tsx` (`toast`)
- `src/components/ui/MarkdownImporter.tsx` (`toast`)

When the dev server recompiled pages that use `sonner` (and transitively `@formatjs`, `use-intl`, `intl-messageformat`, `tslib`), it updated the page-level compiled files but **did not regenerate the missing vendor-chunk files**. The resulting state:

| File | Status |
|------|--------|
| `.next/server/app/[locale]/markdown-import/page.js` | Updated (refs missing chunks) |
| `.next/server/app/[locale]/search/page.js` | Updated (refs missing chunks) |
| `.next/server/vendor-chunks/@formatjs.js` | **MISSING** |
| `.next/server/vendor-chunks/sonner.js` | **MISSING** |
| `.next/server/vendor-chunks/use-intl.js` | **MISSING** |
| `.next/server/vendor-chunks/intl-messageformat.js` | **MISSING** |
| `.next/server/vendor-chunks/tslib.js` | **MISSING** |

The error chain: webpack-runtime → page.js → `__webpack_require__("vendor-chunks/@formatjs")` → file not found → 500.

Note: The earlier `esprima.js` error (visible in `topics-after-fix.png` from Mar 17) was a previous instance of the same class of problem, now resolved for the topics page.

---

## Affected Files

- `src/app/[locale]/markdown-import/page.tsx` — uses `toast` from `sonner`
- `src/app/[locale]/layout.tsx` — uses `Toaster` from `sonner`
- `src/components/ui/MarkdownImporter.tsx` — uses `toast` from `sonner`
- `.next/server/vendor-chunks/` — missing 5 chunk files (not source files, generated artifacts)

### Deleted files (part of sonner migration, all references cleaned up):
- `src/contexts/NotificationContext.tsx` (deleted)
- `src/components/ui/NotificationSystem.tsx` (deleted)
- `src/components/ui/__tests__/NotificationSystem.*.test.tsx` (2 files deleted)

---

## Pages Affected

| Route | HTTP Status | Issue |
|-------|-------------|-------|
| `/en` | 200 OK | No issue |
| `/en/topics` | 200 OK | No issue |
| `/en/categories` | 200 OK | No issue |
| `/en/blog` | 200 OK | No issue |
| `/en/markdown-import` | **500 Error** | Missing vendor chunks |
| `/en/search` | **500 Error** | Missing vendor chunks |

---

## Recommended Fix

**Restart the dev server.** This forces Next.js to recompile all pages from scratch, regenerating the vendor chunk files correctly.

```bash
# Kill current dev server (PID 20832 on port 3000)
# Then restart:
npm run dev
```

After restart, visit `/en/markdown-import` and `/en/search` — both should load correctly.

**If the issue persists after restart**, run a clean rebuild:

```bash
# Delete stale cache
rm -rf .next

# Restart dev server
npm run dev
```

**Note:** `npm run build` (production build) completes successfully with no errors — the issue is specific to the dev server's incremental compilation mode.

---

## Additional Notes

- `sonner` v2.0.7 is correctly listed in `package.json` and installed in `node_modules/`
- The `NotificationContext`/`NotificationSystem` migration is complete — no remaining references to the old system in source files
- Build output confirms all 192 static pages generate cleanly
- The `topics-after-fix.png` screenshot (Mar 17 10:48) shows a prior `esprima.js` variant of this same issue, which was already resolved

---

## Unresolved Questions

- Why did the dev server partial-recompile leave vendor chunks in an inconsistent state? This may be a Next.js 14.2.31 incremental compilation bug on Windows (hot-reload deleting shared chunks). Consider filing or checking Next.js issues if it recurs after a clean restart.
