import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const API_GATEWAY_BASE_URL = '/api';

const axiosClient = axios.create({
  baseURL: API_GATEWAY_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Tự động đính kèm JWT token vào header nếu user đã đăng nhập
 * Token được lấy từ Zustand store
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Xử lý global error:
 * - 401: Unauthorized -> tự động logout và chuyển về trang login
 * - 500: Server error -> hiển thị toast notification
 * - Network error -> xử lý mất kết nối
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          // Tự động logout và thông báo
          useAuthStore.getState().logout();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
          break;
          
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này.');
          break;
          
        case 404:
          toast.error('Không tìm thấy tài nguyên yêu cầu.');
          break;
          
        case 409:
          toast.error(response.data?.message || 'Xung đột dữ liệu. Vui lòng thử lại.');
          break;
          
        case 422:
          toast.error(response.data?.message || 'Dữ liệu không hợp lệ.');
          break;
          
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
          
        case 503:
          toast.error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.');
          break;
          
        default:
          toast.error(response.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      // Thường do network error hoặc CORS
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
      toast.error('Đã xảy ra lỗi không xác định.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
