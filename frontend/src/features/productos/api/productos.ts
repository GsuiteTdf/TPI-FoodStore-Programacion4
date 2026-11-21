import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Producto, ProductoFilters, ProductoInput, ProductosPaginados } from '@/features/productos/types'

export async function listProductos(filters: ProductoFilters): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params: filters })
  return data
}
export async function createProducto(input: ProductoInput): Promise<Producto> { const { data } = await axiosInstance.post<Producto>('/productos', input); return data }
export async function updateProducto(id: number, input: Partial<ProductoInput>): Promise<Producto> { const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, input); return data }
export async function updateStock(id: number, stock: number, disponible: boolean): Promise<Producto> { const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, { stock, disponible }); return data }
export async function deleteProducto(id: number): Promise<void> { await axiosInstance.delete(`/productos/${id}`) }
