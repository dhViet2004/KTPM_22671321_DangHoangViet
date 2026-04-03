# 1. Sử dụng image golang chính thức bản alpine cho nhẹ
FROM golang:1.21-alpine

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Copy file mã nguồn vào container
COPY main.go .

# 4. Biên dịch ứng dụng Go thành file thực thi tên là "main"
RUN go build -o main main.go

# 5. Thông báo cổng sử dụng
EXPOSE 8080

# 6. Chạy file thực thi đã build ở bước 4
CMD ["./main"]
