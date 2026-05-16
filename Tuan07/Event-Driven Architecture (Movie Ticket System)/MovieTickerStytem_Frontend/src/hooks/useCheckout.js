import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/api/services';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';

/**
 * useCheckout - Custom Hook xử lý luồng Event-Driven Đặt Vé
 * 
 * LUỒNG XỬ LÝ:
 * 1. User click "Thanh toán" -> Gọi POST /bookings
 * 2. Nhận response 200 với status PENDING -> Bắt đầu polling
 * 3. Poll GET /bookings/:id/status mỗi 2 giây
 * 4. Khi nhận được trạng thái cuối cùng -> Xử lý kết quả
 * 
 * CÁC TRẠNG THÁI BOOKING:
 * - PENDING: Đang xử lý (chờ RabbitMQ)
 * - PAYMENT_COMPLETED: Thanh toán thành công
 * - BOOKING_CONFIRMED: Đặt vé xác nhận
 * - BOOKING_FAILED: Đặt vé thất bại
 * - PAYMENT_FAILED: Thanh toán thất bại
 * 
 * @param {Object} options - Các tùy chọn cấu hình
 * @param {number} options.pollingInterval - Thời gian giữa các lần poll (mặc định: 2000ms)
 * @param {number} options.maxPollingAttempts - Số lần poll tối đa (mặc định: 30 = 60 giây)
 * @returns {Object} - Trạng thái và methods để quản lý checkout
 */
