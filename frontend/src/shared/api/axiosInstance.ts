import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: string }>(error)) {
      const status = error.response?.status
      const detail = error.response?.data?.detail
      const url = error.config?.url ?? ''
      const authCall = url.includes('/auth/token') || url.includes('/auth/me')
      if ((status === 401 && !authCall) || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
        useAuthStore.getState().clearSession()
      }
    }
    return Promise.reject(error)
  },
)
