import { useToastStore, type ToastTipo } from '@/store/toastStore'

const ESTILO: Record<ToastTipo, { icono: string; barra: string }> = {
  exito: { icono: '✓', barra: 'from-emerald-400 to-teal-500' },
  error: { icono: '!', barra: 'from-rose-500 to-red-600' },
  info: { icono: 'i', barra: 'from-brand-400 to-rose-500' },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const cerrar = useToastStore((s) => s.cerrar)
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto flex animate-slide-in items-center gap-3 overflow-hidden rounded-2xl bg-ink py-3 pr-3 text-white shadow-2xl">
          <span className={`h-full w-1.5 self-stretch bg-gradient-to-b ${ESTILO[toast.tipo].barra}`} />
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-black ${ESTILO[toast.tipo].barra}`}>{ESTILO[toast.tipo].icono}</span>
          <p className="flex-1 text-sm font-medium">{toast.mensaje}</p>
          <button type="button" onClick={() => cerrar(toast.id)} className="cursor-pointer rounded-full px-2 text-lg text-white/60 hover:text-white" aria-label="Cerrar aviso">×</button>
        </div>
      ))}
    </div>
  )
}
