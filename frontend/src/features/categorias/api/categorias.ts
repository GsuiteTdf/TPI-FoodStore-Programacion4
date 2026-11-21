import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '@/features/categorias/types'

export async function listCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}
export async function createCategoria(input: CategoriaInput): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', input)
  return data
}
export async function updateCategoria(id: number, input: Partial<CategoriaInput>): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, input)
  return data
}
export async function deleteCategoria(id: number): Promise<void> { await axiosInstance.delete(`/categorias/${id}`) }
