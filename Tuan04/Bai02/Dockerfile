# 1. Sử dụng python:3.9 làm base image
FROM python:3.9

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Copy file app.py vào container
COPY app.py .

# 4. Cài đặt thư viện Flask trực tiếp
RUN pip install flask

# 5. Thông báo cổng sử dụng
EXPOSE 5000

# 6. Lệnh để chạy ứng dụng
CMD ["python", "app.py"]