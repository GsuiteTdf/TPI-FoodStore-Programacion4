import { useEffect, type ReactNode } from 'react'

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-2xl animate-modal overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-brand-500 via-rose-500 to-fuchsia-600 px-6 py-4 text-white">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/20 text-2xl leading-none transition hover:rotate-90 hover:bg-white/30" aria-label="Cerrar">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
