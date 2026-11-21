import { axiosInstance } from '@/shared/api/axiosInstance'
import type { AdminUsuario } from '@/features/usuarios/types'

export async function listUsuarios(): Promise<AdminUsuario[]> { const { data } = await axiosInstance.get<AdminUsuario[]>('/admin/usuarios'); return data }
export async function activarUsuario(id: number): Promise<AdminUsuario> { const { data } = await axiosInstance.post<AdminUsuario>(`/admin/usuarios/${id}/activar`); return data }
export async function desactivarUsuario(id: number): Promise<AdminUsuario> { const { data } = await axiosInstance.post<AdminUsuario>(`/admin/usuarios/${id}/desactivar`); return data }
