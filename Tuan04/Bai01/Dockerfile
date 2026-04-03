# 1. Sử dụng node:18 làm base image
FROM node:18

# 2. Tạo thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file mã nguồn vào container
COPY app.js .

# 4. Mở cổng 3000
EXPOSE 3000

# 5. Lệnh để chạy ứng dụng
CMD ["node", "app.js"]
