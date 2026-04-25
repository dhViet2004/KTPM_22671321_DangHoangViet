# =============================================================================
# Mini Food Ordering System - Distributed Deployment Guide
# Deploy microservices across multiple machines via LAN/WiFi
# =============================================================================

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WiFi/LAN Network                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐    │
│  │   Machine 1  │     │   Machine 2  │     │      Machine 3      │    │
│  │              │     │              │     │                     │    │
│  │ Eureka       │     │ Food Service │     │ Order Service       │    │
│  │ API Gateway  │     │ PostgreSQL   │     │ PostgreSQL          │    │
│  │              │     │              │     │                     │    │
│  │ (Port 8761)  │     │ (Port 8082)  │     │ (Port 8083)         │    │
│  │ (Port 8080)  │     │ (Port 5432)  │     │ (Port 5432)         │    │
│  └──────────────┘     └──────────────┘     └──────────────────────┘    │
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐    │
│  │   Machine 4  │     │   Machine 5  │     │      Machine 6       │    │
│  │              │     │              │     │                      │    │
│  │ User Service │     │ Payment      │     │ Notification         │    │
│  │ PostgreSQL   │     │ Service      │     │ Service              │    │
│  │              │     │ PostgreSQL   │     │ PostgreSQL           │    │
│  │ (Port 8081)  │     │ (Port 8084)  │     │ (Port 8085)          │    │
│  │ (Port 5432)  │     │ (Port 5432)  │     │ (Port 5432)          │    │
│  └──────────────┘     └──────────────┘     └──────────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                          Machine X                               │   │
│  │                                                                   │   │
│  │ Frontend (Nginx)                    PostgreSQL                    │   │
│  │ (Port 3000)                         (Optional central DB)       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. Docker & Docker Compose installed on all machines
2. All machines connected to the same WiFi/LAN network
3. Firewall configured to allow communication on required ports

## Step 1: Determine IP Addresses

Find the LAN IP address of each machine:

**Windows:**
```cmd
ipconfig
```
Look for `IPv4 Address` under WiFi adapter (e.g., `192.168.1.100`)

**Linux/Mac:**
```bash
hostname -I
```

## Step 2: Create Environment Files

Create `.env` files for each service with the correct IP addresses.

### Machine 1: Eureka + API Gateway

Create `eureka-server/.env`:
```env
SERVER_PORT=8761
EUREKA_HOSTNAME=192.168.1.100
HOST_IP=192.168.1.100
```

Create `api-gateway/.env`:
```env
SERVER_PORT=8080
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.100
ALLOWED_ORIGINS=http://192.168.1.X:3000
```

### Machine 2: Food Service

Create `food-service/.env`:
```env
SERVER_PORT=8082
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.101
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fooddb
DB_USERNAME=postgres
DB_PASSWORD=postgres123
H2_ENABLED=false
```

### Machine 3: Order Service

Create `order-service/.env`:
```env
SERVER_PORT=8083
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.102
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orderdb
DB_USERNAME=postgres
DB_PASSWORD=postgres123
H2_ENABLED=false
```

### Machine 4: User Service

Create `user-service/.env`:
```env
SERVER_PORT=8081
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.103
DB_HOST=localhost
DB_PORT=5432
DB_NAME=userdb
DB_USERNAME=postgres
DB_PASSWORD=postgres123
H2_ENABLED=false
```

### Machine 5: Payment Service

Create `payment-service/.env`:
```env
SERVER_PORT=8084
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.104
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paymentdb
DB_USERNAME=postgres
DB_PASSWORD=postgres123
```

### Machine 6: Notification Service

Create `notification-service/.env`:
```env
SERVER_PORT=8085
EUREKA_SERVER_URL=http://192.168.1.100:8761/eureka/
HOST_IP=192.168.1.105
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notificationdb
DB_USERNAME=postgres
DB_PASSWORD=postgres123
```

## Step 3: Build Docker Images

On each machine, build the Docker image:

```bash
cd <service-directory>

# Build the image
docker build -t <service-name>:latest .

# Example for food-service on Machine 2:
cd food-service
docker build -t food-service:latest .
```

## Step 4: Start Services

### Machine 1: Start Eureka and API Gateway

```bash
cd eureka-server
docker-compose up -d

cd ../api-gateway
docker-compose up -d
```

### Other Machines: Start Services

```bash
cd <service-directory>
docker-compose up -d
```

## Step 5: Verify Deployment

1. Check Eureka Dashboard: `http://192.168.1.100:8761`
   - All services should appear in the dashboard

2. Check API Gateway: `http://192.168.1.100:8080/actuator/health`

3. Test API through Gateway:
   ```bash
   curl http://192.168.1.100:8080/api/foods
   ```

## Running Everything on One Machine (Local Dev)

Create a `.env` file in the project root:

```env
# Network
HOST_IP=localhost

# Service URLs
EUREKA_SERVER_URL=http://localhost:8761/eureka/
API_GATEWAY_URL=http://localhost:8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fooddb
DB_USERNAME=postgres
DB_PASSWORD=postgres123

# Ports
EUREKA_PORT=8761
GATEWAY_PORT=8080
FOOD_PORT=8082
USER_PORT=8081
ORDER_PORT=8083
PAYMENT_PORT=8084
NOTIFICATION_PORT=8085
FRONTEND_PORT=3000
```

Start all services:

```bash
# Create external network
docker network create food-network

# Build all images
docker-compose build

# Start all services
docker-compose up -d
```

## Common Issues

### 1. Services Not Registering with Eureka

- Check network connectivity between machines
- Verify `EUREKA_SERVER_URL` is accessible from service machine
- Check Eureka logs: `docker logs eureka-server`

### 2. CORS Errors

- Update `ALLOWED_ORIGINS` in API Gateway with frontend's IP
- Example: `ALLOWED_ORIGINS=http://192.168.1.110:3000`

### 3. Database Connection Failed

- Ensure PostgreSQL is running and healthy
- Check `DB_HOST` points to correct database host
- Verify credentials match

### 4. Port Already in Use

- Change port mapping in docker-compose.yml
- Example: `8082:8082` → `8086:8082`

## Port Reference

| Service | Default Port | Purpose |
|---------|-------------|---------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | Entry Point |
| User Service | 8081 | User Management |
| Food Service | 8082 | Food Catalog |
| Order Service | 8083 | Order Processing |
| Payment Service | 8084 | Payment Processing |
| Notification Service | 8085 | Notifications |
| Frontend | 3000 | Web UI |
| PostgreSQL | 5432 | Database |

## Quick Start Script

Create `deploy-all.sh` for local deployment:

```bash
#!/bin/bash

# Create network
docker network create food-network 2>/dev/null || true

# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Show status
docker-compose ps
```
