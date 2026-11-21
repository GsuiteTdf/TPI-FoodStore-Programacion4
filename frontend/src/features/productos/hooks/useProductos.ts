import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProducto, deleteProducto, listProductos, updateProducto, updateStock } from '@/features/productos/api/productos'
import type { ProductoFilters, ProductoInput } from '@/features/productos/types'

export function useProductos(filters: ProductoFilters) {
  return useQuery({ queryKey: ['productos', filters], queryFn: () => listProductos(filters) })
}

export function useProductoMutations() {
  const queryClient = useQueryClient()
  const invalidate = async () => queryClient.invalidateQueries({ queryKey: ['productos'] })
  const createMutation = useMutation({ mutationFn: createProducto, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, input }: { id: number; input: Partial<ProductoInput> }) => updateProducto(id, input), onSuccess: invalidate })
  const stockMutation = useMutation({ mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) => updateStock(id, stock, disponible), onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: deleteProducto, onSuccess: invalidate })
  return { createProducto: createMutation.mutateAsync, updateProducto: updateMutation.mutateAsync, updateStock: stockMutation.mutateAsync, deleteProducto: deleteMutation.mutateAsync, busy: createMutation.isPending || updateMutation.isPending || stockMutation.isPending || deleteMutation.isPending }
}
