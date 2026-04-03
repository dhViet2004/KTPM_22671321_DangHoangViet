# 1. Sử dụng image PHP tích hợp sẵn Apache
FROM php:8.2-apache

# 2. Thiết lập thư mục làm việc mặc định của Apache
WORKDIR /var/www/html

# 3. Copy file vào (để làm bản backup hoặc chạy mặc định)
COPY index.php .

# 4. Apache mặc định chạy cổng 80
EXPOSE 80
