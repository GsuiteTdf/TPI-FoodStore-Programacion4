import { axiosInstance } from '@/shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '@/features/pedidos/types'

export async function createPedido(input: PedidoCreate): Promise<Pedido> { const { data } = await axiosInstance.post<Pedido>('/pedidos', input); return data }
export async function listPedidos(estado?: EstadoPedido): Promise<PedidosPaginados> { const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params: { skip: 0, limit: 100, estado } }); return data }
export async function cancelPedido(id: number): Promise<Pedido> { const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`); return data }
export async function changeEstado(id: number, estado: EstadoPedido): Promise<Pedido> { const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado }); return data }
export async function getResumen(): Promise<ResumenPedidos> { const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen'); return data }
