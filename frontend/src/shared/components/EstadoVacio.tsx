import type { ReactNode } from 'react'

export function EstadoVacio({ message = 'No hay datos para mostrar.', icon = '🍽️', action }: { message?: string; icon?: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-up rounded-3xl border-2 border-dashed border-orange-200 bg-white/70 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid h-20 w-20 animate-float place-items-center rounded-full bg-gradient-to-br from-brand-100 to-rose-100 text-4xl">{icon}</div>
      <p className="text-lg font-semibold text-slate-600">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
