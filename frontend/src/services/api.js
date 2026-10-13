import axios from 'axios';
import {
  mockUsers,
  mockLocations,
  mockSlots,
  mockVehicles,
  mockReservations,
  mockActiveSessions,
  mockPayments,
  mockNotifications,
  mockAdminStats,
  mockCustomerStats,
  mockRevenueReport,
  mockOccupancyReport,
  mockAuditLogs,
} from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
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
      if (localStorage.getItem('token') && !localStorage.getItem('token').startsWith('mock-jwt-')) {
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

// --- LocalStorage Persistence Helpers for Demo Mode ---
const getStorageItem = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error', e);
  }
};

// Wrapper that attempts real backend first, then falls back to demo data if unreachable
const safeRequest = async (requestFn, fallbackFn) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    // If backend is offline or returned 404 / 502 / network error on Vercel preview
    if (!error.response || [404, 502, 503, 504].includes(error.response.status)) {
      console.warn('[SmartPark] Backend offline or unreachable. Using demo fallback data.');
      const fallbackData = await fallbackFn();
      return { data: fallbackData, status: 200, isDemoFallback: true };
    }
    throw error;
  }
};

// --- AUTH API ---
export const authApi = {
  login: async (credentials) => {
    return safeRequest(
      () => api.post('/auth/login', credentials),
      () => {
        const emailLower = (credentials.email || '').toLowerCase().trim();
        if (emailLower === 'admin@parking.com' || emailLower.includes('admin')) {
          return mockUsers.admin;
        }
        return {
          ...mockUsers.customer,
          email: credentials.email,
          fullName: credentials.email.split('@')[0] || 'Demo Customer',
        };
      }
    );
  },

  register: async (registerData) => {
    return safeRequest(
      () => api.post('/auth/register', registerData),
      () => ({
        id: Date.now(),
        fullName: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone || '+1-555-0100',
        role: registerData.role || 'CUSTOMER',
        token: 'mock-jwt-customer-smartpark-token-2026',
      })
    );
  },

  getMe: async () => {
    return safeRequest(
      () => api.get('/auth/me'),
      () => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : mockUsers.customer;
      }
    );
  },

  updateProfile: async (data) => {
    return safeRequest(
      () => api.put('/auth/profile', data),
      () => {
        const saved = getStorageItem('user', mockUsers.customer);
        const updated = { ...saved, ...data };
        setStorageItem('user', updated);
        return updated;
      }
    );
  },
};

// --- LOCATIONS API ---
export const locationsApi = {
  getActive: () =>
    safeRequest(
      () => api.get('/locations'),
      () => getStorageItem('demo_locations', mockLocations)
    ),

  getAll: () =>
    safeRequest(
      () => api.get('/admin/locations'),
      () => getStorageItem('demo_locations', mockLocations)
    ),

  getById: (id) =>
    safeRequest(
      () => api.get(`/locations/${id}`),
      () => {
        const list = getStorageItem('demo_locations', mockLocations);
        return list.find((loc) => loc.id === Number(id)) || list[0];
      }
    ),

  getSlots: (id) =>
    safeRequest(
      () => api.get(`/locations/${id}/slots`),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        return slots.filter((s) => s.locationId === Number(id));
      }
    ),

  create: (data) =>
    safeRequest(
      () => api.post('/admin/locations', data),
      () => {
        const list = getStorageItem('demo_locations', mockLocations);
        const newLoc = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        setStorageItem('demo_locations', [...list, newLoc]);
        return newLoc;
      }
    ),

  update: (id, data) =>
    safeRequest(
      () => api.put(`/admin/locations/${id}`, data),
      () => {
        const list = getStorageItem('demo_locations', mockLocations);
        const updated = list.map((loc) => (loc.id === Number(id) ? { ...loc, ...data } : loc));
        setStorageItem('demo_locations', updated);
        return { ...data, id: Number(id) };
      }
    ),

  delete: (id) =>
    safeRequest(
      () => api.delete(`/admin/locations/${id}`),
      () => {
        const list = getStorageItem('demo_locations', mockLocations);
        setStorageItem('demo_locations', list.filter((loc) => loc.id !== Number(id)));
        return { success: true };
      }
    ),
};

// --- SLOTS API ---
export const slotsApi = {
  getAvailable: (params) =>
    safeRequest(
      () => api.get('/slots/available', { params }),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        return slots.filter((s) => s.status === 'AVAILABLE');
      }
    ),

  getFiltered: (params) =>
    safeRequest(
      () => api.get('/slots', { params }),
      () => {
        let slots = getStorageItem('demo_slots', mockSlots);
        if (params?.locationId) {
          slots = slots.filter((s) => s.locationId === Number(params.locationId));
        }
        if (params?.status) {
          slots = slots.filter((s) => s.status === params.status);
        }
        if (params?.vehicleType) {
          slots = slots.filter((s) => s.vehicleType === params.vehicleType);
        }
        return slots;
      }
    ),

  getById: (id) =>
    safeRequest(
      () => api.get(`/slots/${id}`),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        return slots.find((s) => s.id === Number(id)) || slots[0];
      }
    ),

  create: (data) =>
    safeRequest(
      () => api.post('/admin/slots', data),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        const newSlot = { ...data, id: Date.now(), status: data.status || 'AVAILABLE' };
        setStorageItem('demo_slots', [...slots, newSlot]);
        return newSlot;
      }
    ),

  update: (id, data) =>
    safeRequest(
      () => api.put(`/admin/slots/${id}`, data),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        const updated = slots.map((s) => (s.id === Number(id) ? { ...s, ...data } : s));
        setStorageItem('demo_slots', updated);
        return { ...data, id: Number(id) };
      }
    ),

  delete: (id) =>
    safeRequest(
      () => api.delete(`/admin/slots/${id}`),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        setStorageItem('demo_slots', slots.filter((s) => s.id !== Number(id)));
        return { success: true };
      }
    ),
};

