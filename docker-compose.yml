# --- GIAI ĐOẠN 1: BUILDER (Người thợ xây) ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Cài đặt dependencies (Tận dụng cache lớp này nếu package.json không đổi)
COPY package*.json ./
# Dùng 'ci' để cài đúng version khóa trong lock file -> Ổn định
RUN npm ci 

# 2. Copy toàn bộ code và Build
COPY . .
# Lệnh này sẽ tạo ra folder build (thường là .next hoặc dist hoặc build)
RUN npm run build 


# --- GIAI ĐOẠN 2: RUNNER (Người vận chuyển) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Thiết lập biến môi trường Production
ENV NODE_ENV=production

# 3. Chỉ lấy những thứ cần thiết từ giai đoạn Builder
# Copy file quản lý gói
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Copy thư mục đã build (Tùy framework của bạn mà sửa tên folder này nhé)
# Ví dụ Next.js là .next, React thường là build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 4. Mở cổng và chạy
EXPOSE 3000
CMD ["npm", "start"]