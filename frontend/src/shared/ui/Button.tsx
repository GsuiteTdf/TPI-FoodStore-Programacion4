import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANTS = {
  primary: 'bg-gradient-to-r from-brand-500 to-rose-500 text-white shadow-md shadow-brand-500/30 hover:shadow-lg hover:shadow-brand-500/40 hover:brightness-105',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-orange-200 hover:bg-brand-50 hover:ring-brand-300',
  danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:brightness-105',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:brightness-105',
  ghost: 'bg-transparent text-slate-700 hover:bg-brand-50 hover:text-brand-700',
  dark: 'bg-ink text-white shadow-md hover:bg-black',
}

const SIZES = {
  sm: 'gap-1.5 rounded-lg px-3 py-1.5 text-sm',
  md: 'gap-2 rounded-xl px-4 py-2.5',
  lg: 'gap-2 rounded-2xl px-6 py-3.5 text-lg',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