// --- VEHICLES API ---
export const vehiclesApi = {
  getMy: () =>
    safeRequest(
      () => api.get('/vehicles/my'),
      () => getStorageItem('demo_vehicles', mockVehicles)
    ),

  getAll: () =>
    safeRequest(
      () => api.get('/admin/vehicles'),
      () => getStorageItem('demo_vehicles', mockVehicles)
    ),

  add: (data) =>
    safeRequest(
      () => api.post('/vehicles', data),
      () => {
        const list = getStorageItem('demo_vehicles', mockVehicles);
        const newVehicle = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        setStorageItem('demo_vehicles', [newVehicle, ...list]);
        return newVehicle;
      }
    ),

  update: (id, data) =>
    safeRequest(
      () => api.put(`/vehicles/${id}`, data),
      () => {
        const list = getStorageItem('demo_vehicles', mockVehicles);
        const updated = list.map((v) => (v.id === Number(id) ? { ...v, ...data } : v));
        setStorageItem('demo_vehicles', updated);
        return { ...data, id: Number(id) };
      }
    ),

  delete: (id) =>
    safeRequest(
      () => api.delete(`/vehicles/${id}`),
      () => {
        const list = getStorageItem('demo_vehicles', mockVehicles);
        setStorageItem('demo_vehicles', list.filter((v) => v.id !== Number(id)));
        return { success: true };
      }
    ),
};

