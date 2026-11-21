import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle: string
  imagen: string
  frase: string
  pie: ReactNode
  children: ReactNode
}

/** Tarjeta dividida: panel con imagen y degradado a la izquierda, formulario a la derecha. */
export function AuthShell({ title, subtitle, imagen, frase, pie, children }: Props) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-orange-200/60 md:grid-cols-2">
      <div className="relative hidden min-h-[560px] md:block">
        <img src={imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/90 via-rose-600/80 to-fuchsia-800/90" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center gap-2 text-lg font-black"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-xl backdrop-blur">🍔</span>Food Store</Link>
          <div>
            <p className="text-4xl leading-tight font-black">{frase}</p>
            <div className="mt-6 flex gap-3 text-3xl" aria-hidden>
              <span className="animate-float">🍕</span>
              <span className="animate-float [animation-delay:0.7s]">🍟</span>
              <span className="animate-float [animation-delay:1.4s]">🥤</span>
            </div>
          </div>
          <p className="text-sm text-white/80">🔒 Tu sesión viaja en una cookie HttpOnly: el token nunca queda expuesto a JavaScript.</p>
        </div>
      </div>
      <div className="p-8 sm:p-12">
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-slate-600">{pie}</div>
      </div>
    </div>
  )
}
