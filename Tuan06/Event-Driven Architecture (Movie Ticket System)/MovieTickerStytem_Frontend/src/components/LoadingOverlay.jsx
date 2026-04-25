import React from 'react';

/**
 * LoadingOverlay Component
 * 
 * Overlay toàn màn hình hiển thị khi đang xử lý Event-Driven Booking
 * Block hoàn toàn UI để user không thể thao tác trong khi chờ kết quả từ RabbitMQ
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Hiển thị overlay hay không
 * @param {string} props.status - Trạng thái booking hiện tại
 * @param {number} props.pollingAttempts - Số lần đã polling
 */
const LoadingOverlay = ({ isVisible, status, pollingAttempts = 0 }) => {
  if (!isVisible) return null;

  /**
   * Render trạng thái xử lý với animation
   */
  const renderProcessingStatus = () => {
    switch (status) {
      case 'PENDING':
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-medium">Đang xử lý thanh toán...</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Vui lòng không đóng trình duyệt hoặc chuyển trang
            </p>
          </>
        );
      
      case 'PAYMENT_PROCESSING':
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 font-medium">Đang xác nhận thanh toán...</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Hệ thống đang xử lý giao dịch qua cổng thanh toán
            </p>
          </>
        );
      
      case 'BOOKING_IN_PROGRESS':
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Đang xác nhận đặt vé...</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Đang cập nhật trạng thái ghế trong hệ thống
            </p>
          </>
        );
      
      default:
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Đang xử lý...</span>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Card Container */}
      <div className="bg-netflix-dark border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-gray-700 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
            {/* Inner content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          Đang xử lý giao dịch
        </h2>
        <p className="text-gray-400 text-center mb-6">
          MovieTicketSystem đang kết nối với hệ thống thanh toán
        </p>

        {/* Status */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          {renderProcessingStatus()}
          
          {/* Polling indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 200}ms`,
                    opacity: pollingAttempts > i ? 1 : 0.3 
                  }}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm">
              Đang chờ phản hồi từ server...
            </span>
          </div>
        </div>

        {/* Event-Driven Architecture Info */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-gray-500">
              <p className="mb-1">
                <strong className="text-gray-400">Event-Driven Architecture:</strong>
              </p>
              <p>
                Yêu cầu của bạn đang được xử lý bất đồng bộ qua RabbitMQ. 
                Thời gian xử lý thông thường từ 5-30 giây.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
