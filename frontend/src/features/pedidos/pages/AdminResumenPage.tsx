import { useResumenPedidos } from '@/features/pedidos/hooks/usePedidos'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { handleApiError } from '@/shared/api/handleApiError'

export function AdminResumenPage() {
  const query = useResumenPedidos()
  const header = <PageHeader icon="📊" title="Resumen del negocio" subtitle="Indicadores calculados por la API." />
  if (query.isLoading) {
    return <div>{header}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer h-36 rounded-3xl" />)}</div></div>
  }
  if (query.error) return <EstadoError message={handleApiError(query.error)} />
  if (!query.data) return null
  const d = query.data
  const totalPedidos = d.pendientes + d.en_preparacion + d.entregados + d.cancelados
  const items = [
    { label: 'Pendientes', valor: d.pendientes, icono: '⏳', color: 'from-amber-400 to-orange-500' },
    { label: 'En preparación', valor: d.en_preparacion, icono: '👨‍🍳', color: 'from-sky-400 to-indigo-500' },
    { label: 'Entregados', valor: d.entregados, icono: '✅', color: 'from-emerald-400 to-teal-600' },
    { label: 'Cancelados', valor: d.cancelados, icono: '✖️', color: 'from-rose-400 to-red-600' },
    { label: 'Pedidos de hoy', valor: d.pedidos_hoy, icono: '📅', color: 'from-fuchsia-500 to-purple-600' },
    { label: 'Ingresos entregados', valor: `$${d.ingresos_entregados.toLocaleString('es-AR')}`, icono: '💰', color: 'from-brand-500 via-rose-500 to-fuchsia-600' },
  ]
  const barras = items.slice(0, 4)
  return (
    <div>
      {header}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.label} style={{ animationDelay: `${index * 70}ms` }} className={`group relative animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl ${item.color}`}>
            <span className="absolute -top-4 -right-2 text-8xl opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" aria-hidden>{item.icono}</span>
            <p className="text-sm font-bold tracking-wider text-white/85 uppercase">{item.label}</p>
            <p className="mt-3 text-4xl font-black drop-shadow-sm">{item.valor}</p>
          </div>
        ))}
      </div>
      <div className="fs-panel mt-8 p-6">
        <h2 className="text-lg font-black">Distribución de pedidos por estado</h2>
        <p className="text-sm text-slate-500">{totalPedidos} pedidos en total</p>
        <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-orange-50">
          {barras.map((b) => totalPedidos > 0 && <div key={b.label} title={`${b.label}: ${b.valor}`} className={`h-full bg-gradient-to-r transition-all duration-700 ${b.color}`} style={{ width: `${(Number(b.valor) / totalPedidos) * 100}%` }} />)}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {barras.map((b) => <span key={b.label} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full bg-gradient-to-r ${b.color}`} />{b.label}: <b>{b.valor}</b></span>)}
        </div>
      </div>
    </div>
  )
}
