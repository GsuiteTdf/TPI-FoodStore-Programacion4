import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategoria, deleteCategoria, listCategorias, updateCategoria } from '@/features/categorias/api/categorias'

export function useCategorias() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const createMutation = useMutation({ mutationFn: createCategoria, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['categorias'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, input }: { id: number; input: { nombre?: string; descripcion?: string } }) => updateCategoria(id, input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['categorias'] }) })
  const deleteMutation = useMutation({ mutationFn: deleteCategoria, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['categorias'] }); await queryClient.invalidateQueries({ queryKey: ['productos'] }) } })
  return { ...query, createCategoria: createMutation.mutateAsync, updateCategoria: updateMutation.mutateAsync, deleteCategoria: deleteMutation.mutateAsync, busy: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending }
}
