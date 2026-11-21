import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: Props) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-1.5 block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-500">{icon}</span>}
        <input
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-ink outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 ${icon ? 'pl-10' : ''} ${error ? 'border-rose-400' : 'border-orange-200/80'} ${className}`}
          {...props}
        />
      </span>
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">⚠ {error}</span>}
    </label>
  )
}
