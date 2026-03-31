---
title: "Admin Blog CRUD"
description: "Add blog creation, editing, import and management for admin via web UI"
status: complete
priority: P1
effort: 8h
branch: master
tags: [feature, backend, frontend, database, blog]
created: 2026-03-30
completed: 2026-03-30
---

# Admin Blog CRUD

## Overview

Extend Article model with `type` field to support blog posts in DB. Create separate `/api/blog` endpoints and `/admin/blog` UI for admin to create, edit, import, and manage blog posts. Update blog frontend to read from DB instead of files.

## Key Decisions (from brainstorm)

- **Storage:** PostgreSQL only (no file-based)
- **Model:** Extend Article (add `type`, `mood`, `readingTime`)
- **Workflow:** Admin direct publish (Draft ↔ Published)
- **API:** Separate `/api/blog` routes
- **UI:** `/admin/blog` pages

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Schema & Migration | Complete | 1.5h | [phase-01](./phase-01-schema-migration.md) |
| 2 | Blog API Endpoints | Complete | 2.5h | [phase-02](./phase-02-blog-api.md) |
| 3 | Admin Blog UI | Complete | 2.5h | [phase-03](./phase-03-admin-blog-ui.md) |
| 4 | Blog Frontend Update | Complete | 1h | [phase-04](./phase-04-blog-frontend-update.md) |
| 5 | i18n & Testing | Complete | 0.5h | [phase-05](./phase-05-i18n-testing.md) |

## Dependencies

- Phase 1 → Phase 2 (API needs schema)
- Phase 2 → Phase 3 (UI needs API)
- Phase 2 → Phase 4 (Frontend needs API)
- Phase 3 & 4 can run in parallel after Phase 2
- Phase 5 after all phases

## Brainstorm Report

[brainstormer-260330-admin-blog-crud.md](../reports/brainstormer-260330-admin-blog-crud.md)
