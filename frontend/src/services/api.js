import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and has token, might be expired
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const locationsApi = {
  getActive: () => api.get('/locations'),
  getAll: () => api.get('/admin/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  getSlots: (id) => api.get(`/locations/${id}/slots`),
  create: (data) => api.post('/admin/locations', data),
  update: (id, data) => api.put(`/admin/locations/${id}`, data),
  delete: (id) => api.delete(`/admin/locations/${id}`),
};

export const slotsApi = {
  getAvailable: (params) => api.get('/slots/available', { params }),
  getFiltered: (params) => api.get('/slots', { params }),
  getById: (id) => api.get(`/slots/${id}`),
  create: (data) => api.post('/admin/slots', data),
  update: (id, data) => api.put(`/admin/slots/${id}`, data),
  delete: (id) => api.delete(`/admin/slots/${id}`),
};

export const vehiclesApi = {
  getMy: () => api.get('/vehicles/my'),
  getAll: () => api.get('/admin/vehicles'),
  add: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const reservationsApi = {
  create: (data) => api.post('/reservations', data),
  getMy: () => api.get('/reservations/my'),
  getById: (id) => api.get(`/reservations/${id}`),
  cancel: (id) => api.put(`/reservations/${id}/cancel`),
  getAllAdmin: (params) => api.get('/admin/reservations', { params }),
  updateStatusAdmin: (id, data) => api.put(`/admin/reservations/${id}/status`, data),
};

export const sessionsApi = {
  checkIn: (reservationId) => api.post(`/parking-sessions/${reservationId}/check-in`),
  checkOut: (reservationId) => api.post(`/parking-sessions/${reservationId}/check-out`),
  getActive: () => api.get('/parking-sessions/active'),
  getHistory: () => api.get('/parking-sessions/history'),
  getAllAdmin: () => api.get('/admin/parking-sessions/all'),
};

export const paymentsApi = {
  getMy: () => api.get('/payments/my'),
  getAllAdmin: () => api.get('/admin/payments'),
  record: (data) => api.post('/payments', data),
};

export const notificationsApi = {
  getMy: () => api.get('/notifications/my'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const dashboardApi = {
  getAdminStats: () => api.get('/admin/dashboard/stats'),
  getCustomerStats: () => api.get('/dashboard/customer'),
  getRevenueReport: () => api.get('/admin/reports/revenue'),
  getOccupancyReport: () => api.get('/admin/reports/occupancy'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getCustomers: () => api.get('/admin/customers'),
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/toggle-status`),
};

export const sensorApi = {
  simulate: (data) => api.post('/admin/sensor/simulate', data),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
