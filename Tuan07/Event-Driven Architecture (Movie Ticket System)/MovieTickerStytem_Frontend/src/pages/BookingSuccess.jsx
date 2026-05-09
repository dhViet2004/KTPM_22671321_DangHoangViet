import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency, formatDuration } from '@/utils/formatters';

/**
 * BookingSuccess Page - Trang xác nhận đặt vé thành công
 */
const BookingSuccess = () => {
  const { bookingId } = useParams();

  // Mock booking data (trong thực tế sẽ fetch từ API)
  const bookingData = {
    id: bookingId || 'BK001',
    movie: {
      title: 'Avengers: Endgame',
      poster: 'https://image.tmdb.org/t/p/w500/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    },
    showtime: {
      date: '26/04/2026',
      time: '19:30',
      room: 'Phòng 1',
    },
    seats: ['A5', 'A6', 'A7'],
    totalAmount: 360000,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">
            Đặt vé thành công!
          </h1>
          <p className="text-gray-400">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-netflix-dark rounded-2xl overflow-hidden shadow-2xl">
          {/* Movie Info */}
          <div className="relative h-48">
            <img 
              src={bookingData.movie.poster} 
              alt={bookingData.movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold">{bookingData.movie.title}</h2>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Booking ID */}
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Mã đặt vé</span>
              <span className="font-mono font-bold">{bookingData.id}</span>
            </div>

            {/* Showtime */}
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Suất chiếu</span>
              <span>{bookingData.showtime.date} - {bookingData.showtime.time}</span>
            </div>

            {/* Room */}
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Phòng chiếu</span>
              <span>{bookingData.showtime.room}</span>
            </div>

            {/* Seats */}
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Ghế</span>
              <div className="flex gap-2">
                {bookingData.seats.map((seat) => (
                  <span 
                    key={seat}
                    className="bg-red-600/20 border border-red-600 px-3 py-1 rounded-lg font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4">
              <span className="text-lg font-bold">Tổng cộng</span>
              <span className="text-2xl font-bold text-green-500">
                {formatCurrency(bookingData.totalAmount)}
              </span>
            </div>

            {/* Status Badge */}
            <div className="pt-4">
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
                <span className="text-green-400 font-bold">Đặt vé đã được xác nhận</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            to="/"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors text-center"
          >
            Về trang chủ
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors"
          >
            In vé
          </button>
        </div>

        {/* Notice */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Vui lòng đến rạp trước giờ chiếu 15 phút để nhận vé
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;
