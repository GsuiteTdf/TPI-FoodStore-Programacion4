import { create } from 'zustand'

export type ToastTipo = 'exito' | 'error' | 'info'

export interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
}

interface ToastState {
  toasts: Toast[]
  mostrar: (mensaje: string, tipo?: ToastTipo) => void
  cerrar: (id: number) => void
}

let siguienteId = 1

/** Notificaciones efímeras de UI (no son estado del servidor, por eso viven en Zustand). */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  mostrar: (mensaje, tipo = 'exito') => {
    const id = siguienteId++
    set((state) => ({ toasts: [...state.toasts.slice(-3), { id, tipo, mensaje }] }))
    window.setTimeout(() => get().cerrar(id), 3200)
  },
  cerrar: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
