import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Usuario } from '@/features/auth/types'

interface AuthState {
  user: Usuario | null
  checking: boolean
  login: (username: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      checking: true,
      login: async (username, password) => {
        const body = new URLSearchParams({ username, password })
        await axiosInstance.post('/auth/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const { data } = await axiosInstance.get<Usuario>('/auth/me')
        set({ user: data, checking: false })
        return data
      },
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout')
        } finally {
          set({ user: null, checking: false })
        }
      },
      checkSession: async () => {
        set({ checking: true })
        try {
          const { data } = await axiosInstance.get<Usuario>('/auth/me')
          set({ user: data, checking: false })
        } catch {
          set({ user: null, checking: false })
        }
      },
      clearSession: () => set({ user: null, checking: false }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
