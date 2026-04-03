FROM python:3.9-slim

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Định nghĩa biến môi trường mặc định (Yêu cầu bài tập)
ENV APP_ENV=development

# 4. Copy mã nguồn vào
COPY app.py .

# 5. Chạy ứng dụng
CMD ["python", "app.py"]