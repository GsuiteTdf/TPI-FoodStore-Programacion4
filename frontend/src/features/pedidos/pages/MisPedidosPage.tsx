import { useNavigate } from 'react-router-dom'
import { formatFecha } from '@/shared/utils/formatFecha'
import { useCancelarPedido, usePedidos } from '@/features/pedidos/hooks/usePedidos'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { PageHeader } from '@/shared/components/PageHeader'
import { Skeleton } from '@/shared/components/Skeleton'
import { handleApiError } from '@/shared/api/handleApiError'
import { useToastStore } from '@/store/toastStore'

const PASOS = [
  { estado: 'PENDIENTE', label: 'Recibido', icono: '📝' },
  { estado: 'EN_PREPARACION', label: 'En preparación', icono: '👨‍🍳' },
  { estado: 'ENTREGADO', label: 'Entregado', icono: '🎉' },
]

function Progreso({ estado }: { estado: string }) {
  if (estado === 'CANCELADO') return <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">Este pedido fue cancelado y el stock se restituyó.</p>
  const actual = PASOS.findIndex((paso) => paso.estado === estado)
  return (
    <div className="mt-5 flex items-center">
      {PASOS.map((paso, index) => (
        <div key={paso.estado} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={`grid h-10 w-10 place-items-center rounded-full text-lg transition-all ${index <= actual ? 'bg-gradient-to-br from-brand-500 to-rose-500 shadow-md shadow-brand-500/30' : 'bg-orange-50 grayscale'} ${index === actual ? 'ring-4 ring-brand-200' : ''}`}>{paso.icono}</span>
            <span className={`text-[11px] font-bold ${index <= actual ? 'text-ink' : 'text-slate-400'}`}>{paso.label}</span>
          </div>
          {index < PASOS.length - 1 && <div className="mx-2 mb-5 h-1 flex-1 overflow-hidden rounded-full bg-orange-100"><div className={`h-full rounded-full bg-gradient-to-r from-brand-500 to-rose-500 transition-all duration-700 ${index < actual ? 'w-full' : 'w-0'}`} /></div>}
        </div>
      ))}
    </div>
  )
}

export function MisPedidosPage() {
  const pedidos = usePedidos()
  const cancelar = useCancelarPedido()
  const mostrar = useToastStore((s) => s.mostrar)
  const navigate = useNavigate()
  const header = <PageHeader icon="📦" title="Mis pedidos" subtitle="Seguí el estado de cada compra." />
  if (pedidos.isLoading) return <div>{header}<Skeleton rows={3} /></div>
  if (pedidos.error) return <EstadoError message={handleApiError(pedidos.error)} />
  if (!pedidos.data?.items.length) return <div>{header}<EstadoVacio icon="📦" message="Todavía no realizaste pedidos." action={<Button onClick={() => navigate('/')}>Hacer mi primer pedido</Button>} /></div>

  const onCancelar = (id: number) => {
    if (!confirm('¿Cancelar pedido y restituir stock?')) return
    cancelar.mutateAsync(id).then(() => mostrar(`Pedido #${id} cancelado`, 'info')).catch((err: unknown) => mostrar(handleApiError(err), 'error'))
  }

  return (
    <div>
      {header}
      <div className="grid gap-6 lg:grid-cols-2">
        {pedidos.data.items.map((pedido, index) => (
          <article key={pedido.id} style={{ animationDelay: `${index * 70}ms` }} className="fs-panel animate-fade-up overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
            <div className={`h-1.5 bg-gradient-to-r ${pedido.estado === 'CANCELADO' ? 'from-rose-400 to-red-500' : pedido.estado === 'ENTREGADO' ? 'from-emerald-400 to-teal-500' : 'from-brand-400 via-rose-500 to-fuchsia-600'}`} />
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Pedido #{pedido.id}</h2>
                  <p className="text-sm text-slate-500">🕒 {formatFecha(pedido.created_at)} · {pedido.forma_pago === 'EFECTIVO' ? '💵 Efectivo' : '🏦 Transferencia'}</p>
                </div>
                <BadgeEstado estado={pedido.estado} />
              </div>
              <Progreso estado={pedido.estado} />
              <ul className="mt-5 divide-y divide-orange-100 rounded-2xl bg-brand-50/50 px-4">
                {pedido.items.map((item) => <li key={item.producto_id} className="flex justify-between py-2.5 text-sm"><span><span className="font-bold">{item.cantidad} ×</span> {item.nombre_producto}</span><span className="font-semibold">${item.subtotal.toLocaleString('es-AR')}</span></li>)}
              </ul>
              <p className="mt-3 text-xs text-slate-500">📍 {pedido.direccion_entrega}{pedido.notas ? ` · 📝 ${pedido.notas}` : ''}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-black">Total <span className="text-gradient">${pedido.total.toLocaleString('es-AR')}</span></span>
                {pedido.estado === 'PENDIENTE' && <Button variant="danger" size="sm" disabled={cancelar.isPending} onClick={() => onCancelar(pedido.id)}>Cancelar</Button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
