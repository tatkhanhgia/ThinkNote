# Brainstorm Report: Blog Import Pending Workflow

**Date:** 2026-03-23
**Status:** Finalized
**Approach:** A+ (File-based + Enhanced Frontmatter)

---

## 1. Problem Statement

Hien tai, he thong import markdown cua ThinkNote publish bai viet truc tiep vao `src/data/{locale}/` ngay khi admin upload. Khong co buoc review/kiem duyet trung gian. Yeu cau:

- Chi admin moi duoc import bai viet (da co `requireAuth`)
- Bai viet import vao trang thai pending thay vi publish ngay
- Claude Code (hoac admin) review/phan tich noi dung truoc khi publish
- Admin panel hien thi danh sach bai pending + preview noi dung
- Ho tro reject bai viet (xoa khoi pending)
- Sau khi publish, xoa file pending (khong giu backup)

### Yeu cau dac biet - "Motion do"
User muon Claude Code review ca cac phan tu tuong tac/visual phuc tap (Mermaid diagrams, embedded HTML, animated elements) vi chung can duoc kiem tra rendering thuc te, khong chi validate raw markdown.

---

## 2. Evaluated Approaches

### Approach A: Database Status Field
- Them cot `status` vao DB (Prisma/PostgreSQL)
- **Pros:** Query nhanh, filter de, metadata phong phu
- **Cons:** Pha vo kien truc file-based hien tai, can migration, tang do phuc tap

### Approach B: Separate Pending Directory (File-based)
- Luu pending posts vao `src/data/pending/{locale}/`
- Publish = move file sang `src/data/{locale}/`
- **Pros:** Don gian, nhat quan voi kien truc hien tai
- **Cons:** Thieu metadata review (ai review, khi nao, ket qua gi)

### Approach A+ (RECOMMENDED): File-based + Enhanced Frontmatter
- Ket hop: pending directory + frontmatter mo rong cho metadata review
- **Pros:** Giu kien truc file-based, metadata di kem content, khong can DB migration
- **Cons:** Can strip metadata truoc khi publish (nho, de handle)

### Approach C: Git Branch Workflow
- Moi pending post = 1 branch
- **Pros:** Git-native, co diff/history
- **Cons:** Over-engineering, UX te cho admin panel, cham

**Decision:** Approach A+ -- phu hop nhat voi kien truc file-based hien tai, du manh cho review workflow, tuan thu KISS/YAGNI.

---

## 3. Final Recommended Solution
### 3.1. Directory Structure

```
src/data/
  en/                    # Published English posts
  vi/                    # Published Vietnamese posts
  pending/
    en/                  # Pending English posts
    vi/                  # Pending Vietnamese posts
```

### 3.2. Enhanced Frontmatter Schema

Khi import, file duoc luu vao pending voi frontmatter mo rong:

```yaml
---
title: Article Title
description: Brief description
date: 2026-03-23
tags: [tag1, tag2]
categories: [Category1]
# === Pending Metadata (stripped on publish) ===
_status: pending
_importedAt: 2026-03-23T02:54:00Z
_importedBy: admin@email.com
_reviewNotes: ""
_hasInteractiveContent: true
_interactiveElements: [mermaid, html-embed]
---
```

### 3.3. API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/markdown/import` | POST | Admin | Import file vao pending (modify existing) |
| `GET /api/pending` | GET | Admin | List tat ca pending posts |
| `GET /api/pending/[id]` | GET | Admin | Lay content + rendered HTML cua 1 pending post |
| `POST /api/pending/[id]/publish` | POST | Admin | Move sang data/{locale}/, strip pending metadata |
| `POST /api/pending/[id]/reject` | POST | Admin | Reject: xoa file pending |

### 3.4. Import Flow (Modified)

```
Admin Upload -> API Validate -> Detect Interactive Content ->
Save to pending/{locale}/ -> Add Enhanced Frontmatter ->
Auto-translate (pending for both locales) -> Return success
```

Key changes to existing `POST /api/markdown/import`:
1. Target directory: `src/data/pending/{locale}/` thay vi `src/data/{locale}/`
2. Them pending metadata vao frontmatter
3. Auto-detect interactive content (Mermaid blocks, raw HTML, iframe, script patterns)
4. Auto-translate van chay nhung luu vao `pending/{otherLocale}/`

### 3.5. Interactive Content Detection

Tu dong scan content cho:
- Mermaid code blocks
- `<iframe>`, `<video>`, `<audio>`, `<canvas>` tags
- `<script>` tags (security flag)
- CSS animations (`@keyframes`, `animation:`)
- Inline `<style>` blocks
- Complex HTML structures (tables > 5 rows, nested divs > 3 levels)

