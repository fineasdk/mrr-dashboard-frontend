import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://sea-lion-app-kpc8g.ondigitalocean.app/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getMetrics: (params?: { currency?: string }) => 
    api.get('/dashboard/metrics', { params }),
  
  getAnalytics: (params?: { 
    start_date?: string; 
    end_date?: string; 
    granularity?: string; 
  }) => 
    api.get('/dashboard/analytics', { params }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    password_confirmation: string; 
  }) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  me: () =>
    api.get('/auth/me'),
  
  refresh: () =>
    api.post('/auth/refresh'),
};

// Customers API
export const customersApi = {
  getAll: (params?: {
    search?: string;
    platform?: string;
    status?: string;
    excluded?: boolean;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }) =>
    api.get('/customers', { params }),
  
  getOne: (id: string) =>
    api.get(`/customers/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/customers/${id}`, data),
  
  bulkUpdate: (data: {
    customer_ids: string[];
    excluded_from_mrr?: boolean;
    exclusion_reason?: string;
    status?: string;
  }) =>
    api.post('/customers/bulk-update', data),
  
  export: (format: string, filters?: any) =>
    api.post('/customers/export', { format, filters }),
};

// Integrations API
export const integrationsApi = {
  getAll: () =>
    api.get('/integrations'),
  
  getOne: (id: string) =>
    api.get(`/integrations/${id}`),
  
  create: (data: {
    platform: string;
    platform_name?: string;
    credentials: any;
    settings?: any;
  }) =>
    api.post('/integrations', data),
  
  update: (id: string, data: any) =>
    api.put(`/integrations/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/integrations/${id}`),
  
  sync: (id: string) =>
    api.post(`/integrations/${id}/sync`),
  
  testConnection: (id: string) =>
    api.post(`/integrations/${id}/test`),
  disconnect: (id: string) =>
    api.post(`/integrations/${id}/disconnect`),
}; 
