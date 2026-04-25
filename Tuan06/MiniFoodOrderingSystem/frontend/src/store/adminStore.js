import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  // Admin sidebar collapse state
  sidebarCollapsed: false,

  // Stats cache
  stats: {
    totalFoods: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  },
  statsLoading: false,
  statsError: null,

  // Notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,

  // Setters
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setStats: (stats) => set({ stats }),
  setStatsLoading: (loading) => set({ statsLoading: loading }),
  setStatsError: (error) => set({ statsError: error }),

  setNotifications: (notifications) => set({ notifications }),
  setNotificationsLoading: (loading) => set({ notificationsLoading: loading }),
  setNotificationsError: (error) => set({ notificationsError: error }),
}));
