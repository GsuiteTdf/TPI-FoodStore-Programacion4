import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Array<'user' | 'admin'> }) {
  const user = useAuthStore((s) => s.user)
  const checking = useAuthStore((s) => s.checking)
  const location = useLocation()
  if (checking) return <div className="p-10 text-center font-semibold">Verificando sesión…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
