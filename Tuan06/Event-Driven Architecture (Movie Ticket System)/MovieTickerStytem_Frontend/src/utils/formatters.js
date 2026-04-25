/**
 * Format currency - Định dạng tiền tệ VND
 * @param {number} amount - Số tiền
 * @returns {string} - Chuỗi đã format (VD: 120.000đ)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '0đ';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date - Định dạng ngày tháng
 * @param {string|Date} dateString - Chuỗi ngày hoặc Date object
 * @param {Object} options - Các tùy chọn định dạng
 * @returns {string} - Chuỗi ngày đã format
 */
export const formatDate = (dateString, options = {}) => {
  const {
    locale = 'vi-VN',
    format = 'short', // 'short', 'medium', 'long', 'full'
  } = options;

  if (!dateString) return '';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const formatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'long', year: 'numeric' },
    long: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat(locale, formatOptions[format] || formatOptions.short).format(date);
};

/**
 * Format time - Định dạng giờ
 * @param {string} timeString - Chuỗi giờ (VD: "19:30")
 * @returns {string} - Giờ đã format (VD: "7:30 PM")
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'CH' : 'SA';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format duration - Định dạng thời lượng phim
 * @param {number} minutes - Số phút
 * @returns {string} - Chuỗi thời lượng (VD: "2h 15p")
 */
export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || minutes <= 0) {
    return '0p';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}p`;
  }
  
  return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
};

/**
 * Truncate text - Cắt ngắn text
 * @param {string} text - Chuỗi cần cắt
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Chuỗi đã cắt
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Generate random ID
 * @returns {string} - Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Debounce function
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Hàm đã debounce
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sleep/delay function
 * @param {number} ms - Thời gian chờ (ms)
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
