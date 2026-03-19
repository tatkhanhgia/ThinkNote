---
title: "Auto-Translate & Auto-Format for Markdown Import"
description: "Add bi-directional EN↔VI translation and full markdown formatting to import feature"
status: complete
priority: P1
effort: 12h
branch: master
tags: [feature, frontend, backend, i18n]
created: 2026-03-17
completed: 2026-03-17
---

# Auto-Translate & Auto-Format for Markdown Import

## Overview

Enhance markdown import to: (1) auto-translate between EN↔VI using `@vitalets/google-translate-api`, saving both locale files; (2) auto-format uploaded markdown to project standards before saving.

## Brainstorm Report

See [brainstorm report](../reports/brainstorm-260317-0845-import-translate-format.md)

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Install deps & create translation service | Complete | 2h | [phase-01](./phase-01-translation-service.md) |
| 2 | Create markdown formatter | Complete | 3h | [phase-02](./phase-02-markdown-formatter.md) |
| 3 | Update import API | Complete | 2h | [phase-03](./phase-03-update-import-api.md) |
| 4 | Update import UI | Complete | 3h | [phase-04](./phase-04-update-import-ui.md) |
| 5 | Add i18n strings & tests | Complete | 2h | [phase-05](./phase-05-i18n-and-tests.md) |

## Dependencies

- `@vitalets/google-translate-api` npm package
- Existing: MarkdownProcessor, ContentSanitizer, ErrorHandler, UndoManager
- Both import surfaces: modal (`MarkdownImporter.tsx`) + page (`markdown-import/page.tsx`)

## Key Decisions

- Use `@vitalets/google-translate-api` (free, unofficial) — can migrate to official later
- Placeholder system preserves markdown syntax during translation
- Format BEFORE translate to ensure clean input
- Both import UIs (modal + page) get the same enhancements

## Validation Log

### Session 1 — 2026-03-17
**Trigger:** Plan validation before implementation
**Questions asked:** 4

#### Questions & Answers

1. **[Risk]** Plan giả định dùng `@vitalets/google-translate-api` (unofficial, free). Nếu API bị block/rate-limit, fallback như thế nào?
   - Options: Return original + warning | Queue retry save sau | Prompt user to retry manually
   - **Answer:** Return original + warning
   - **Rationale:** Non-blocking import — translation failure should never prevent saving original file

2. **[Scope]** Khi translate frontmatter, có nên translate tags và categories không?
   - Options: Không translate tags/categories | Translate dùng categoryTranslationMap | Translate tất cả qua API
   - **Answer:** Không translate tags/categories
   - **Rationale:** Consistency with existing categoryTranslationMap in posts.ts — runtime translation handles display

3. **[Assumptions]** Auto-format có nên sửa heading levels không?
   - Options: Chỉ promote, không demote | Cả promote và fix gaps | Không sửa headings
   - **Answer:** Chỉ promote, không demote
   - **Rationale:** Safe transformation — only promotes to ensure h1 exists, never removes heading depth

4. **[Architecture]** Khi import, nếu file dịch đã tồn tại ở locale kia, xử lý sao?
   - Options: Tạo file với suffix _1, _2 | Hỏi user overwrite hay skip | Ghi đè luôn
   - **Answer:** Tạo file với suffix _1, _2
   - **Rationale:** Reuse existing unique naming logic, no data loss risk

#### Confirmed Decisions
- Translation fallback: return original + warning — never block import
- Tags/categories: keep original EN for both locales — runtime translation handles display
- Heading format: promote only, never demote — safe transformation
- File conflicts: unique suffix naming — reuse existing logic
