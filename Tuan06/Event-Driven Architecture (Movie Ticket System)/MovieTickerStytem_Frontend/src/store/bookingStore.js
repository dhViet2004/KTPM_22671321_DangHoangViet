import { create } from 'zustand';

/**
 * Booking Store - Quản lý giỏ hàng vé và thông tin đặt vé
 */
export const useBookingStore = create((set, get) => ({
  // Danh sách ghế đã chọn
  selectedSeats: [],
  
  // Thông tin phim đang chọn
  selectedMovie: null,
  
  // Thông tin suất chiếu đang chọn
  selectedShowtime: null,
  
  // Tổng tiền
  totalPrice: 0,
  
  // Trạng thái đặt vé hiện tại
  currentBooking: null,
  
  // Loading state khi đang xử lý thanh toán
  isProcessing: false,
  
  /**
   * Thêm ghế vào danh sách chọn
   */
  addSeat: (seat) => {
    const { selectedSeats, selectedShowtime } = get();
    
    // Kiểm tra ghế đã được chọn chưa
    if (selectedSeats.find(s => s.id === seat.id)) {
      return;
    }
    
    // Kiểm tra ghế đã bán chưa
    if (seat.status === 'BOOKED' || seat.status === 'SOLD') {
      return;
    }
    
    const updatedSeats = [...selectedSeats, seat];
    const totalPrice = updatedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    
    set({
      selectedSeats: updatedSeats,
      totalPrice,
    });
  },

  /**
   * Xóa ghế khỏi danh sách chọn
   */
  removeSeat: (seatId) => {
    const { selectedSeats } = get();
    const updatedSeats = selectedSeats.filter(s => s.id !== seatId);
    const totalPrice = updatedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    
    set({
      selectedSeats: updatedSeats,
      totalPrice,
    });
  },

  /**
   * Xóa tất cả ghế đã chọn
   */
  clearSelectedSeats: () => {
    set({
      selectedSeats: [],
      totalPrice: 0,
    });
  },

  /**
   * Đặt thông tin phim và suất chiếu
   */
  setMovieAndShowtime: (movie, showtime) => {
    set({
      selectedMovie: movie,
      selectedShowtime: showtime,
      selectedSeats: [],
      totalPrice: 0,
    });
  },

  /**
   * Set trạng thái đang xử lý thanh toán
   */
  setProcessing: (isProcessing) => {
    set({ isProcessing });
  },

  /**
   * Set thông tin booking hiện tại
   */
  setCurrentBooking: (booking) => {
    set({ currentBooking: booking });
  },

  /**
   * Reset toàn bộ booking state
   */
  resetBooking: () => {
    set({
      selectedSeats: [],
      selectedMovie: null,
      selectedShowtime: null,
      totalPrice: 0,
      currentBooking: null,
      isProcessing: false,
    });
  },
}));
