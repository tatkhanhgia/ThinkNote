---
title: "Cài Đặt TypeScript với Next.js"
description: "Hướng dẫn từng bước để tích hợp TypeScript vào dự án Next.js của bạn để đảm bảo an toàn kiểu dữ liệu tốt hơn."
tags: ["TypeScript", "Next.js", "Cài Đặt"]
categories: ["Ngôn Ngữ Lập Trình", "DevCore", "Frameworks"]
date: "2023-11-05"
gradientFrom: "from-blue-500"
gradientTo: "to-indigo-500"
---

## Tại sao nên dùng TypeScript?
TypeScript thêm kiểu tĩnh vào JavaScript, giúp phát hiện lỗi sớm trong quá trình phát triển và cải thiện khả năng bảo trì mã nguồn.

## Cài đặt
```bash
npm install --save-dev typescript @types/react @types/node
# hoặc
yarn add --dev typescript @types/react @types/node
```

Tiếp theo, tạo một tệp `tsconfig.json` trong thư mục gốc của dự án. Next.js thường sẽ tự động làm điều này cho bạn.
