import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number
  /** Solo para mostrar en el carrito; los carritos guardados antes no la tienen. */
  imagen_url?: string
}

interface CartState {
  items: CartItem[]
  agregar: (item: Omit<CartItem, 'cantidad'>) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item) => set((state) => {
        const existente = state.items.find((current) => current.producto_id === item.producto_id)
        if (existente) {
          return {
            items: state.items.map((current) =>
              current.producto_id === item.producto_id
                ? { ...current, cantidad: Math.min(current.cantidad + 1, item.stock) }
                : current,
            ),
          }
        }
        return { items: [...state.items, { ...item, cantidad: 1 }] }
      }),
      quitar: (productoId) => set((state) => ({ items: state.items.filter((item) => item.producto_id !== productoId) })),
      cambiarCantidad: (productoId, cantidad) => set((state) => ({
        items: state.items.map((item) =>
          item.producto_id === productoId
            ? { ...item, cantidad: Math.max(1, Math.min(cantidad, item.stock)) }
            : item,
        ),
      })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0),
    }),
    { name: 'foodstore-cart', storage: createJSONStorage(() => localStorage) },
  ),
)
