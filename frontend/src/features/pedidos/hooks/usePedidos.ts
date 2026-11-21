import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelPedido, changeEstado, createPedido, getResumen, listPedidos } from '@/features/pedidos/api/pedidos'
import type { EstadoPedido } from '@/features/pedidos/types'

export function usePedidos(estado?: EstadoPedido) { return useQuery({ queryKey: ['pedidos', estado ?? 'todos'], queryFn: () => listPedidos(estado) }) }
export function useCrearPedido() { const qc = useQueryClient(); return useMutation({ mutationFn: createPedido, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['pedidos'] }); await qc.invalidateQueries({ queryKey: ['productos'] }) } }) }
export function useCancelarPedido() { const qc = useQueryClient(); return useMutation({ mutationFn: cancelPedido, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['pedidos'] }); await qc.invalidateQueries({ queryKey: ['productos'] }); await qc.invalidateQueries({ queryKey: ['resumen-pedidos'] }) } }) }
export function useCambiarEstadoPedido() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => changeEstado(id, estado), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['pedidos'] }); await qc.invalidateQueries({ queryKey: ['productos'] }); await qc.invalidateQueries({ queryKey: ['resumen-pedidos'] }) } }) }
export function useResumenPedidos() { return useQuery({ queryKey: ['resumen-pedidos'], queryFn: getResumen }) }
