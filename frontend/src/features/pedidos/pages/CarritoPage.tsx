import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/shared/ui/Button'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { PageHeader } from '@/shared/components/PageHeader'
import { IMAGEN_POR_DEFECTO } from '@/features/productos/components/ProductoCard'

const peso = (valor: number) => `$${valor.toLocaleString('es-AR')}`

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const total = useCartStore((s) => s.total())
  const mostrar = useToastStore((s) => s.mostrar)
  const navigate = useNavigate()
  const unidades = items.reduce((sum, item) => sum + item.cantidad, 0)

  if (items.length === 0) {
    return (
      <div>
        <PageHeader icon="🛒" title="Carrito" subtitle="Acá vas a ver los productos que elijas." />
        <EstadoVacio icon="🛒" message="Tu carrito está vacío." action={<Button onClick={() => navigate('/')}>Ver el catálogo</Button>} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🛒" title="Carrito" subtitle={`${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} en tu pedido`} actions={<Button variant="ghost" onClick={() => { vaciar(); mostrar('Carrito vaciado', 'info') }}>🗑️ Vaciar carrito</Button>} />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.producto_id} style={{ animationDelay: `${index * 60}ms` }} className="fs-panel flex animate-fade-up flex-wrap items-center gap-4 p-4 transition hover:shadow-xl">
              <img src={item.imagen_url || IMAGEN_POR_DEFECTO} alt={item.nombre} className="h-20 w-20 rounded-2xl object-cover shadow-md" />
              <div className="min-w-40 flex-1">
                <h2 className="text-lg font-black">{item.nombre}</h2>
                <p className="text-sm text-slate-500">{peso(item.precio_unitario)} c/u · máx. {item.stock}</p>
              </div>
              <div className="flex items-center rounded-2xl bg-brand-50 p-1 ring-1 ring-orange-200">
                <button type="button" className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl text-lg font-black text-brand-700 transition hover:bg-white disabled:opacity-30" disabled={item.cantidad <= 1} onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} aria-label={`Restar ${item.nombre}`}>−</button>
                <input className="w-12 bg-transparent text-center font-black outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" type="number" min={1} max={item.stock} value={item.cantidad} onChange={(e) => cambiarCantidad(item.producto_id, Number(e.target.value))} aria-label={`Cantidad de ${item.nombre}`} />
                <button type="button" className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl text-lg font-black text-brand-700 transition hover:bg-white disabled:opacity-30" disabled={item.cantidad >= item.stock} onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} aria-label={`Sumar ${item.nombre}`}>+</button>
              </div>
              <p className="w-28 text-right text-lg font-black">{peso(item.precio_unitario * item.cantidad)}</p>
              <Button variant="danger" size="sm" onClick={() => { quitar(item.producto_id); mostrar(`${item.nombre} quitado del carrito`, 'info') }}>Quitar</Button>
            </li>
          ))}
        </ul>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="fs-panel overflow-hidden">
            <div className="bg-gradient-to-r from-ink to-[#46264a] px-6 py-4 text-white">
              <h2 className="text-lg font-black">Resumen del pedido</h2>
            </div>
            <div className="space-y-3 p-6">
              {items.map((item) => (
                <div key={item.producto_id} className="flex justify-between text-sm text-slate-600">
                  <span>{item.cantidad} × {item.nombre}</span>
                  <span className="font-semibold">{peso(item.precio_unitario * item.cantidad)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-emerald-600"><span>Envío</span><span className="font-bold">¡Gratis!</span></div>
              <div className="my-2 border-t border-dashed border-orange-200" />
              <div className="flex items-end justify-between">
                <span className="font-semibold text-slate-600">Total</span>
                <span className="text-3xl font-black text-gradient">{peso(total)}</span>
              </div>
              <div className="pt-2"><Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>Continuar →</Button></div>
              <Link to="/" className="block text-center text-sm font-semibold text-brand-600 hover:underline">← Seguir comprando</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
