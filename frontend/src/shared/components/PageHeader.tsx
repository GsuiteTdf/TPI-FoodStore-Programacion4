import type { ReactNode } from 'react'

export function PageHeader({ icon, title, subtitle, actions }: { icon: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex animate-fade-up flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 via-rose-500 to-fuchsia-600 text-2xl shadow-lg shadow-rose-500/30">{icon}</div>
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
