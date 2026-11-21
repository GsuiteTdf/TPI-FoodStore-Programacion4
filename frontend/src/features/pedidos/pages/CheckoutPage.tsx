import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import { useCrearPedido } from '@/features/pedidos/hooks/usePedidos'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'

type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'
const FORMAS_PAGO: Array<{ valor: FormaPago; titulo: string; detalle: string; icono: string }> = [
  { valor: 'EFECTIVO', titulo: 'Efectivo', detalle: 'Pagás al recibir', icono: '💵' },
  { valor: 'TRANSFERENCIA', titulo: 'Transferencia', detalle: 'Desde tu banco', icono: '🏦' },
]
const peso = (valor: number) => `$${valor.toLocaleString('es-AR')}`

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const mostrar = useToastStore((s) => s.mostrar)
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // Evita que, al vaciar el carrito tras la compra, el guard de abajo mande a /carrito antes que a /mis-pedidos.
  const compraConfirmada = useRef(false)
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const pedido = await crear.mutateAsync({ items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })), forma_pago: value.forma_pago, direccion_entrega: value.direccion_entrega, notas: value.notas.trim() || null })
        compraConfirmada.current = true
        navigate('/mis-pedidos', { replace: true })
        vaciar()
        mostrar(`¡Pedido #${pedido.id} confirmado! Ya lo estamos preparando 🎉`)
      } catch (err) { setError(handleApiError(err)) }
    },
  })
  if (items.length === 0 && !compraConfirmada.current) return <Navigate to="/carrito" replace />

  return (
    <div>
      <PageHeader icon="🧾" title="Confirmar pedido" subtitle="Último paso: decinos dónde y cómo pagás." />
      <ol className="mb-8 flex items-center gap-2 text-sm font-bold">
        {['Carrito', 'Datos de entrega', 'Confirmación'].map((paso, index) => (
          <li key={paso} className="flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${index <= 1 ? 'bg-gradient-to-br from-brand-500 to-rose-500 text-white' : 'bg-orange-100 text-brand-700'}`}>{index === 0 ? '✓' : index + 1}</span>
            <span className={index <= 1 ? 'text-ink' : 'text-slate-400'}>{paso}</span>
            {index < 2 && <span className="h-0.5 w-6 rounded bg-orange-200 sm:w-12" />}
          </li>
        ))}
      </ol>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form className="fs-panel space-y-6 p-6 sm:p-8" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
          {error && <EstadoError message={error} />}
          <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => value.trim().length >= 5 ? undefined : 'Mínimo 5 caracteres' }}>
            {(field) => <Input label="Dirección de entrega" icon="📍" placeholder="Calle, número, piso…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => (
              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">Forma de pago</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {FORMAS_PAGO.map((opcion) => {
                    const activo = field.state.value === opcion.valor
                    return (
                      <label key={opcion.valor} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${activo ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/15' : 'border-orange-100 hover:border-brand-300'}`}>
                        <input type="radio" name="forma_pago" className="sr-only" value={opcion.valor} checked={activo} onChange={() => field.handleChange(opcion.valor)} />
                        <span className="text-3xl">{opcion.icono}</span>
                        <span className="flex-1">
                          <span className="block font-black">{opcion.titulo}</span>
                          <span className="block text-xs text-slate-500">{opcion.detalle}</span>
                        </span>
                        <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${activo ? 'border-brand-500' : 'border-slate-300'}`}>{activo && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}
          </form.Field>
          <form.Field name="notas">
            {(field) => <label className="block text-sm font-semibold text-slate-700">Notas <span className="font-normal text-slate-400">(opcional)</span><textarea rows={3} placeholder="Ej.: tocar timbre, sin cebolla…" className="mt-1.5 w-full rounded-xl border border-orange-200/80 px-3.5 py-2.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} /></label>}
          </form.Field>
          <Button size="lg" className="w-full" disabled={crear.isPending} type="submit">{crear.isPending ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Confirmando…</> : 'Confirmar compra'}</Button>
        </form>

        <aside className="fs-panel h-fit overflow-hidden lg:sticky lg:top-28">
          <div className="bg-gradient-to-r from-ink to-[#46264a] px-6 py-4 text-white"><h2 className="font-black">Tu pedido</h2></div>
          <ul className="divide-y divide-orange-100 px-6">
            {items.map((item) => (
              <li key={item.producto_id} className="flex items-center gap-3 py-3">
                {item.imagen_url && <img src={item.imagen_url} alt="" className="h-11 w-11 rounded-xl object-cover" />}
                <span className="flex-1 text-sm"><span className="font-bold">{item.cantidad}×</span> {item.nombre}</span>
                <span className="text-sm font-semibold">{peso(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-end justify-between border-t border-dashed border-orange-200 px-6 py-5">
            <span className="font-semibold text-slate-600">Total</span>
            <span className="text-3xl font-black text-gradient">{peso(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
