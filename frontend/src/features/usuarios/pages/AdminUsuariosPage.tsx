import { useMemo } from 'react'
import { PageHeader } from '@/shared/components/PageHeader'
import { useToastStore } from '@/store/toastStore'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { AdminUsuario } from '@/features/usuarios/types'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/shared/ui/Button'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'

const helper = createColumnHelper<AdminUsuario>()

export function AdminUsuariosPage() {
  const current = useAuthStore((s) => s.user)
  const { data = [], isLoading, error, activar, desactivar } = useUsuarios()
  const mostrar = useToastStore((s) => s.mostrar)
  const columns = useMemo(() => [
    helper.accessor('username', { header: 'Usuario', cell: (info) => <span className="flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-brand-500 text-xs font-black text-white">{info.getValue().slice(0, 2).toUpperCase()}</span>{info.getValue()}</span> }),
    helper.accessor('full_name', { header: 'Nombre' }),
    helper.accessor('email', { header: 'Email' }),
    helper.accessor('role', { header: 'Rol', cell: (info) => <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${info.getValue() === 'admin' ? 'bg-ink text-white' : 'bg-brand-100 text-brand-700'}`}>{info.getValue()}</span> }),
    helper.accessor('disabled', { header: 'Estado', cell: (info) => info.getValue() ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">● Desactivado</span> : <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">● Activo</span> }),
    helper.display({ id: 'acciones', header: 'Acciones', cell: ({ row }) => row.original.id === current?.id ? <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">⭐ Tu cuenta</span> : row.original.disabled ? <Button size="sm" variant="success" onClick={() => { activar(row.original.id).then(() => mostrar(`${row.original.username} activado`)).catch((err: unknown) => mostrar(handleApiError(err), 'error')) }}>Activar</Button> : <Button size="sm" variant="danger" onClick={() => { desactivar(row.original.id).then(() => mostrar(`${row.original.username} desactivado`, 'info')).catch((err: unknown) => mostrar(handleApiError(err), 'error')) }}>Desactivar</Button> }),
  ], [activar, current?.id, desactivar, mostrar])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageIndex: 0, pageSize: 8 } } })
  if (isLoading) return <p className="animate-pulse py-10 text-center text-lg font-semibold text-brand-600">Cargando usuarios…</p>
  if (error) return <EstadoError message={handleApiError(error)} />
  return <div><PageHeader icon="👥" title="Usuarios" subtitle="Activá o desactivá cuentas de clientes." /><div className="fs-panel overflow-x-auto"><table className="fs-table text-left"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex gap-2"><Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div></div>
}
