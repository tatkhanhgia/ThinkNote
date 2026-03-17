---
title: "Personal Blog Feature for ThinkNote"
description: "Add personal blog section with warm styling, mood tags, reading time — separated from KB"
status: completed
priority: P1
effort: 6h
branch: master
tags: [feature, frontend, blog]
created: 2026-03-18
completed: 2026-03-18
---

# Personal Blog Feature — Phase 1

## Overview

Add a personal blog section to ThinkNote for sharing life/personal content. Fully separated from KB: own data folder, pages, styling, and components. Warm & Cozy visual distinct from KB's glass-morphism.

## Brainstorm Report

See: [brainstorm report](../reports/brainstorm-260318-0046-personal-blog-feature.md)

## Architecture

- Blog pages at `/[locale]/blog` and `/[locale]/blog/[slug]`
- Data in `src/data/blog/en/` and `src/data/blog/vi/`
- Blog styling scoped via `.blog-layout` CSS wrapper
- Shared header/footer/nav (no route groups needed — KISS)
- Reuse existing: gray-matter, remark pipeline, next-intl, slugify

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Data Layer & Sample Content | Completed | 1.5h | [phase-01](./phase-01-data-layer.md) |
| 2 | Blog Styling (CSS) | Completed | 1h | [phase-02](./phase-02-blog-styling.md) |
| 3 | UI Components | Completed | 1.5h | [phase-03](./phase-03-ui-components.md) |
| 4 | Blog Pages & SEO | Completed | 1.5h | [phase-04](./phase-04-blog-pages.md) |
| 5 | Navigation & i18n | Completed | 0.5h | [phase-05](./phase-05-navigation-i18n.md) |

## Dependencies

- Phase 1 → Phase 2 (styling needs data types)
- Phase 2 → Phase 3 (components use blog CSS)
- Phase 3 → Phase 4 (pages compose components)
- Phase 4 → Phase 5 (nav links to blog pages)

## Simplification from Brainstorm

- **Dropped route groups**: Unnecessary complexity. Blog pages under `[locale]/blog/` work fine with existing layout. CSS scoping via `.blog-layout` class prevents style leakage.
- **No new layout file**: Reuse existing `[locale]/layout.tsx` (shared header/footer). Blog content wrapped in `blog-layout` div.
