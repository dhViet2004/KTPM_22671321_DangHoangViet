# Mini Food Ordering System

Hệ thống đặt đồ ăn nhanh sử dụng **Service-Based Architecture** với Spring Cloud (Eureka + API Gateway) và ReactJS.

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│                    Frontend (5173) / Postman                                │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ http://localhost:8080/api/...
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY  (8080)                               │
│              Spring Cloud Gateway — Routing + CORS Global                   │
│              Eureka Client — Service Discovery (lb://SERVICE-NAME)           │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                         │  Service Discovery via Eureka
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EUREKA SERVER  (8761)                                    │
│              Service Registry — All microservices register here             │
│              Dashboard: http://localhost:8761                               │
└───────┬──────────────┬──────────────┬──────────────┬───────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
   │  User   │  │  Food    │  │  Order   │  │   Payment    │
   │ Service │  │ Service  │  │ Service  │  │   Service    │
   │  8081   │  │  8082   │  │  8083   │  │    8084      │
   └─────────┘  └──────────┘  └────┬─────┘  └──────────────┘
                                   │ RestTemplate lb://
                                   │ @LoadBalanced
                                   └──────────────┘
```

## Các Service

| Service | Port | Application Name | Mô tả |
|---------|------|-----------------|--------|
| **Eureka Server** | 8761 | `eureka-server` | Service Registry — dashboard quản lý |
| **API Gateway** | 8080 | `api-gateway` | Entry-point duy nhất, routing + CORS |
| User Service | 8081 | `user-service` | JWT Auth, đăng ký/đăng nhập |
| Food Service | 8082 | `food-service` | CRUD món ăn, seed 5 món |
| Order Service | 8083 | `order-service` | Tạo đơn, giao tiếp service khác |
| Payment Service | 8084 | `payment-service` | Xử lý thanh toán COD/Banking |

## Yêu cầu

- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker & Docker Compose

## Thứ tự khởi động (Local)

**Rất quan trọng:** Eureka Server phải chạy **TRƯỚC** tất cả các service khác.

```bash
# 1. Eureka Server — chạy TRƯỚC TIÊN
cd eureka-server && mvn spring-boot:run

# 2. API Gateway
cd api-gateway && mvn spring-boot:run

# 3. Các microservices
cd user-service && mvn spring-boot:run
cd food-service && mvn spring-boot:run
cd order-service && mvn spring-boot:run
cd payment-service && mvn spring-boot:run

# 4. Frontend
cd frontend && npm install && npm run dev
```

Hoặc dùng batch script:
```bash
run-all-services.bat
run-frontend.bat
```

## Chạy với Docker

```bash
docker-compose up -d --build
```

Thứ tự khởi động tự động: `eureka-server` → `api-gateway` → `user-service` → `food-service` → `order-service` → `payment-service` → `frontend`

## Eureka Service Discovery

### Các service đăng ký qua Eureka với application name

| Service | Application Name (Eureka) |
|---------|--------------------------|
| User Service | `USER-SERVICE` |
| Food Service | `FOOD-SERVICE` |
| Order Service | `ORDER-SERVICE` |
| Payment Service | `PAYMENT-SERVICE` |
| API Gateway | `api-gateway` |

### API Gateway routing với `lb://` (load-balanced via Eureka)

```yaml
routes:
  - id: user-service
    uri: lb://USER-SERVICE    # ← Eureka resolves to actual IP:8081
    predicates:
      - Path=/api/users/**

  - id: order-service
    uri: lb://ORDER-SERVICE  # ← Eureka resolves to actual IP:8083
    predicates:
      - Path=/api/orders/**
```

### RestTemplate với `@LoadBalanced` trong Order Service / Payment Service

```java
@Configuration
public class WebConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

// Gọi bằng SERVICE NAME thay vì IP/port
restTemplate.getForObject("http://USER-SERVICE/api/users/1/validate", ...);
restTemplate.getForObject("http://FOOD-SERVICE/api/foods/1", ...);
restTemplate.getForObject("http://ORDER-SERVICE/api/orders/1", ...);
```

**Lợi ích:** Khi scale service (chạy nhiều instance), Eureka tự động load-balance. Không cần thay đổi code.

## API qua Gateway (port 8080)

| Endpoint | Định tuyến đến |
|-----------|-----------------|
| `POST /api/users/register` | USER-SERVICE |
| `POST /api/users/login` | USER-SERVICE |
| `GET /api/foods` | FOOD-SERVICE |
| `POST /api/orders` | ORDER-SERVICE |
| `POST /api/payments` | PAYMENT-SERVICE |

## Environment Variables

### Frontend
```env
VITE_BASE_URL=http://localhost:8080
```

### Docker (tự động qua docker-compose)
```yaml
eureka-server:  EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
api-gateway:     EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
user-service:    EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
food-service:    EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
order-service:   EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
payment-service: EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
```

## Health Check URLs

```bash
# Eureka Server Dashboard
curl http://localhost:8761

# API Gateway Health
curl http://localhost:8080/actuator/health

# API Gateway Routes
curl http://localhost:8080/actuator/gateway/routes
```

## Luồng đặt hàng đầy đủ

```
1. User đăng ký/đăng nhập
   → Frontend → API Gateway (8080) → USER-SERVICE (Eureka)
   → Nhận JWT token

2. User xem danh sách món ăn
   → Frontend → API Gateway → FOOD-SERVICE (Eureka)

3. User tạo đơn hàng
   → Frontend → API Gateway → ORDER-SERVICE (Eureka)
   → ORDER-SERVICE gọi USER-SERVICE (RestTemplate lb://) để validate user
   → ORDER-SERVICE gọi FOOD-SERVICE (RestTemplate lb://) để lấy giá

4. User thanh toán
   → Frontend → API Gateway → PAYMENT-SERVICE (Eureka)
   → PAYMENT-SERVICE gọi ORDER-SERVICE (RestTemplate lb://) cập nhật PAID
   → Console log notification
```