Khi phat hien, set `_hasInteractiveContent: true` va liet ke trong `_interactiveElements`.
### 3.6. Admin Panel UI

#### Tab/Section moi trong Admin Dashboard: "Pending Posts"

**List View:**
- Bang hien thi: Title, Locale, Import Date, Has Interactive Content (icon), Actions
- Sort by: date imported (moi nhat truoc)
- Filter by: locale (en/vi), has interactive content
- Actions: Preview, Publish, Reject

**Preview View:**
- Rendered markdown preview (giong trang blog thuc te)
- Sidebar hien thi:
  - Frontmatter metadata (title, tags, categories, etc.)
  - Review notes (editable textarea)
  - Interactive content warnings (neu co)
  - Publish / Reject buttons
- Neu co Mermaid/interactive content: hien warning banner

#### Reject Flow:
- Admin click Reject -> Confirmation dialog -> API xoa file pending
- Optional: reject reason (luu vao log)

#### Publish Flow:
1. Doc file tu `pending/{locale}/`
2. Strip tat ca `_` prefixed frontmatter fields
3. Move file sang `src/data/{locale}/`
4. Xoa file pending
5. Neu co translated version trong pending khac locale -> cung publish
6. Return success + redirect ve list

### 3.7. Library Functions (posts.ts additions)

```typescript
getPendingPosts(locale: string): PostData[]
getPendingPostData(id: string, locale: string): PostData
publishPendingPost(id: string, locale: string): boolean
rejectPendingPost(id: string, locale: string): boolean
detectInteractiveContent(content: string): string[]
stripPendingMetadata(frontmatter: object): object
```

---

## 4. Implementation Considerations

### 4.1. Security
- Tat ca pending API endpoints yeu cau `requireAdmin()` (khong chi `requireAuth()`)
- Path traversal protection giu nguyen tu import route hien tai
- Content sanitization giu nguyen (ContentSanitizer)
- Reject action can confirmation de tranh xoa nham

### 4.2. Performance
- Pending directory thuong nho (< 50 files) -> doc filesystem truc tiep OK
- Preview render markdown on-demand, khong cache
- Khong can pagination cho pending list (low volume)

### 4.3. Edge Cases
- File trung ten giua pending va published -> check truoc khi publish, warn admin
- Auto-translate fail -> van luu original, ghi warning vao `_reviewNotes`
- Concurrent publish (2 admin cung publish 1 bai) -> check file exists truoc khi move
- Empty pending directory -> hien empty state UI

### 4.4. Migration
- Khong can DB migration (file-based)
- Chi can tao `src/data/pending/en/` va `src/data/pending/vi/` directories
- Existing published posts khong bi anh huong
- `.gitignore` co the them `src/data/pending/` neu khong muon commit pending files
---

## 5. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| File system race condition khi publish | Medium | Low | Check exists before move, atomic rename |
| Interactive content detection false positive | Low | Medium | Chi flag/warning, khong block publish |
| Pending files tich tu neu admin quen review | Low | Medium | Them badge count tren admin nav |
| Strip metadata bo sot field | Medium | Low | Regex strip tat ca _ prefixed keys |

---

## 6. Success Metrics

- Admin co the import bai -> bai vao pending (khong publish ngay)
- Admin thay danh sach pending + preview noi dung trong admin panel
- Admin publish -> bai xuat hien tren blog, pending file bi xoa
- Admin reject -> pending file bi xoa, khong anh huong published
- Interactive content duoc detect va flag cho review
- Existing import/publish flow khong bi break

---

## 7. Dependencies

- Existing: `requireAdmin()` auth guard (already implemented)
- Existing: Import API route (`/api/markdown/import`) - can modify
- Existing: Admin layout + dashboard (`/admin/`) - can extend
- Existing: `posts.ts` library functions - can them pending functions
- New: Admin UI components cho pending list + preview

---

## 8. Estimated Effort

| Component | Effort |
|-----------|--------|
| Modify import route -> pending | ~1h |
| Pending API endpoints (list, get, publish, reject) | ~2h |
| Library functions (posts.ts additions) | ~1h |
| Interactive content detection | ~1h |
| Admin UI - Pending list page | ~2h |
| Admin UI - Preview page | ~2h |
| i18n messages (en/vi) | ~30min |
| Testing | ~1.5h |
| **Total** | **~11h** |

---

## 9. Next Steps

1. Tao implementation plan chi tiet (phases)
2. Phase 1: Backend (modify import, pending APIs, library functions)
3. Phase 2: Frontend (admin pending list + preview UI)
4. Phase 3: Testing + edge cases

---

## Unresolved Questions

None - tat ca cau hoi da duoc user tra loi trong phien brainstorm.
