---
title: "So sánh & hướng dẫn chọn công cụ AI cho vibecode (IDE/CLI & Web)"
description: "Tổng hợp theo ghi chú của bạn và bám chuẩn frontmatter/taxonomy của dự án; có bảng so sánh và sơ đồ quyết định (Mermaid)."
tags: ["AI", "Hướng dẫn", "Tiện Ích", "Năng Suất", "Frontend"]
categories: ["AI", "Tool", "IDE"]
date: "2025-11-14"
gradientFrom: "from-sky-400"
gradientTo: "to-blue-600"
---

# Hướng dẫn chọn công cụ AI cho *vibecode* (IDE/CLI & Web)

> **Nguồn & phạm vi**: Tài liệu này tổng hợp trực tiếp từ ghi chú bạn cung cấp về các công cụ vibecode; không bổ sung benchmark độc lập. Frontmatter tuân theo chuẩn dự án; danh mục và thẻ được chọn từ taxonomy của dự án.

## TL;DR

- **IDE/Terminal**
  - **Cursor**: tổng thể rất mạnh ("khỏi bàn").
  - **Kiro Code (IDE)**: agent tốt, hoàn thiện code nhanh.
  - **Droid CLI (trên IDE được)**: agent tốt.
  - **Amp (dùng trên Cursor)**: tab-mode chưa tốt bằng Cursor; agent *chưa trải nghiệm*.
  - **Gemini CLI**: chỉnh sửa còn khá nhiều lỗi → nên dùng cho dự án không quan trọng/PoC.
  - **OpenCode / Leap**: *chưa sử dụng*.
- **Web**
  - **Lovable**: tạo web sẵn sàng deploy; kết nối Supabase cá nhân; miễn phí 5 token/ngày; **không can thiệp sâu** vào code → hợp vibecode thuần (không cần đọc code).
  - **Tempo**: tương tự Lovable/Emergence nhưng **can thiệp code tốt** tương tự Emergence.
  - **Emergence**: hỗ trợ tạo project front‑end; UI tốt.
  - **CTO.new**: cần link GitHub; có rủi ro dữ liệu → chỉ hợp dự án không quá quan trọng; có **task mode** tự động.
  - **Z.AI (GLM 4.6)**: *chưa trải nghiệm*.

---

## Bảng so sánh — Nhóm IDE/Terminal

| Công cụ | Loại | Agent/Autopilot | Độ tin cậy chỉnh sửa | Mức can thiệp code | Phù hợp dự án quan trọng | Ghi chú |
|---|---|---|---|---|---|---|
| Cursor | IDE | ✅ | ⭐⭐⭐⭐⭐ | Cao | ✅ | "Khỏi bàn" |
| Kiro Code | IDE | ✅ | ⭐⭐⭐⭐☆ | Cao | ✅ | Agent tốt; hoàn thiện nhanh |
| Droid CLI | CLI/IDE | ✅ | — | Trung–Cao | ✅ | Agent tốt |
| Amp (trên Cursor) | IDE (plugin) | — / chưa rõ | ⭐⭐⭐☆☆ | Trung bình | ◑ | Tab-mode chưa tốt bằng Cursor |
| Gemini CLI | CLI | — / chưa rõ | ⭐⭐☆☆☆ | Trung bình | ⚠️ | Chỉ nên dùng cho PoC/dự án không quan trọng |
| OpenCode | — | — | — | — | — | Chưa sử dụng |
| Leap | — | — | — | — | — | Chưa sử dụng |

**Ký hiệu:** ✅ tốt · ◑ trung bình · ⚠️ hạn chế · — chưa rõ.

---

## Bảng so sánh — Nhóm Web

| Công cụ | Loại | Tạo nhanh | Can thiệp code | Triển khai | Rủi ro dữ liệu | Ghi chú |
|---|---|---|---|---|---|---|
| Lovable | Web | ⭐⭐⭐⭐⭐ | Thấp | ⭐⭐⭐⭐⭐ | Thấp–Trung* | Supabase cá nhân; free 5 token/ngày; hợp vibecode thuần |
| Tempo | Web | ⭐⭐⭐⭐☆ | **Tốt** | ⭐⭐⭐⭐☆ | Thấp–Trung* | Tương tự Emergence nhưng can thiệp code tốt |
| Emergence | Web | ⭐⭐⭐⭐☆ | **Tốt** | ⭐⭐⭐⭐☆ | Thấp–Trung* | Mạnh front‑end; UI tốt |
| CTO.new | Web | ⭐⭐⭐⭐☆ | Trung bình | ⭐⭐⭐⭐☆ | **Cao** | Cần link GitHub; có task mode; chỉ hợp dự án không quá quan trọng |
| Z.AI (GLM 4.6) | Web | — | — | — | — | Chưa trải nghiệm |

