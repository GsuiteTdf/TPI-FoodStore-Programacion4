import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listCategorias } from '@/features/categorias/api/categorias'
import { useProductos } from '@/features/productos/hooks/useProductos'
import { ProductoCard } from '@/features/productos/components/ProductoCard'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { Skeleton } from '@/shared/components/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'

const LIMIT = 6

const ICONO_CATEGORIA: Record<string, string> = { pizzas: '🍕', hamburguesas: '🍔', bebidas: '🥤', postres: '🍰' }
const icono = (nombre: string) => ICONO_CATEGORIA[nombre.toLowerCase()] ?? '🍽️'

const chipClass = (activo: boolean) =>
  `flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200 ${activo ? 'scale-105 bg-gradient-to-r from-brand-500 to-rose-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white text-slate-700 ring-1 ring-orange-200 hover:-translate-y-0.5 hover:ring-brand-400'}`

export function CatalogoPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.cantidad, 0))
  const categories = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const products = useProductos({ skip: page * LIMIT, limit: LIMIT, search: search || undefined, categoria_id: categoriaId, disponible: true })

  const elegirCategoria = (id: number | undefined) => { setCategoriaId(id); setPage(0) }

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-rose-500 to-fuchsia-700 px-6 py-10 text-white shadow-2xl shadow-rose-500/30 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute top-6 right-6 hidden gap-4 text-5xl sm:flex md:right-14 md:text-6xl" aria-hidden>
          <span className="animate-float">🍕</span>
          <span className="animate-float [animation-delay:0.8s]">🍔</span>
          <span className="animate-float [animation-delay:1.6s]">🥤</span>
        </div>
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur">🔥 Recién salido del horno</span>
          <h1 className="mt-4 text-4xl leading-tight font-black tracking-tight sm:text-5xl">
            {user ? `¡Hola, ${user.full_name.split(' ')[0]}!` : 'Catálogo'} <br className="hidden sm:block" />
            <span className="text-yellow-200">¿Qué se te antoja hoy?</span>
          </h1>
          <p className="mt-3 text-lg text-white/90">Elegí tus productos y armá el pedido. Pizzas, hamburguesas y bebidas listas para disfrutar.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="dark" size="lg" onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}>Ver productos ↓</Button>
            {cartCount > 0 && <Button variant="secondary" size="lg" onClick={() => navigate('/carrito')}>🛒 Ir al carrito ({cartCount})</Button>}
          </div>
        </div>
        <div className="relative mt-8 grid max-w-xl grid-cols-3 gap-3">
          {[['⚡', 'Rápido', 'Pedido en minutos'], ['💳', 'Pagá fácil', 'Efectivo o transferencia'], ['📦', 'Seguimiento', 'Estado en tiempo real']].map(([emoji, titulo, texto]) => (
            <div key={titulo} className="rounded-2xl bg-white/15 p-3 backdrop-blur transition hover:bg-white/25">
              <p className="text-2xl">{emoji}</p>
              <p className="mt-1 text-sm font-black">{titulo}</p>
              <p className="text-xs text-white/80">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filtros */}
      <div id="productos" className="mb-8 scroll-mt-24 space-y-4">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl" aria-hidden>🔎</span>
          <input
            className="w-full rounded-2xl border border-orange-200 bg-white py-4 pr-12 pl-12 text-lg shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          />
          {search && <button type="button" onClick={() => { setSearch(''); setPage(0) }} className="absolute top-1/2 right-4 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-brand-100 hover:text-brand-700" aria-label="Limpiar búsqueda">×</button>}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorías">
          <button type="button" role="tab" aria-selected={categoriaId === undefined} className={chipClass(categoriaId === undefined)} onClick={() => elegirCategoria(undefined)}>✨ Todas las categorías</button>
          {categories.data?.map((category) => (
            <button key={category.id} type="button" role="tab" aria-selected={categoriaId === category.id} className={chipClass(categoriaId === category.id)} onClick={() => elegirCategoria(category.id)}>
              <span aria-hidden>{icono(category.nombre)}</span>{category.nombre}
            </button>
          ))}
        </div>
      </div>

      {products.isLoading ? <Skeleton /> : products.error ? <EstadoError message={handleApiError(products.error)} /> : products.data && products.data.items.length > 0 ? (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-500">{products.data.total} {products.data.total === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.items.map((product, index) => <ProductoCard key={product.id} producto={product} index={index} />)}
          </div>
          <Paginacion page={page} total={products.data.total} limit={LIMIT} onPage={setPage} />
        </>
      ) : (
        <EstadoVacio icon="🔍" message="No encontramos productos para esos filtros." action={<Button variant="secondary" onClick={() => { setSearch(''); elegirCategoria(undefined) }}>Limpiar filtros</Button>} />
      )}
    </div>
  )
}