export const useCheckout = (options = {}) => {
  const {
    pollingInterval = 2000,  // 2 giây
    maxPollingAttempts = 30,  // 30 lần = 60 giây tối đa
  } = options;

  // State quản lý trạng thái checkout
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Hooks và stores
  const navigate = useNavigate();
  const { selectedSeats, selectedMovie, selectedShowtime, resetBooking, setCurrentBooking } = useBookingStore();

  // Ref để lưu polling interval
  const pollingIntervalRef = useRef(null);

  // Ref để track component mounted state (tránh memory leak)
  const isMountedRef = useRef(true);

  /**
   * Cleanup khi component unmount
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Hàm polling để kiểm tra trạng thái booking
   * Gọi API GET /bookings/:id/status mỗi pollingInterval ms
   */
  const pollBookingStatus = useCallback(async (bookingId) => {
    // Kiểm tra component còn mounted không
    if (!isMountedRef.current) {
      return;
    }

    try {
      const statusResponse = await bookingsApi.getBookingStatus(bookingId);
      
      // Cập nhật trạng thái
      setBookingStatus(statusResponse.status);
      setPollingAttempts(prev => prev + 1);

      // Kiểm tra trạng thái - nếu là trạng thái kết thúc thì dừng polling
      if (isTerminalStatus(statusResponse.status)) {
        // Dừng polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsPolling(false);

        // Xử lý kết quả dựa trên trạng thái
        handleBookingResult(statusResponse.status, statusResponse);

        return;
      }

      // Kiểm tra nếu vượt quá số lần poll tối đa
      if (pollingAttempts + 1 >= maxPollingAttempts) {
        handleTimeout();
        return;
      }

    } catch (err) {
      console.error('Polling error:', err);
      // Tiếp tục polling nếu có lỗi tạm thời
      // (Có thể là server đang xử lý, không phải lỗi nghiêm trọng)
    }
  }, [pollingAttempts, maxPollingAttempts]);

  /**
   * Kiểm tra xem trạng thái có phải là trạng thái kết thúc không
   */
  const isTerminalStatus = (status) => {
    const terminalStatuses = [
      'PAYMENT_COMPLETED',
      'BOOKING_CONFIRMED', 
      'BOOKING_FAILED',
      'PAYMENT_FAILED',
      'SUCCESS',
      'COMPLETED',
      'CONFIRMED',
    ];
    return terminalStatuses.includes(status);
  };

  /**
   * Xử lý kết quả booking khi nhận được trạng thái cuối cùng
   */
  const handleBookingResult = useCallback((status, responseData) => {
    // Dừng loading state
    setIsProcessing(false);

    const successStatuses = ['PAYMENT_COMPLETED', 'BOOKING_CONFIRMED', 'SUCCESS', 'COMPLETED', 'CONFIRMED'];
    const isSuccess = successStatuses.includes(status);

    if (isSuccess) {
      // Thành công - chuyển hướng đến trang thành công
      toast.success('Đặt vé thành công! Cảm ơn bạn đã sử dụng dịch vụ.');
      
      // Lưu thông tin booking
      setCurrentBooking({
        id: currentBookingId,
        status: status,
        ...responseData,
      });

      // Reset booking state và chuyển hướng
      setTimeout(() => {
        navigate(`/booking-success/${currentBookingId}`);
      }, 500);

    } else {
      // Thất bại - hiển thị thông báo lỗi và cho phép chọn lại ghế
      const errorMessage = responseData?.message || 'Thanh toán thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
      
      setError(errorMessage);
      
      // Không reset seats để user có thể chọn lại
      // Reset chỉ khi user chủ động hủy
    }
  }, [currentBookingId, navigate, setCurrentBooking]);

  /**
   * Xử lý timeout - khi polling quá lâu mà không có kết quả
   */
  const handleTimeout = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsPolling(false);
    setIsProcessing(false);
    setError('Xử lý mất quá lâu. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
    toast.error('Xử lý mất quá lâu. Vui lòng thử lại.');
  }, []);

  /**
   * Hàm checkout chính - thực hiện đặt vé
   * 
   * LUỒNG:
   * 1. Validate thông tin
   * 2. Gọi POST /bookings với movieId và seatIds
   * 3. Nhận response PENDING, bắt đầu polling
   * 4. Chờ kết quả từ RabbitMQ
   */
  const checkout = useCallback(async () => {
    // Validate: Kiểm tra đã chọn ghế chưa
    if (!selectedSeats || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế.');
      return { success: false, error: 'No seats selected' };
    }

    // Validate: Kiểm tra thông tin phim
    if (!selectedMovie || !selectedShowtime) {
      toast.error('Thông tin phim hoặc suất chiếu không hợp lệ.');
      return { success: false, error: 'Invalid movie/showtime' };
    }

    // Bắt đầu xử lý - block UI
    setIsProcessing(true);
    setError(null);
    setPollingAttempts(0);
    setBookingStatus('PENDING');

    try {
      // Bước 1: Gọi API tạo booking
      // POST /api/bookings với payload theo format yêu cầu
      const { user } = useAuthStore.getState();
      
      // Lấy ghế đầu tiên (vì format yêu cầu seatNumber là số đơn)
      // Nếu backend hỗ trợ nhiều ghế, có thể thay đổi logic ở đây
      const seat = selectedSeats[0];

      const bookingPayload = {
        userId: user?.id || user?.userId || '123', // Ưu tiên ID từ store
        tripId: selectedShowtime.id,               // Map showtimeId sang tripId
        seatNumber: seat.number,                   // Số ghế (ví dụ: 5)
        paymentMethod: 'CASH',                     // Mặc định là CASH theo ví dụ
      };

      console.log('Sending booking request:', bookingPayload);
      const bookingResponse = await bookingsApi.createBooking(bookingPayload);
      
      // Nhận được response thành công với bookingId và status PENDING
      const bookingId = bookingResponse.bookingId || bookingResponse.id;
      
      if (!bookingId) {
        throw new Error('Không nhận được mã đặt vé');
      }

      setCurrentBookingId(bookingId);
      setCurrentBooking({
        id: bookingId,
        ...bookingResponse,
      });

      // Kiểm tra nếu đã có trạng thái cuối cùng ngay (edge case)
      if (isTerminalStatus(bookingResponse.status)) {
        handleBookingResult(bookingResponse.status, bookingResponse);
        return { success: true, bookingId };
      }

      // Bước 2: Bắt đầu polling để chờ kết quả xử lý từ RabbitMQ
      // UI đang bị block với Loading Overlay
      setIsPolling(true);
      setBookingStatus('PENDING');

      // Thiết lập interval polling
      pollingIntervalRef.current = setInterval(() => {
        pollBookingStatus(bookingId);
      }, pollingInterval);

      return { success: true, bookingId };

    } catch (err) {
      // Xử lý lỗi khi gọi API tạo booking
      console.error('Checkout error:', err);
      
      setIsProcessing(false);
      setIsPolling(false);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt vé.';
      setError(errorMessage);
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  }, [
    selectedSeats, 
    selectedMovie, 
    selectedShowtime, 
    pollBookingStatus, 
    handleBookingResult
  ]);

  /**
   * Hủy checkout và reset state
   */
  const cancelCheckout = useCallback(() => {
    // Dừng polling nếu đang chạy
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsProcessing(false);
    setIsPolling(false);
    setCurrentBookingId(null);
    setBookingStatus(null);
    setPollingAttempts(0);
    setError(null);
  }, []);

  /**
   * Reset và chọn lại ghế (sau khi thất bại)
   */
  const retryCheckout = useCallback(() => {
    cancelCheckout();
    // Không reset selectedSeats để user có thể thử lại
    // User có thể bỏ chọn ghế thủ công nếu muốn
  }, [cancelCheckout]);

  /**
   * Hoàn tất và reset (sau khi thành công hoặc user chủ động hủy)
   */
  const completeAndReset = useCallback(() => {
    cancelCheckout();
    resetBooking();
  }, [cancelCheckout, resetBooking]);

  return {
    // State
    isProcessing,           // Đang xử lý (UI bị block)
    isPolling,              // Đang polling
    currentBookingId,       // ID của booking hiện tại
    bookingStatus,          // Trạng thái booking (PENDING, SUCCESS, FAILED...)
    pollingAttempts,        // Số lần đã poll
    error,                  // Lỗi nếu có
    selectedSeats,          // Danh sách ghế đã chọn
    
    // Actions
    checkout,               // Thực hiện checkout
    cancelCheckout,         // Hủy checkout
    retryCheckout,          // Thử lại
    completeAndReset,        // Reset hoàn toàn
    
    // Computed
    isTimeout: pollingAttempts >= maxPollingAttempts,
    canCheckout: selectedSeats.length > 0 && !isProcessing,
  };
};

export default useCheckout;
