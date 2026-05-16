import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store - Quản lý trạng thái đăng nhập
 * Sử dụng Zustand với persist middleware để lưu token vào localStorage
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Đăng nhập - lưu thông tin user và token
       */
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /**
       * Đăng xuất - xóa toàn bộ thông tin
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      /**
       * Cập nhật thông tin user
       */
      updateUser: (userData) => {
        set({
          user: { ...get().user, ...userData },
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage', // Tên key trong localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
