import { useMemo, useState } from 'react'
import { PageHeader } from '@/shared/components/PageHeader'
import { useToastStore } from '@/store/toastStore'
import { useForm } from '@tanstack/react-form'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { Categoria } from '@/features/categorias/types'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { EstadoError } from '@/shared/components/EstadoError'

const columnHelper = createColumnHelper<Categoria>()
const EMPTY = { nombre: '', descripcion: '' }

export function AdminCategoriasPage() {
  const { data = [], isLoading, error, createCategoria, updateCategoria, deleteCategoria, busy } = useCategorias()
  const [selected, setSelected] = useState<Categoria | null>(null)
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const mostrar = useToastStore((s) => s.mostrar)
  const form = useForm({
    defaultValues: EMPTY,
    onSubmit: async ({ value }) => {
      setFormError(null)
      try {
        if (selected) await updateCategoria({ id: selected.id, input: value })
        else await createCategoria(value)
        mostrar(selected ? 'Categoría actualizada' : 'Categoría creada'); setOpen(false); setSelected(null); form.reset(EMPTY, { keepDefaultValues: true })
      } catch (err) { setFormError(handleApiError(err)) }
    },
  })
  const columns = useMemo(() => [
    columnHelper.accessor('nombre', { header: 'Nombre', cell: (info) => <span className="inline-flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-rose-100">🏷️</span>{info.getValue()}</span> }),
    columnHelper.accessor('descripcion', { header: 'Descripción' }),
    columnHelper.display({ id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { const c = row.original; setSelected(c); form.reset({ nombre: c.nombre, descripcion: c.descripcion }, { keepDefaultValues: true }); setOpen(true) }}>Editar</Button><Button size="sm" variant="danger" onClick={() => { if (confirm('¿Dar de baja esta categoría?')) { setPageError(null); deleteCategoria(row.original.id).then(() => mostrar('Categoría dada de baja', 'info')).catch((err: unknown) => setPageError(handleApiError(err))) } }}>Eliminar</Button></div> }),
  ], [deleteCategoria, form, updateCategoria])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8, pageIndex: 0 } } })
  if (isLoading) return <p className="animate-pulse py-10 text-center text-lg font-semibold text-brand-600">Cargando categorías…</p>
  if (error) return <EstadoError message={handleApiError(error)} />
  return <div><PageHeader icon="🏷️" title="Categorías" subtitle="ABM con baja lógica." actions={<Button onClick={() => { setSelected(null); form.reset(EMPTY, { keepDefaultValues: true }); setOpen(true) }}>Nueva categoría</Button>} />{pageError && <div className="mb-4"><EstadoError message={pageError} /></div>}<div className="fs-panel overflow-x-auto"><table className="fs-table text-left"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex gap-2"><Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div><Modal open={open} title={selected ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setOpen(false)}><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>{formError && <EstadoError message={formError} />}<form.Field name="nombre" validators={{ onChange: ({ value }) => value.trim().length >= 2 ? undefined : 'Mínimo 2 caracteres' }}>{(field) => <Input label="Nombre" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}</form.Field><form.Field name="descripcion">{(field) => <Input label="Descripción" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</form.Field><Button disabled={busy} type="submit" className="w-full">💾 Guardar</Button></form></Modal></div>
}
