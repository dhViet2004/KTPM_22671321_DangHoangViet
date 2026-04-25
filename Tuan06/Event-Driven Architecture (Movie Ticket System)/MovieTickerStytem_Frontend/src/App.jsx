import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import SeatSelection from '@/features/booking/SeatSelection';
import BookingSuccess from '@/pages/BookingSuccess';

/**
 * App Component - Main application router
 * 
 * Routes configuration:
 * - / : Home page với danh sách phim
 * - /movie/:movieId : Chi tiết phim (tùy chọn)
 * - /booking/:movieId/:showtimeId : Trang chọn ghế
 * - /booking-success/:bookingId : Trang xác nhận đặt vé thành công
 */
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking/:movieId/:showtimeId" element={<SeatSelection />} />
        <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />
        
        {/* Fallback route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-netflix-black flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
                <p className="text-gray-400 mb-6">Trang không tồn tại</p>
                <a 
                  href="/" 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Về trang chủ
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
