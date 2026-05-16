import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBookingStore } from '@/store/bookingStore';
import { useCheckout } from '@/hooks/useCheckout';
import { formatCurrency, formatDate } from '@/utils/formatters';
import LoadingOverlay from '@/components/LoadingOverlay';

/**
 * SeatSelection Component - Trang chọn ghế và thanh toán
 * 
 * Tính năng:
 * - Hiển thị sơ đồ ghế với các trạng thái: trống, đang chọn, đã bán
 * - Panel hiển thị tổng tiền
 * - Nút thanh toán với xử lý Event-Driven qua useCheckout hook
 * - Loading Overlay khi đang xử lý thanh toán
 */
const SeatSelection = () => {
  const { movieId, showtimeId } = useParams();
  const navigate = useNavigate();
  
  // State local
  const [seats, setSeats] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  const [screenWidth] = useState(10); // Số ghế mỗi hàng

  // Store
  const { 
    selectedSeats, 
    addSeat, 
    removeSeat, 
    clearSelectedSeats,
    selectedMovie,
    selectedShowtime,
    totalPrice,
    setMovieAndShowtime,
  } = useBookingStore();

  // Checkout hook với Event-Driven polling
  const {
    isProcessing,
    isPolling,
    bookingStatus,
    pollingAttempts,
    error,
    checkout,
    cancelCheckout,
    retryCheckout,
    canCheckout,
  } = useCheckout({
    pollingInterval: 2000,
    maxPollingAttempts: 30,
  });

  /**
   * Mock data cho sơ đồ ghế
   * Trong thực tế, data này sẽ được gọi từ API qua Gateway
   */
  useEffect(() => {
    const fetchSeats = async () => {
      setIsLoadingSeats(true);
      
      try {
        // Mock seats data - 10 hàng, mỗi hàng 12 ghế (A-L)
        const mockSeats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        
        rows.forEach((row, rowIndex) => {
          for (let col = 1; col <= 12; col++) {
            // Ghế VIP (hàng E,F) có giá cao hơn
            const isVIP = rowIndex >= 4 && rowIndex <= 5;
            // Ghế đôi (cột 6,7)
            const isDouble = col === 6 || col === 7;
            
            // Random một số ghế đã bán
            const isBooked = Math.random() < 0.25;
            
            mockSeats.push({
              id: `${row}${col}`,
              row: row,
              number: col,
              type: isVIP ? 'VIP' : isDouble ? 'COUPLE' : 'STANDARD',
              price: isVIP ? 120000 : isDouble ? 100000 : 80000,
              status: isBooked ? 'BOOKED' : 'AVAILABLE',
            });
          }
        });

        // Mock movie và showtime data
        setMovieAndShowtime(
          {
            id: movieId || 'MOV001',
            title: 'Avengers: Endgame',
            poster: 'https://image.tmdb.org/t/p/w500/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
          },
          {
            id: showtimeId || 'SH001',
            time: '19:30',
            date: '2026-04-26',
            room: 'Phòng 1',
          }
        );

        setSeats(mockSeats);
        
      } catch (err) {
        console.error('Error fetching seats:', err);
        toast.error('Không thể tải danh sách ghế');
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchSeats();

    // Cleanup khi unmount
    return () => {
      clearSelectedSeats();
    };
  }, [movieId, showtimeId]);

  /**
   * Xử lý click chọn/ghỉ chọn ghế
   */
  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') {
      toast.error('Ghế này đã được bán');
      return;
    }

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSelected) {
      removeSeat(seat.id);
    } else {
      // Giới hạn số ghế được chọn (tối đa 10 ghế)
      if (selectedSeats.length >= 10) {
        toast.error('Bạn chỉ có thể chọn tối đa 10 ghế');
        return;
      }
      addSeat(seat);
    }
  };

  /**
   * Xử lý thanh toán
   */
  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    // Gọi checkout từ useCheckout hook
    // Hook sẽ tự động:
    // 1. Gọi POST /bookings
    // 2. Bắt đầu polling
    // 3. Block UI với LoadingOverlay
    // 4. Xử lý kết quả
    await checkout();
  };

  /**
   * Xử lý hủy thanh toán
   */
  const handleCancel = () => {
    cancelCheckout();
    toast.success('Đã hủy thanh toán');
  };

  /**
   * Render một ghế
   */
  const renderSeat = (seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    const isBooked = seat.status === 'BOOKED';
    
    const seatClasses = `
      w-8 h-8 rounded-t-lg flex items-center justify-center text-xs font-medium
      transition-all duration-200 cursor-pointer select-none
      ${isBooked 
        ? 'bg-netflix-gray text-gray-600 cursor-not-allowed line-through opacity-50' 
        : isSelected 
          ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/50' 
          : seat.type === 'VIP' 
            ? 'bg-yellow-600 text-black hover:bg-yellow-500 hover:scale-105' 
            : seat.type === 'COUPLE'
              ? 'bg-purple-600 text-white hover:bg-purple-500 hover:scale-105'
              : 'bg-netflix-dark text-white hover:bg-gray-500 hover:scale-105'
      }
    `;

    return (
      <div
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        className={seatClasses}
        title={`Ghế ${seat.row}${seat.number} - ${formatCurrency(seat.price)} - ${seat.type}`}
      >
        {seat.number}
      </div>
    );
  };

  /**
   * Group seats by row for rendering
   */
  const seatsByRow = useMemo(() => {
    const grouped = {};
    seats.forEach(seat => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);

  if (isLoadingSeats) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          
          {selectedMovie && (
            <div className="flex items-center gap-4">
              <img 
                src={selectedMovie.poster} 
                alt={selectedMovie.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold">{selectedMovie.title}</h1>
                {selectedShowtime && (
                  <p className="text-gray-400">
                    {formatDate(selectedShowtime.date)} - {selectedShowtime.time} - {selectedShowtime.room}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Map Section */}
          <div className="lg:col-span-2">
            {/* Screen */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 h-2 rounded-full mb-8 relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
                MÀN HÌNH
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-netflix-dark rounded-t-sm"></div>
                <span className="text-sm text-gray-400">Ghế thường</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-600 rounded-t-sm"></div>
                <span className="text-sm text-gray-400">Ghế VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-t-sm"></div>
                <span className="text-sm text-gray-400">Ghế đôi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded-t-sm"></div>
                <span className="text-sm text-gray-400">Đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-netflix-gray line-through opacity-50 rounded-t-sm"></div>
                <span className="text-sm text-gray-400">Đã bán</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-2">
              {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-6 text-center text-gray-500 font-medium">{row}</div>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {rowSeats.map(seat => renderSeat(seat))}
                  </div>
                  <div className="w-6 text-center text-gray-500 font-medium">{row}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-netflix-dark rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Thông tin đặt vé</h2>
              
              {/* Selected Seats */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 mb-3">Ghế đã chọn ({selectedSeats.length})</h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa chọn ghế nào</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <div 
                        key={seat.id}
                        className="bg-red-600/20 border border-red-600 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                      >
                        <span>{seat.row}{seat.number}</span>
                        <button 
                          onClick={() => removeSeat(seat.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                {selectedSeats.map(seat => (
                  <div key={seat.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Ghế {seat.row}{seat.number} ({seat.type})
                    </span>
                    <span>{formatCurrency(seat.price)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-700 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-500">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!canCheckout}
                className={`
                  w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all
                  ${canCheckout 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
              </button>

              {/* Cancel Button (chỉ hiện khi đang xử lý) */}
              {isProcessing && (
                <button
                  onClick={handleCancel}
                  className="w-full mt-3 py-3 rounded-lg font-medium text-gray-400 
                           border border-gray-600 hover:border-gray-500 transition-all"
                >
                  Hủy
                </button>
              )}

              {/* Error Message */}
              {error && !isProcessing && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={retryCheckout}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay - Block UI khi đang xử lý Event-Driven Booking */}
      <LoadingOverlay 
        isVisible={isProcessing}
        status={bookingStatus}
        pollingAttempts={pollingAttempts}
      />
    </div>
  );
};

export default SeatSelection;
