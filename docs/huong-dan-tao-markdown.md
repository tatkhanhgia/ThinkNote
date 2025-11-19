---
title: "Hướng Dẫn Tạo Tệp Markdown"
description: "Cách tạo một tệp Markdown với cấu trúc frontmatter phù hợp cho dự án này."
tags: ["hướng dẫn", "markdown", "cấu trúc"]
categories: ["DevCore"]
date: "2025-08-10"
gradientFrom: "from-blue-500"
gradientTo: "to-green-500"
---

## Cách Tạo Tệp Markdown Cho Dự Án

Để đảm bảo tệp Markdown của bạn được hệ thống nhận diện và hiển thị chính xác, mỗi tệp cần có hai phần chính: **Frontmatter** và **Nội dung**.

### 1. Frontmatter

Đây là khối siêu dữ liệu ở đầu mỗi tệp, được viết bằng định dạng YAML và nằm giữa hai dòng `---`.

Cấu trúc frontmatter bao gồm các trường sau:

- `title`: (Bắt buộc) Tiêu đề chính của bài viết.
  - Ví dụ: `title: "Giới Thiệu về Lập Trình Java"`
- `description`: (Bắt buộc) Một mô tả ngắn gọn về nội dung bài viết.
  - Ví dụ: `description: "Hướng dẫn cơ bản về các khái niệm cốt lõi trong lập trình Java."`
- `tags`: (Bắt buộc) Một danh sách các từ khóa (tags) liên quan đến bài viết.
  - Ví dụ: `tags: ["Java", "Lập Trình", "Cơ Bản"]`
- `categories`: (Bắt buộc) Một danh sách các danh mục mà bài viết thuộc về.
  - Ví dụ: `categories: ["DevCore", "Programming Languages"]`
- `date`: (Bắt buộc) Ngày đăng bài, theo định dạng `YYYY-MM-DD`.
  - Ví dụ: `date: "2023-12-25"`
- `gradientFrom` & `gradientTo`: (Bắt buộc) Các lớp CSS của Tailwind để tạo hiệu ứng màu nền gradient cho thẻ bài viết.
  - Ví dụ: `gradientFrom: "from-sky-400"` và `gradientTo: "to-blue-600"`

### 2. Nội dung

Đây là phần nội dung chính của bài viết, được viết bằng cú pháp Markdown tiêu chuẩn ngay sau khối frontmatter.

Bạn có thể sử dụng các thẻ Markdown như `##` cho tiêu đề, `*` hoặc `-` cho danh sách, `**text**` để in đậm, v.v.
