import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/shared/layout/Navbar'
import { Toaster } from '@/shared/components/Toaster'

export function MainLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* key: cada cambio de ruta re-dispara la animación de entrada */}
      <main key={pathname} className="mx-auto w-full max-w-7xl flex-1 animate-fade-up px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-12 bg-ink text-white/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-rose-500 text-xl">🍔</span>
            <div>
              <p className="font-black text-white">Food Store</p>
              <p className="text-xs">Comida rica, pedidos simples.</p>
            </div>
          </div>
          <p className="text-xs">TPI Programación IV · FastAPI + React · Gastón Cejas</p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
