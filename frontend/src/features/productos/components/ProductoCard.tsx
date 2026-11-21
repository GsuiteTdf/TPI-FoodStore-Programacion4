import { useEffect, useState } from 'react'
import type { Producto } from '@/features/productos/types'
import { useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/shared/ui/Button'

export const IMAGEN_POR_DEFECTO = 'https://placehold.co/600x400?text=Food+Store'

const COLOR_CATEGORIA: Record<string, string> = {
  pizzas: 'from-red-500 to-orange-500',
  hamburguesas: 'from-amber-500 to-orange-600',
  bebidas: 'from-sky-500 to-cyan-500',
}

export function ProductoCard({ producto, index = 0 }: { producto: Producto; index?: number }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0)
  const mostrar = useToastStore((s) => s.mostrar)
  const [agregado, setAgregado] = useState(false)
  const vendible = producto.activo && producto.disponible && producto.stock > 0
  const ultimas = vendible && producto.stock <= 5
  const color = COLOR_CATEGORIA[producto.categoria.nombre.toLowerCase()] ?? 'from-fuchsia-500 to-rose-500'

  useEffect(() => {
    if (!agregado) return
    const timer = window.setTimeout(() => setAgregado(false), 1200)
    return () => window.clearTimeout(timer)
  }, [agregado])

  const onAgregar = () => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base, stock: producto.stock, imagen_url: producto.imagen_url })
    setAgregado(true)
    mostrar(enCarrito >= producto.stock ? `No hay más stock de ${producto.nombre}` : `${producto.nombre} agregado al carrito`, enCarrito >= producto.stock ? 'error' : 'exito')
  }

  return (
    <article style={{ animationDelay: `${index * 70}ms` }} className="group fs-panel flex h-full animate-fade-up flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-200/60">
      <div className="relative h-52 overflow-hidden">
        <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={producto.imagen_url || IMAGEN_POR_DEFECTO} alt={producto.nombre} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-md ${color}`}>{producto.categoria.nombre}</span>
        {ultimas && <span className="absolute top-3 right-3 animate-pulse rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow">🔥 ¡Últimas {producto.stock}!</span>}
        {enCarrito > 0 && <span key={enCarrito} className="absolute right-3 bottom-3 grid h-8 min-w-8 animate-pop place-items-center rounded-full bg-white px-2 text-xs font-black text-ink shadow-lg">🛒 {enCarrito}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-black tracking-tight transition-colors group-hover:text-brand-600">{producto.nombre}</h2>
        <p className="mt-1.5 flex-1 text-sm text-slate-600">{producto.descripcion}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-ink">${producto.precio_base.toLocaleString('es-AR')}</p>
            <p className={`text-xs font-semibold ${ultimas ? 'text-rose-600' : 'text-emerald-600'}`}>● Stock: {producto.stock}</p>
          </div>
          <Button variant={agregado ? 'success' : 'primary'} disabled={!vendible} onClick={onAgregar} aria-label={`Agregar ${producto.nombre}`}>
            {vendible ? (agregado ? '✓ Listo' : <><span aria-hidden>🛒</span>Agregar</>) : 'No disponible'}
          </Button>
        </div>
      </div>
    </article>
  )
}
