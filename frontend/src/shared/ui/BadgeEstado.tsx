const ESTILOS: Record<string, { clase: string; punto: string; icono: string }> = {
  PENDIENTE: { clase: 'bg-amber-100 text-amber-800 ring-amber-200', punto: 'bg-amber-500 animate-pulse', icono: '⏳' },
  EN_PREPARACION: { clase: 'bg-sky-100 text-sky-800 ring-sky-200', punto: 'bg-sky-500 animate-pulse', icono: '👨‍🍳' },
  ENTREGADO: { clase: 'bg-emerald-100 text-emerald-800 ring-emerald-200', punto: 'bg-emerald-500', icono: '✅' },
  CANCELADO: { clase: 'bg-rose-100 text-rose-800 ring-rose-200', punto: 'bg-rose-500', icono: '✖' },
}

export function BadgeEstado({ estado }: { estado: string }) {
  const estilo = ESTILOS[estado] ?? { clase: 'bg-slate-100 text-slate-700 ring-slate-200', punto: 'bg-slate-400', icono: '•' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${estilo.clase}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${estilo.punto}`} />
      <span aria-hidden>{estilo.icono}</span>
      {estado.replace('_', ' ')}
    </span>
  )
}
