import axiosClient from './axiosClient';

/**
 * Movies API Service
 * Gọi API qua API Gateway tại http://localhost:8080/api/v1/movies
 */
export const moviesApi = {
  /**
   * Lấy danh sách tất cả phim đang chiếu
   * GET /movies
   */
  getAllMovies: async () => {
    const response = await axiosClient.get('/movies');
    return response.data;
  },

  /**
   * Lấy chi tiết một phim theo ID
   * GET /movies/:id
   */
  getMovieById: async (movieId) => {
    const response = await axiosClient.get(`/movies/${movieId}`);
    return response.data;
  },

  /**
   * Tìm kiếm phim theo tên
   * GET /movies/search?q=query
   */
  searchMovies: async (query) => {
    const response = await axiosClient.get('/movies/search', {
      params: { q: query },
    });
    return response.data;
  },
};

/**
 * Bookings API Service
 * Xử lý đặt vé qua Event-Driven Architecture
 */
export const bookingsApi = {
  /**
   * Tạo yêu cầu đặt vé mới
   * POST /bookings
   * 
   * Payload: { userId, tripId, seatNumber, paymentMethod }
   * 
   * Lưu ý: Đây là request bất đồng bộ!
   * Response trả về ngay lập tức với status PENDING
   * Backend xử lý qua RabbitMQ và cập nhật trạng thái sau đó
   */
  createBooking: async (bookingData) => {
    const response = await axiosClient.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Lấy trạng thái đặt vé (dùng cho polling)
   * GET /bookings/:id/status
   * 
   * Trả về các trạng thái:
   * - PENDING: Đang xử lý
   * - PAYMENT_COMPLETED: Thanh toán thành công
   * - BOOKING_CONFIRMED: Đặt vé thành công
   * - BOOKING_FAILED: Đặt vé thất bại
   * - PAYMENT_FAILED: Thanh toán thất bại
   */
  getBookingStatus: async (bookingId) => {
    const response = await axiosClient.get(`/bookings/${bookingId}/status`);
    return response.data;
  },

  /**
   * Lấy chi tiết đặt vé
   * GET /bookings/:id
   */
  getBookingById: async (bookingId) => {
    const response = await axiosClient.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Lấy lịch sử đặt vé của user
   * GET /bookings/user/:userId
   */
  getUserBookings: async (userId) => {
    const response = await axiosClient.get(`/bookings/user/${userId}`);
    return response.data;
  },

  /**
   * Hủy đặt vé
   * DELETE /bookings/:id
   */
  cancelBooking: async (bookingId) => {
    const response = await axiosClient.delete(`/bookings/${bookingId}`);
    return response.data;
  },
};

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Đăng nhập
   * POST /auth/login
   */
  login: async (credentials) => {
    const response = await axiosClient.post('/v1/users/login', credentials);
    return response.data;
  },

  /**
   * Đăng ký
   * POST /auth/register
   */
  register: async (userData) => {
    const response = await axiosClient.post('/v1/users/register', userData);
    return response.data;
  },

  /**
   * Refresh token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken) => {
    const response = await axiosClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Đăng xuất
   * POST /auth/logout
   */
  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Lấy thông tin cá nhân
   * GET /v1/users/profile
   */
  getProfile: async () => {
    const response = await axiosClient.get('/v1/users/profile');
    return response.data;
  },
};

/**
 * Seats API Service
 */
export const seatsApi = {
  /**
   * Lấy danh sách ghế theo suất chiếu
   * GET /seats/showtime/:showtimeId
   */
  getSeatsByShowtime: async (showtimeId) => {
    const response = await axiosClient.get(`/seats/showtime/${showtimeId}`);
    return response.data;
  },

  /**
   * Kiểm tra ghế có available không
   * GET /seats/:id/availability
   */
  checkSeatAvailability: async (seatId) => {
    const response = await axiosClient.get(`/seats/${seatId}/availability`);
    return response.data;
  },
};

/**
 * Showtimes API Service
 */
export const showtimesApi = {
  /**
   * Lấy lịch chiếu theo phim
   * GET /showtimes/movie/:movieId
   */
  getShowtimesByMovie: async (movieId) => {
    const response = await axiosClient.get(`/showtimes/movie/${movieId}`);
    return response.data;
  },

  /**
   * Lấy chi tiết suất chiếu
   * GET /showtimes/:id
   */
  getShowtimeById: async (showtimeId) => {
    const response = await axiosClient.get(`/showtimes/${showtimeId}`);
    return response.data;
  },
};
