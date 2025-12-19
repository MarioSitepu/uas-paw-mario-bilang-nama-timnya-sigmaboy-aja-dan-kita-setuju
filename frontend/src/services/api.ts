import axios from 'axios';

// Base URL for API - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6543';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
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

// ==================== AUTH API ====================
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    specialization?: string;
  }) => api.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  googleLogin: (token: string) => api.post('/api/auth/google', { token }),

  logout: () => api.post('/api/auth/logout'),

  getMe: () => api.get('/api/auth/me'),
  
  // Generic get method for other API endpoints
  get: (url: string) => api.get(url),
  
  // Generic post method for other API endpoints
  post: (url: string, data?: any) => api.post(url, data),
  
  // Generic put method for other API endpoints
  put: (url: string, data?: any) => api.put(url, data),
  
  // Generic delete method for other API endpoints
  delete: (url: string) => api.delete(url),
};

// ==================== DOCTORS API ====================
export const doctorsAPI = {
  getAll: (params?: { specialization?: string }) =>
    api.get('/api/doctors', { params }),

  getById: (id: number) => api.get(`/api/doctors/${id}`),

  update: (id: number, data: unknown) => api.put(`/api/doctors/${id}`, data),

  getSchedule: (id: number) => api.get(`/api/doctors/${id}/schedule`),

  updateSchedule: (id: number, schedule: unknown) =>
    api.put(`/api/doctors/${id}/schedule`, { schedule }),

  getSpecializations: () => api.get('/api/specializations'),
};

// ==================== APPOINTMENTS API ====================
export const appointmentsAPI = {
  getAll: (params?: { status?: string; date?: string }) =>
    api.get('/api/appointments', { params }),

  getById: (id: number) => api.get(`/api/appointments/${id}`),

  create: (data: {
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
  }) => api.post('/api/appointments', data),

  update: (id: number, data: unknown) => api.put(`/api/appointments/${id}`, data),

  cancel: (id: number) => api.delete(`/api/appointments/${id}`),

  getToday: () => api.get('/api/appointments/today'),

  getHistory: () => api.get('/api/appointments/history'),
};

// ==================== MEDICAL RECORDS API ====================
export const medicalRecordsAPI = {
  getAll: () => api.get('/api/medical-records'),

  getById: (id: number) => api.get(`/api/medical-records/${id}`),

  create: (data: {
    appointment_id: number;
    diagnosis: string;
    symptoms?: string;
    treatment?: string;
    prescription?: string;
    notes?: string;
  }) => api.post('/api/medical-records', data),

  update: (id: number, data: unknown) => api.put(`/api/medical-records/${id}`, data),

  getByAppointment: (appointmentId: number) =>
    api.get(`/api/appointments/${appointmentId}/record`),

  getPatientRecords: (patientId: number) =>
    api.get(`/api/patients/${patientId}/records`),
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  get: () => api.get('/api/dashboard'),
};

// ==================== USERS API ====================
export const usersAPI = {
  getAll: () => api.get('/api/users'),

  getById: (id: number) => api.get(`/api/users/${id}`),

  create: (data: unknown) => api.post('/api/users', data),

  update: (id: number, data: unknown) => api.put(`/api/users/${id}`, data),

  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export default api;
