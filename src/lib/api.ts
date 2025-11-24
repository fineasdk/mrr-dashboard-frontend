import axios from 'axios'
import { config } from './config'

const API_BASE_URL = config.apiUrl
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 60000)

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details in development
    if (config.isDevelopment || config.features.debugMode) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      })
    }

    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')

      // Only redirect if not already on login page
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login')
      ) {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.warn('Access forbidden:', error.response?.data?.message)
    } else if (error.response?.status === 404) {
      // Not found
      console.warn('Resource not found:', error.config?.url)
    } else if (error.response?.status >= 500) {
      // Server error
      console.error(
        'Server error:',
        error.response?.status,
        error.response?.data
      )

      // In production, you might want to show a user-friendly message
      if (config.isProduction) {
        // Could dispatch a global error notification here
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout:', error.config?.url)
    } else if (!error.response) {
      // Network error
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Dashboard API
export const dashboardApi = {
  getMetrics: (params?: { currency?: string; include_usage?: boolean; month?: string; mrr_basis?: 'net' | 'gross' }) => {
    const queryParams: Record<string, string | number | undefined> = {
      currency: params?.currency,
      month: params?.month,
      mrr_basis: params?.mrr_basis,
    }

    if (params?.include_usage !== undefined) {
      queryParams.include_usage = params.include_usage ? 1 : 0
    }

    return api.get('/dashboard/metrics', { params: queryParams })
  },

  getAnalytics: (params?: {
    start_date?: string
    end_date?: string
    granularity?: string
    currency?: string
    include_usage?: boolean
    mrr_basis?: 'net' | 'gross'
  }) => {
    const queryParams: Record<string, string | number | undefined> = {
      start_date: params?.start_date,
      end_date: params?.end_date,
      granularity: params?.granularity,
      currency: params?.currency,
      mrr_basis: params?.mrr_basis,
    }

    if (params?.include_usage !== undefined) {
      queryParams.include_usage = params.include_usage ? 1 : 0
    }

    return api.get('/dashboard/analytics', { params: queryParams })
  },

  getMonthlyInvoices: (params: {
    platform: string
    month: string
    currency?: string
    page?: number
    per_page?: number
    search?: string
  }) =>
    api.get(
      `/dashboard/monthly-revenue/${params.platform}/${params.month}/invoices`,
      {
        params: {
          currency: params.currency,
          page: params.page,
          per_page: params.per_page,
          search: params.search,
        },
      }
    ),
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  refresh: () => api.post('/auth/refresh'),
}

// Customers API
export const customersApi = {
  getAll: (params?: {
    search?: string
    platform?: string
    status?: string
    excluded?: boolean
    sort_by?: string
    sort_order?: string
    per_page?: number
    page?: number
    currency?: string
  }) => api.get('/customers', { params }),

  getOne: (id: string) => api.get(`/customers/${id}`),

  update: (id: string, data: any) => api.put(`/customers/${id}`, data),

  bulkUpdate: (data: {
    customer_ids: string[]
    excluded_from_mrr?: boolean
    exclusion_reason?: string
    status?: string
  }) => api.post('/customers/bulk-update', data),

  export: (format: string, filters?: any) =>
    api.post('/customers/export', { format, filters }),
}

// Integrations API
export const integrationsApi = {
  getAll: (params?: { currency?: string }) =>
    api.get('/integrations', { params }),

  getOne: (id: string) => api.get(`/integrations/${id}`),

  create: (data: {
    platform: string
    platform_name?: string
    credentials: any
    settings?: any
  }) => api.post('/integrations', data),

  update: (id: string, data: any) => api.put(`/integrations/${id}`, data),

  delete: (id: string) => api.delete(`/integrations/${id}`),

  sync: (id: string) => api.post(`/integrations/${id}/sync`),

  testConnection: (id: string) => api.post(`/integrations/${id}/test`),
  disconnect: (id: string) => api.post(`/integrations/${id}/disconnect`),

  getSyncSettings: () => api.get('/user/sync-settings'),

  updateSyncSettings: (data: { auto_sync: boolean; sync_frequency: number }) =>
    api.put('/user/sync-settings', data),
}

// Shopify API
export const shopifyApi = {
  initiateOAuth: (data: {
    shop_domain: string
    api_key: string
    api_secret: string
    webhook_secret?: string
  }) => api.post('/shopify/oauth/initiate', data),

  testConnection: () => api.post('/shopify/test-connection'),

  sync: () => api.post('/shopify/sync'),

  // Shop-specific token management
  listShops: () => api.get('/shopify/shops'),

  storeShopToken: (shopDomain: string, data: { access_token: string }) =>
    api.post(`/shopify/shops/${shopDomain}/token`, data),

  getShopToken: (shopDomain: string) =>
    api.get(`/shopify/shops/${shopDomain}/token`),

  removeShopToken: (shopDomain: string) =>
    api.delete(`/shopify/shops/${shopDomain}/token`),

  getShopCustomers: (shopDomain: string) =>
    api.get(`/shopify/shops/${shopDomain}/customers`),

  rebuildMonth: (data: { month: string; integration_id?: string }) =>
    api.post('/shopify/rebuild-month', data),
}

// E-conomic API
export const economicApi = {
  overrideSubscription: (
    invoiceId: string,
    data: {
      is_subscription: boolean
      reason: string
    }
  ) => api.post(`/invoices/${invoiceId}/subscription-override`, data),
}

// Currency API
export const currencyApi = {
  getRates: (params?: { from?: string; to?: string; date?: string }) =>
    api.get('/currency/rates', { params }),

  updateRates: () => api.post('/currency/update-rates'),
}

// Webhook Events API (for debugging)
export const webhookApi = {
  getEvents: (params?: {
    platform?: string
    status?: string
    limit?: number
  }) => api.get('/webhook-events', { params }),

  retryEvent: (eventId: string) => api.post(`/webhook-events/${eventId}/retry`),
}

// MRR Analytics API
export const mrrApi = {
  getChanges: (params?: {
    start_date?: string
    end_date?: string
    change_type?: string
  }) => api.get('/mrr/changes', { params }),

  getExpansion: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/mrr/expansion', { params }),

  getContraction: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/mrr/contraction', { params }),
}
