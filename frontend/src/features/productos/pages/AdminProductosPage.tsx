import { useMemo, useState } from 'react'
import { PageHeader } from '@/shared/components/PageHeader'
import { useToastStore } from '@/store/toastStore'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { listCategorias } from '@/features/categorias/api/categorias'
import { useProductoMutations, useProductos } from '@/features/productos/hooks/useProductos'
import type { Producto, ProductoInput } from '@/features/productos/types'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { EstadoError } from '@/shared/components/EstadoError'

const columnHelper = createColumnHelper<Producto>()
const EMPTY = { nombre: '', descripcion: '', precio_base: 0, imagen_url: '', stock: 0, disponible: true, categoria_id: 0 }

export function AdminProductosPage() {
  const products = useProductos({ skip: 0, limit: 100 })
  const categories = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const { createProducto, updateProducto, updateStock, deleteProducto, busy } = useProductoMutations()
  const [selected, setSelected] = useState<Producto | null>(null)
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const mostrarError = (err: unknown) => setPageError(handleApiError(err))
  const mostrar = useToastStore((s) => s.mostrar)
  const form = useForm({
    defaultValues: EMPTY,
    onSubmit: async ({ value }) => {
      const input: ProductoInput = { ...value, precio_base: Number(value.precio_base), stock: Number(value.stock), categoria_id: Number(value.categoria_id) }
      setFormError(null)
      try {
        if (selected) await updateProducto({ id: selected.id, input })
        else await createProducto(input)
        mostrar(selected ? 'Producto actualizado' : 'Producto creado'); setOpen(false); setSelected(null); form.reset(EMPTY, { keepDefaultValues: true })
      } catch (err) { setFormError(handleApiError(err)) }
    },
  })
  const columns = useMemo(() => [
    columnHelper.accessor('nombre', { header: 'Producto', cell: (info) => <span className="flex items-center gap-3 font-bold"><img src={info.row.original.imagen_url || 'https://placehold.co/80x80?text=FS'} alt="" className="h-11 w-11 rounded-xl object-cover shadow" />{info.getValue()}</span> }),
    columnHelper.accessor((row) => row.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => `$${info.getValue().toLocaleString('es-AR')}` }),
    columnHelper.accessor('stock', { header: 'Stock', cell: (info) => <span className={`rounded-full px-2.5 py-1 text-xs font-black ${info.getValue() === 0 ? 'bg-rose-100 text-rose-700' : info.getValue() <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{info.getValue()}</span> }),
    columnHelper.accessor('disponible', { header: 'Disponible', cell: (info) => info.getValue() ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">● Sí</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">○ No</span> }),
    columnHelper.display({ id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex flex-nowrap gap-1.5"><Button size="sm" variant="secondary" onClick={() => { const p = row.original; setSelected(p); form.reset({ nombre: p.nombre, descripcion: p.descripcion, precio_base: p.precio_base, imagen_url: p.imagen_url, stock: p.stock, disponible: p.disponible, categoria_id: p.categoria_id }, { keepDefaultValues: true }); setOpen(true) }}>Editar</Button><Button size="sm" variant="secondary" onClick={() => { const value = prompt('Nuevo stock', String(row.original.stock)); if (value !== null && Number.isFinite(Number(value)) && Number(value) >= 0) { setPageError(null); updateStock({ id: row.original.id, stock: Number(value), disponible: row.original.disponible }).catch(mostrarError) } }}>Stock</Button><Button size="sm" variant="secondary" onClick={() => { setPageError(null); updateStock({ id: row.original.id, stock: row.original.stock, disponible: !row.original.disponible }).catch(mostrarError) }}>{row.original.disponible ? 'Ocultar' : 'Habilitar'}</Button><Button size="sm" variant="danger" onClick={() => { if (confirm('¿Dar de baja este producto?')) { setPageError(null); deleteProducto(row.original.id).then(() => mostrar('Producto dado de baja', 'info')).catch(mostrarError) } }}>Eliminar</Button></div> }),
  ], [deleteProducto, form, updateStock])
  const table = useReactTable({ data: products.data?.items ?? [], columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageIndex: 0, pageSize: 8 } } })
  if (products.isLoading) return <p className="animate-pulse py-10 text-center text-lg font-semibold text-brand-600">Cargando productos…</p>
  if (products.error) return <EstadoError message={handleApiError(products.error)} />
  return <div><PageHeader icon="🍕" title="Productos" subtitle="ABM, stock y disponibilidad." actions={<Button onClick={() => { setSelected(null); form.reset({ ...EMPTY, categoria_id: categories.data?.[0]?.id ?? 0 }, { keepDefaultValues: true }); setOpen(true) }}>Nuevo producto</Button>} />{pageError && <div className="mb-4"><EstadoError message={pageError} /></div>}<div className="fs-panel overflow-x-auto"><table className="fs-table text-left"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th className="px-4 py-3" key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr className="border-t" key={row.id}>{row.getVisibleCells().map((cell) => <td className="px-4 py-3" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex gap-2"><Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div><Modal open={open} title={selected ? 'Editar producto' : 'Nuevo producto'} onClose={() => setOpen(false)}><form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>{formError && <div className="md:col-span-2"><EstadoError message={formError} /></div>}<form.Field name="nombre" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Nombre obligatorio' }}>{(field) => <Input label="Nombre" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}</form.Field><form.Field name="precio_base" validators={{ onChange: ({ value }) => Number(value) >= 0 ? undefined : 'Precio inválido' }}>{(field) => <Input type="number" min="0" step="0.01" label="Precio" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} error={field.state.meta.errors[0]} />}</form.Field><form.Field name="descripcion">{(field) => <Input label="Descripción" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</form.Field><form.Field name="imagen_url">{(field) => <Input label="URL de imagen" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</form.Field><form.Field name="stock">{(field) => <Input type="number" min="0" label="Stock" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} />}</form.Field><form.Field name="categoria_id">{(field) => <label className="block text-sm font-semibold text-slate-700">Categoría<select className="fs-select mt-1.5 w-full" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}><option value={0}>Seleccionar…</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select></label>}</form.Field><form.Field name="disponible">{(field) => <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />Disponible</label>}</form.Field><div className="md:col-span-2"><Button disabled={busy} type="submit" className="w-full">💾 Guardar</Button></div></form></Modal></div>
}
