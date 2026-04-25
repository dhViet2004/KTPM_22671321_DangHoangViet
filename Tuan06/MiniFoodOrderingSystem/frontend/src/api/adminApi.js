import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Food Service ─────────────────────────────────────────────────────────────
export const foodApi = {
  getAll: () => api.get('/api/foods'),
  getById: (id) => api.get(`/api/foods/${id}`),
  create: (data) => api.post('/api/foods', data),
  update: (id, data) => api.put(`/api/foods/${id}`, data),
  delete: (id) => api.delete(`/api/foods/${id}`),
};

// ── Order Service ────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

// ── User Service ─────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  validate: (id) => api.get(`/api/users/${id}/validate`),
};

// ── Payment Service ───────────────────────────────────────────────────────────
export const paymentApi = {
  getAll: () => api.get('/api/payments'),
  process: (data) => api.post('/api/payments', data),
};

// ── Notification Service ──────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/api/notifications'),
  send: (data) => api.post('/api/notifications', data),
};