// --- RESERVATIONS API ---
export const reservationsApi = {
  create: (data) =>
    safeRequest(
      () => api.post('/reservations', data),
      () => {
        const list = getStorageItem('demo_reservations', mockReservations);
        const slots = getStorageItem('demo_slots', mockSlots);
        const slot = slots.find((s) => s.id === Number(data.slotId)) || mockSlots[0];
        const newRes = {
          id: Date.now(),
          bookingReference: `SP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: 2,
          userName: 'Alex Johnson',
          userEmail: 'customer@parking.com',
          vehicleId: data.vehicleId,
          vehicleRegistration: 'KA-01-MJ-5021',
          vehicleType: slot.vehicleType,
          slotId: slot.id,
          slotNumber: slot.slotNumber,
          locationId: slot.locationId,
          locationName: slot.locationId === 1 ? 'Downtown Grand Center' : 'Airport Terminal Hub',
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'CONFIRMED',
          estimatedAmount: 18.00,
          finalAmount: 18.00,
          createdAt: new Date().toISOString(),
        };
        setStorageItem('demo_reservations', [newRes, ...list]);
        return newRes;
      }
    ),

  getMy: () =>
    safeRequest(
      () => api.get('/reservations/my'),
      () => getStorageItem('demo_reservations', mockReservations)
    ),

  getById: (id) =>
    safeRequest(
      () => api.get(`/reservations/${id}`),
      () => {
        const list = getStorageItem('demo_reservations', mockReservations);
        return list.find((r) => r.id === Number(id)) || list[0];
      }
    ),

  cancel: (id) =>
    safeRequest(
      () => api.put(`/reservations/${id}/cancel`),
      () => {
        const list = getStorageItem('demo_reservations', mockReservations);
        const updated = list.map((r) => (r.id === Number(id) ? { ...r, status: 'CANCELLED' } : r));
        setStorageItem('demo_reservations', updated);
        return { success: true, status: 'CANCELLED' };
      }
    ),

  getAllAdmin: (params) =>
    safeRequest(
      () => api.get('/admin/reservations', { params }),
      () => getStorageItem('demo_reservations', mockReservations)
    ),

  updateStatusAdmin: (id, data) =>
    safeRequest(
      () => api.put(`/admin/reservations/${id}/status`, data),
      () => {
        const list = getStorageItem('demo_reservations', mockReservations);
        const updated = list.map((r) => (r.id === Number(id) ? { ...r, ...data } : r));
        setStorageItem('demo_reservations', updated);
        return { success: true };
      }
    ),
};

// --- SESSIONS API ---
export const sessionsApi = {
  checkIn: (reservationId) =>
    safeRequest(
      () => api.post(`/parking-sessions/${reservationId}/check-in`),
      () => {
        const newSession = {
          id: Date.now(),
          reservationId: Number(reservationId),
          bookingReference: 'SP-2026-8812',
          slotNumber: 'A-103',
          locationName: 'Downtown Grand Center',
          vehicleRegistration: 'KA-01-MJ-5021',
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          durationMinutes: 1,
          hourlyRate: 4.50,
          totalAmount: 4.50,
          paymentStatus: 'PENDING',
        };
        const active = getStorageItem('demo_sessions', mockActiveSessions);
        setStorageItem('demo_sessions', [newSession, ...active]);
        return newSession;
      }
    ),

  checkOut: (reservationId) =>
    safeRequest(
      () => api.post(`/parking-sessions/${reservationId}/check-out`),
      () => {
        const active = getStorageItem('demo_sessions', mockActiveSessions);
        const filtered = active.filter((s) => s.reservationId !== Number(reservationId));
        setStorageItem('demo_sessions', filtered);
        return {
          success: true,
          checkOutTime: new Date().toISOString(),
          durationMinutes: 60,
          totalAmount: 4.50,
          paymentStatus: 'COMPLETED',
        };
      }
    ),

  getActive: () =>
    safeRequest(
      () => api.get('/parking-sessions/active'),
      () => getStorageItem('demo_sessions', mockActiveSessions)
    ),

  getHistory: () =>
    safeRequest(
      () => api.get('/parking-sessions/history'),
      () => [
        {
          id: 99,
          bookingReference: 'SP-2026-3100',
          slotNumber: 'A-101',
          locationName: 'Downtown Grand Center',
          vehicleRegistration: 'KA-01-MJ-5021',
          checkInTime: '2026-10-10T12:00:00',
          checkOutTime: '2026-10-10T16:00:00',
          durationMinutes: 240,
          hourlyRate: 4.50,
          totalAmount: 18.00,
          paymentStatus: 'COMPLETED',
        },
      ]
    ),

  getAllAdmin: () =>
    safeRequest(
      () => api.get('/admin/parking-sessions/all'),
      () => getStorageItem('demo_sessions', mockActiveSessions)
    ),
};

// --- PAYMENTS API ---
export const paymentsApi = {
  getMy: () =>
    safeRequest(
      () => api.get('/payments/my'),
      () => mockPayments
    ),

  getAllAdmin: () =>
    safeRequest(
      () => api.get('/admin/payments'),
      () => mockPayments
    ),

  record: (data) =>
    safeRequest(
      () => api.post('/payments', data),
      () => ({ ...data, id: Date.now(), paymentStatus: 'COMPLETED', paidAt: new Date().toISOString() })
    ),
};

// --- NOTIFICATIONS API ---
export const notificationsApi = {
  getMy: () =>
    safeRequest(
      () => api.get('/notifications/my'),
      () => getStorageItem('demo_notifications', mockNotifications)
    ),

  markRead: (id) =>
    safeRequest(
      () => api.put(`/notifications/${id}/read`),
      () => {
        const notifs = getStorageItem('demo_notifications', mockNotifications);
        const updated = notifs.map((n) => (n.id === Number(id) ? { ...n, isRead: true } : n));
        setStorageItem('demo_notifications', updated);
        return { success: true };
      }
    ),
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getAdminStats: () =>
    safeRequest(
      () => api.get('/admin/dashboard/stats'),
      () => mockAdminStats
    ),

  getCustomerStats: () =>
    safeRequest(
      () => api.get('/dashboard/customer'),
      () => mockCustomerStats
    ),

  getRevenueReport: () =>
    safeRequest(
      () => api.get('/admin/reports/revenue'),
      () => mockRevenueReport
    ),

  getOccupancyReport: () =>
    safeRequest(
      () => api.get('/admin/reports/occupancy'),
      () => mockOccupancyReport
    ),

  getAuditLogs: () =>
    safeRequest(
      () => api.get('/admin/audit-logs'),
      () => mockAuditLogs
    ),

  getCustomers: () =>
    safeRequest(
      () => api.get('/admin/customers'),
      () => [
        { id: 2, fullName: 'Alex Johnson', email: 'customer@parking.com', phone: '+1-555-019-2834', enabled: true, createdAt: '2026-10-02T10:00:00' },
        { id: 3, fullName: 'Jane Smith', email: 'jane@parking.com', phone: '+1-555-014-9982', enabled: true, createdAt: '2026-10-03T11:30:00' },
      ]
    ),

  toggleCustomerStatus: (id) =>
    safeRequest(
      () => api.put(`/admin/customers/${id}/toggle-status`),
      () => ({ success: true })
    ),
};

// --- SENSOR API ---
export const sensorApi = {
  simulate: (data) =>
    safeRequest(
      () => api.post('/admin/sensor/simulate', data),
      () => {
        const slots = getStorageItem('demo_slots', mockSlots);
        const updated = slots.map((s) => (s.id === Number(data.slotId) ? { ...s, status: data.status } : s));
        setStorageItem('demo_slots', updated);
        return { success: true, slotId: data.slotId, newStatus: data.status };
      }
    ),
};

// --- HEALTH API ---
export const healthApi = {
  check: () =>
    safeRequest(
      () => api.get('/health'),
      () => ({ status: 'UP', message: 'Demo mode active' })
    ),
};

export default api;
