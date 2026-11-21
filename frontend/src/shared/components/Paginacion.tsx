import { Button } from '@/shared/ui/Button'

export function Paginacion({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
      <Button variant="secondary" disabled={page <= 0} onClick={() => onPage(page - 1)}>Anterior</Button>
      {Array.from({ length: pages }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-current={index === page ? 'page' : undefined}
          onClick={() => onPage(index)}
          className={`h-10 w-10 cursor-pointer rounded-xl text-sm font-bold transition-all ${index === page ? 'scale-110 bg-gradient-to-br from-brand-500 to-rose-500 text-white shadow-md shadow-brand-500/30' : 'bg-white text-slate-600 ring-1 ring-orange-200 hover:bg-brand-50'}`}
        >
          {index + 1}
        </button>
      ))}
      <Button variant="secondary" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Siguiente</Button>
      <span className="w-full text-center text-xs text-slate-500">Página {page + 1} de {pages} · {total} productos</span>
    </nav>
  )
}
