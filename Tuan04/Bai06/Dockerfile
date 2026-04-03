# --- STAGE 1: BUILD (Sử dụng bản đầy đủ để cài đặt) ---
FROM node:18 AS build-stage
WORKDIR /app
COPY package*.json ./
# Cài đặt toàn bộ dependencies (bao gồm cả dev-dependencies nếu có)
RUN npm install
COPY . .

# --- STAGE 2: RUN (Sử dụng bản alpine siêu nhẹ để chạy) ---
FROM node:18-alpine
WORKDIR /app

# Chỉ copy những thứ thực sự cần thiết từ Stage 1 sang
# Cụ thể là thư mục node_modules và mã nguồn
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/app.js ./app.js
COPY --from=build-stage /app/package.json ./package.json

EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["node", "app.js"]
