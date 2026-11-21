import { axiosInstance } from '@/shared/api/axiosInstance'
import type { RegisterInput, Usuario } from '@/features/auth/types'

export async function registerUser(input: RegisterInput): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', input)
  return data
}
