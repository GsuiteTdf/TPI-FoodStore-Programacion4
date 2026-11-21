import { formatFecha } from '@/shared/utils/formatFecha'
import { PageHeader } from '@/shared/components/PageHeader'
import { useToastStore } from '@/store/toastStore'
import { useMemo, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useCambiarEstadoPedido, usePedidos } from '@/features/pedidos/hooks/usePedidos'
import type { EstadoPedido, Pedido } from '@/features/pedidos/types'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'

const helper = createColumnHelper<Pedido>()
const ESTADOS: Array<EstadoPedido | ''> = ['', 'PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>()
  const pedidos = usePedidos(estado)
  const cambiar = useCambiarEstadoPedido()
  const mostrar = useToastStore((s) => s.mostrar)
  const transition = (pedido: Pedido, next: EstadoPedido) => { if (confirm(`¿Cambiar pedido #${pedido.id} a ${next}?`)) cambiar.mutateAsync({ id: pedido.id, estado: next }).then(() => mostrar(`Pedido #${pedido.id} → ${next.replace('_', ' ')}`)).catch((err: unknown) => mostrar(handleApiError(err), 'error')) }
  const columns = useMemo(() => [
    helper.accessor('id', { header: '#', cell: (info) => <span className="font-black text-brand-600">#{info.getValue()}</span> }),
    helper.accessor('usuario_id', { header: 'Usuario' }),
    helper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
    helper.accessor('total', { header: 'Total', cell: (info) => <span className="font-black">${info.getValue().toLocaleString('es-AR')}</span> }),
    helper.accessor('created_at', { header: 'Fecha', cell: (info) => formatFecha(info.getValue()) }),
    helper.display({ id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex flex-wrap gap-2">{row.original.estado === 'PENDIENTE' && <><Button size="sm" onClick={() => transition(row.original, 'EN_PREPARACION')}>👨‍🍳 Preparar</Button><Button size="sm" variant="danger" onClick={() => transition(row.original, 'CANCELADO')}>Cancelar</Button></>}{row.original.estado === 'EN_PREPARACION' && <><Button size="sm" variant="success" onClick={() => transition(row.original, 'ENTREGADO')}>✅ Entregar</Button><Button size="sm" variant="danger" onClick={() => transition(row.original, 'CANCELADO')}>Cancelar</Button></>}</div> }),
  ], [cambiar, mostrar])
  const table = useReactTable({ data: pedidos.data?.items ?? [], columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageIndex: 0, pageSize: 8 } } })
  if (pedidos.isLoading) return <p className="animate-pulse py-10 text-center text-lg font-semibold text-brand-600">Cargando pedidos…</p>
  if (pedidos.error) return <EstadoError message={handleApiError(pedidos.error)} />
  return <div><PageHeader icon="🧾" title="Pedidos" subtitle="Máquina de estados y cancelación con restitución de stock." actions={<label className="text-sm font-semibold">Filtrar estado<select className="fs-select ml-2" value={estado ?? ''} onChange={(e) => setEstado(e.target.value ? e.target.value as EstadoPedido : undefined)}>{ESTADOS.map((item) => <option key={item || 'todos'} value={item}>{item || 'Todos'}</option>)}</select></label>} /><div className="fs-panel overflow-x-auto"><table className="fs-table text-left"><thead>{table.getHeaderGroups().map((g) => <tr key={g.id}>{g.headers.map((h) => <th className="px-4 py-3" key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((r) => <tr className="border-t" key={r.id}>{r.getVisibleCells().map((c) => <td className="px-4 py-3" key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex gap-2"><Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div></div>
}
