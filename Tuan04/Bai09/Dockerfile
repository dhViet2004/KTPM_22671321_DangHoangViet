# 1. Sử dụng Redis bản mới nhất
FROM redis:latest

# 2. Tạo thư mục chứa cấu hình (tùy chọn, để quản lý cho gọn)
WORKDIR /usr/local/etc/redis

# 3. Copy file cấu hình từ máy Mac vào container
COPY redis.conf .

# 4. Mở cổng mặc định của Redis
EXPOSE 6379

# 5. Chạy Redis và chỉ định file cấu hình cụ thể
CMD ["redis-server", "redis.conf"]
