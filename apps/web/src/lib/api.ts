import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getSession, signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession()
    const accessToken = (session as { accessToken?: string } | null | undefined)?.accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const session = await getSession()
        const refreshToken = (session as { refreshToken?: string } | null | undefined)?.refreshToken

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken
          })

          const { accessToken, refreshToken: nextRefreshToken } = response.data.data
          // Update session (this would need next-auth update logic)
          // For now, just retry with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          if (nextRefreshToken) {
            ;(originalRequest.headers as any).refreshToken = nextRefreshToken
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, sign out
        await signOut({ callbackUrl: '/login' })
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const message = (error.response?.data as any)?.error?.message || error.message || 'Terjadi kesalahan'
    const code = (error.response?.data as any)?.error?.code || 'UNKNOWN_ERROR'

    return Promise.reject({ message, code, status: error.response?.status })
  }
)

// API endpoints
export const endpoints = {
  auth: {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    refresh: (data: any) => api.post('/auth/refresh', data),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
    resetPassword: (data: any) => api.post('/auth/reset-password', data),
    verifyEmail: (data: any) => api.post('/auth/verify-email', data)
  },
  events: {
    list: (params?: any) => api.get('/events', { params }),
    get: (slug: string) => api.get(`/events/${slug}`),
    lineup: (slug: string) => api.get(`/events/${slug}/lineup`),
    schedule: (slug: string) => api.get(`/events/${slug}/schedule`),
    ticketTypes: (slug: string) => api.get(`/events/${slug}/ticket-types`),
    gallery: (slug: string) => api.get(`/events/${slug}/gallery`)
  },
  orders: {
    create: (data: any) => api.post('/orders', data),
    list: (params?: any) => api.get('/orders', { params }),
    get: (id: string) => api.get(`/orders/${id}`),
    cancel: (id: string) => api.post(`/orders/${id}/cancel`)
  },
  payments: {
    create: (data: any) => api.post('/payments/create', data),
    status: (orderId: string) => api.get(`/payments/${orderId}/status`)
  },
  tickets: {
    list: (params?: any) => api.get('/tickets', { params }),
    get: (id: string) => api.get(`/tickets/${id}`),
    download: (id: string) => api.get(`/tickets/${id}/download`, { responseType: 'blob' }),
    resend: (id: string) => api.post(`/tickets/${id}/resend`)
  },
  checkIn: {
    validate: (data: any) => api.post('/check-in/validate', data),
    sync: (data: any) => api.post('/check-in/sync', data)
  },
  admin: {
    events: {
      list: (params?: any) => api.get('/admin/events', { params }),
      create: (data: any) => api.post('/admin/events', data),
      get: (id: string) => api.get(`/admin/events/${id}`),
      update: (id: string, data: any) => api.put(`/admin/events/${id}`, data),
      delete: (id: string) => api.delete(`/admin/events/${id}`)
    },
    dashboard: (params?: any) => api.get('/admin/dashboard', { params }),
    reports: {
      sales: (params?: any) => api.get('/admin/reports/sales', { params }),
      finance: (params?: any) => api.get('/admin/reports/finance', { params }),
      checkins: (params?: any) => api.get('/admin/reports/checkins', { params }),
      export: (type: string, params?: any) =>
        api.get(`/admin/reports/${type}/export`, { params, responseType: 'blob' })
    }
  }
}

export default api