\* Rủi ro dữ liệu phụ thuộc quyền truy cập bạn cấp. Tránh cấp quyền không cần thiết, nhất là repo private.

---

## Bảng mô hình (Model) — nếu biết

| Công cụ | Mô hình/Model |
|---|---|
| Z.AI | GLM 4.6 |
| Khác | (Chưa xác định trong ghi chú) |

---

## Sơ đồ quyết định (Mermaid)

```mermaid
flowchart TD
    A[Bạn muốn làm việc ở đâu?] -->|IDE/Terminal| B[Ưu tiên kiểm soát code]
    A -->|Web| C[Ưu tiên tạo/deploy nhanh]
    B --> D{Cần agent tự động?}
    D -->|Có| E[Kiro Code / Droid CLI]
    D -->|Không| F[Cursor (chỉnh sửa chất lượng cao)]
    F --> G[Amp nếu đã dùng Cursor (tab-mode chưa tốt)]
    B --> H[Gemini CLI (PoC; chỉnh sửa còn lỗi)]
    C --> I{Cần can thiệp sâu vào code?}
    I -->|Có| J[Emergence / Tempo]
    I -->|Không| K[Lovable (deploy ngay; 5 token/ngày)]
    C --> L[CTO.new (task mode; cần link GitHub; rủi ro dữ liệu)]
```

---

## Khuyến nghị theo bối cảnh

- **Dự án quan trọng & cần kiểm soát chặt:** *Cursor*; tăng tốc bằng *Kiro Code*/*Droid CLI* nếu cần agent đa bước.
- **Prototype/demo nhanh:** *Lovable* (deploy tức thì) hoặc *Emergence/Tempo* nếu cần can thiệp code.
- **Tự động hoá tác vụ lặp lại:** *Droid CLI* hoặc *Kiro Code*.
- **PoC/Thử nghiệm mô hình:** *Gemini CLI* (tránh cho code quan trọng).

---

## Checklist an toàn dữ liệu

- Không cấp quyền write cho dịch vụ web khi không cần thiết; ưu tiên token **read‑only**/fine‑grained.
- Loại bỏ secrets (API keys, DSN, env) trước khi cho dịch vụ đọc repo.
- Dùng repo sandbox/mirror để thử nghiệm.
- Luôn review **diff** và chạy **test** trước khi merge.

---

## Hồ sơ tóm tắt theo công cụ

- **Gemini CLI** → chỉ nên dùng cho dự án không quan trọng; chỉnh sửa còn khá nhiều lỗi.
- **Amp (trên Cursor)** → tab-mode chưa tốt bằng Cursor; agent *chưa trải nghiệm*.
- **Droid CLI** → agent tốt.
- **OpenCode** → chưa sử dụng.
- **Leap** → chưa sử dụng.
- **Kiro Code (IDE)** → agent tốt; hoàn thiện code nhanh.
- **Cursor** → “khỏi bàn”.
- **CTO.new (web)** → cần link GitHub; rủi ro dữ liệu; phù hợp dự án không quá quan trọng; có **task mode**.
- **Emergence (web)** → mạnh front‑end; UI tốt.
- **Lovable (web)** → deploy ngay; Supabase cá nhân; miễn phí 5 token/ngày; không can thiệp sâu code.
- **Tempo (web)** → tương tự Lovable/Emergence; **can thiệp code tốt** như Emergence.
- **Z.AI (GLM 4.6)** → chưa trải nghiệm.

---

### Phụ lục — Thang định tính (tham khảo)

- ⭐⭐⭐⭐⭐: rất tốt · ⭐⭐⭐⭐☆: tốt · ⭐⭐⭐☆☆: trung bình · ⭐⭐☆☆☆: hạn chế · —: chưa rõ.
