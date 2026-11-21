import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listUsuarios } from '@/features/usuarios/api/usuarios'

export function useUsuarios() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['usuarios'], queryFn: listUsuarios })
  const activar = useMutation({ mutationFn: activarUsuario, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }) })
  const desactivar = useMutation({ mutationFn: desactivarUsuario, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }) })
  return { ...query, activar: activar.mutateAsync, desactivar: desactivar.mutateAsync }
}
