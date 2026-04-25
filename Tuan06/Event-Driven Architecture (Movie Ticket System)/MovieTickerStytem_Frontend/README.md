# Movie Ticket System - Frontend

## Giới thiệu
Frontend cho hệ thống đặt vé xem phim được xây dựng theo kiến trúc Event-Driven Architecture (EDA).

## Tech Stack
- **ReactJS** - Library UI chính (khởi tạo bằng Vite)
- **Tailwind CSS** - Styling với dark theme (Netflix/CGV style)
- **Zustand** - State management cho Auth và Booking state
- **React Router v6** - Client-side routing
- **Axios** - HTTP client với interceptors
- **React Hot Toast** - Toast notifications

## Cấu trúc thư mục

```
/src
  /api              # Cấu hình Axios và API services
    axiosClient.js   # Axios instance trỏ đến API Gateway (localhost:8080)
    services.js      # Các API endpoints (movies, bookings, auth, seats, showtimes)
  
  /components       # UI components dùng chung
    LoadingOverlay.jsx  # Overlay loading cho Event-Driven booking
  
  /features         # Logic và UI chia theo domain
    /booking
      SeatSelection.jsx  # Component chọn ghế và thanh toán
  
  /hooks            # Custom React hooks
    useCheckout.js  # Hook xử lý Event-Driven booking flow
  
  /pages            # Các trang chính
    Home.jsx        # Trang chủ với danh sách phim
    BookingSuccess.jsx  # Trang xác nhận đặt vé thành công
  
  /store            # Zustand stores cho global state
    authStore.js    # Auth state (user, token, isAuthenticated)
    bookingStore.js # Booking state (selectedSeats, totalPrice, etc.)
  
  /utils            # Helper functions
    formatters.js   # Format currency, date, time
  
  App.jsx           # Main app với routing
  main.jsx          # Entry point
  index.css         # Global styles
```

## Luồng Event-Driven Booking

```
┌─────────────┐     POST /bookings      ┌──────────────────┐
│   Frontend  │ ──────────────────────► │   API Gateway    │
│             │ ◄────────────────────── │  (localhost:8080)│
└─────────────┘   200 OK + PENDING     └────────┬─────────┘
       │                                          │
       │                                          ▼
       │                               ┌──────────────────┐
       │                               │  Booking Service │
       │                               │                  │
       │                               │  RabbitMQ Queue  │
       │                               └────────┬─────────┘
       │                                          │
       │                                          ▼
       │                               ┌──────────────────┐
       │                               │ Payment Service  │
       │                               │ (Xử lý async)    │
       │                               └────────┬─────────┘
       │                                          │
       │◄──────── GET /bookings/:id/status ───────┘
       │         (Polling mỗi 2 giây)
       │
       ▼
┌─────────────────────┐
│  Xử lý kết quả:     │
│  - SUCCESS → Redirect│
│  - FAILED → Toast   │
└─────────────────────┘
```

### Các trạng thái Booking:
- `PENDING`: Đang xử lý (chờ RabbitMQ)
- `PAYMENT_COMPLETED`: Thanh toán thành công
- `BOOKING_CONFIRMED`: Đặt vé xác nhận
- `BOOKING_FAILED`: Đặt vé thất bại
- `PAYMENT_FAILED`: Thanh toán thất bại

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## API Gateway Configuration

Tất cả API requests phải đi qua API Gateway tại `http://localhost:8080/api/v1`:

```javascript
// axiosClient.js
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 30000,
});
```

## Quy tắc quan trọng

1. **KHÔNG BAO GIỜ** gọi trực tiếp vào các service (User, Movie, Booking, Payment)
2. **TẤT CẢ** requests phải đi qua API Gateway
3. Booking request trả về HTTP 200 ngay lập tức với status PENDING
4. Frontend phải implement polling/SSE/WebSocket để nhận kết quả cuối cùng

## Components chính

### SeatSelection.jsx
- Hiển thị sơ đồ ghế với các loại: Standard, VIP, Couple
- Trạng thái ghế: Available, Selected, Booked
- Panel tổng tiền và nút thanh toán
- Sử dụng `useCheckout` hook cho Event-Driven flow

### useCheckout.js
- Quản lý trạng thái checkout
- Implement polling mechanism (2 giây/lần)
- Block UI với LoadingOverlay khi xử lý
- Xử lý kết quả: success → redirect, failed → toast error

### LoadingOverlay.jsx
- Full-screen overlay khi đang xử lý
- Hiển thị trạng thái booking hiện tại
- Animation loading đẹp mắt
- Thông tin về Event-Driven Architecture
