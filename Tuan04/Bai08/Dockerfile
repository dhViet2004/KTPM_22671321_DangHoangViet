# 1. Sử dụng Postgres bản 15 theo yêu cầu
FROM postgres:15

# 2. Thiết lập các biến môi trường bắt buộc cho Postgres
# (Đặt mật khẩu và tên database mặc định)
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=iuh_database

# 3. Copy file SQL vào thư mục tự động chạy của Postgres
COPY init.sql /docker-entrypoint-initdb.d/

# 4. Postgres mặc định chạy cổng 5432
EXPOSE 5432
