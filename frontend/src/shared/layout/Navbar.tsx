import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-brand-500 to-rose-500 text-white shadow-md shadow-brand-500/25' : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'}`

const adminClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isActive ? 'bg-white text-ink shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'}`

const ADMIN_LINKS = [
  { to: '/admin/resumen', label: 'Resumen', icon: '📊' },
  { to: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/admin/productos', label: 'Productos', icon: '🍕' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '🧾' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
]

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.cantidad, 0))
  const mostrar = useToastStore((s) => s.mostrar)
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const iniciales = user?.full_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const cerrarSesion = () => {
    void logout().then(() => { mostrar('Sesión cerrada. ¡Hasta pronto!', 'info'); navigate('/login') })
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-orange-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="group mr-auto flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 via-rose-500 to-fuchsia-600 text-xl shadow-lg shadow-rose-500/30 transition-transform group-hover:rotate-12 group-hover:scale-110">🍔</span>
            <span className="text-xl font-black tracking-tight"><span className="text-gradient">Food</span> Store</span>
          </Link>
          <button type="button" className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-xl ring-1 ring-orange-200 md:hidden" onClick={() => setAbierto((v) => !v)} aria-label="Menú">{abierto ? '✕' : '☰'}</button>
          <nav className={`${abierto ? 'flex' : 'hidden'} absolute top-full right-0 left-0 flex-col gap-1 border-b border-orange-100 bg-white p-3 shadow-lg md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`} onClick={() => setAbierto(false)}>
            <NavLink to="/" end className={navClass}><span aria-hidden>🍽️</span>Catálogo</NavLink>
            <NavLink to="/carrito" className={navClass}>
              <span aria-hidden>🛒</span>Carrito
              <span key={cartCount} className={`grid h-5 min-w-5 animate-pop place-items-center rounded-full px-1 text-[11px] font-black ${cartCount > 0 ? 'bg-ink text-white' : 'bg-slate-200 text-slate-600'}`}>{cartCount}</span>
            </NavLink>
            {user && <NavLink to="/mis-pedidos" className={navClass}><span aria-hidden>📦</span>Mis pedidos</NavLink>}
            {user ? (
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-3 md:border-l md:border-orange-100 md:pl-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-brand-500 text-xs font-black text-white ring-2 ring-white" title={user.full_name}>{iniciales}</span>
                <span className="hidden flex-col leading-tight lg:flex">
                  <span className="text-sm font-bold">{user.full_name}</span>
                  <span className="text-[11px] font-semibold tracking-wide text-brand-600 uppercase">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
                </span>
                <button className="ml-1 cursor-pointer rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black" onClick={cerrarSesion}>Cerrar sesión</button>
              </div>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>Ingresar</NavLink>
                <NavLink to="/register" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black">Registrarse</NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
      {user?.role === 'admin' && (
        <div className="bg-gradient-to-r from-ink via-[#3b1f45] to-ink">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2">
            <span className="mr-2 rounded-md bg-brand-500 px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">Admin</span>
            {ADMIN_LINKS.map((link) => <NavLink key={link.to} to={link.to} className={adminClass}><span aria-hidden>{link.icon}</span>{link.label}</NavLink>)}
          </div>
        </div>
      )}
    </header>
  )
}
