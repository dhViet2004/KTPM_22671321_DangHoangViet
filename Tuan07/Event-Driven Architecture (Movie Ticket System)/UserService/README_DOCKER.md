# UserService - Docker Setup

## Quick Start

### 1. Chạy MySQL và RabbitMQ

```bash
docker-compose up -d
```

Kiểm tra trạng thái:

```bash
docker-compose ps
```

### 2. Truy cập Services

- **MySQL**: `localhost:3306` (user: root, pass: root)
- **RabbitMQ Management**: `http://localhost:15672` (user: guest, pass: guest)

### 3. Chạy Ứng dụng

```bash
# Build image
docker build -t userservice .

# Run container
docker run -p 8081:8081 \
  --network userservice-network \
  -e DB_HOST=mysql \
  -e RABBITMQ_HOST=rabbitmq \
  userservice
```

### 4. Chạy Tất Cả Cùng Lúc

```bash
docker-compose up -d --build
```

### 5. Dừng Services

```bash
docker-compose down

# Xóa cả data volumes
docker-compose down -v
```

## Commands Hữu Ích

```bash
# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f mysql
docker-compose logs -f rabbitmq

# Rebuild không cache
docker-compose build --no-cache

# Restart services
docker-compose restart
```

## Network

Tất cả services chạy trong network `userservice-network`:
- Container name `mysql` → host `mysql:3306`
- Container name `rabbitmq` → host `rabbitmq:5672`
- Container name `userservice` → host `userservice:8081`

## Test API

### Cách 1: Postman Collection
Import file `UserService_API.postman_collection.json` vào Postman.

### Cách 2: Script (Windows)
```bash
test-api.bat
```

### Cách 3: Script (Linux/Mac)
```bash
chmod +x test-api.sh
./test-api.sh
```

### Cách 4: Manual với curl

```bash
# Register
curl -X POST http://localhost:8081/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8081/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get Profile (thay TOKEN bằng token từ login)
curl -X GET http://localhost:8081/api/v1/users/profile \
  -H "Authorization: Bearer TOKEN"
```

## Verify Event RabbitMQ

### Cách 1: Management UI
1. Truy cập http://localhost:15672
2. Login với `guest/guest`
3. Vào **Queues** → Chọn `user.registered.queue`
4. Xem message count hoặc click **Get Messages** để xem chi tiết

### Cách 2: Command Line
```bash
# Vào container
docker exec -it userservice-rabbitmq bash

# Xem messages
rabbitmqadmin get queue=user.registered.queue count=10
```

### Cách 3: Console Logs
Khi register thành công, log sẽ hiển thị:
```
INFO  - Published USER_REGISTERED event for user: testuser (test@example.com)
```

Nếu Notification Service đang chạy và có consumer, bạn sẽ thấy:
```
INFO  - EVENT NHẬN ĐƯỢC TỪ RABBITMQ!
       Event Type: USER_REGISTERED
       User ID: 1
       Username: testuser
       Email: test@example.com
```
