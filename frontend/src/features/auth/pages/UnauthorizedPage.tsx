import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="fs-panel mx-auto max-w-xl p-10 text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 animate-float place-items-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-4xl">🚫</div>
      <h1 className="text-3xl font-black">Sin permiso</h1>
      <p className="mt-3 text-slate-600">Tu sesión es válida, pero tu rol no permite acceder a esta pantalla.</p>
      <Button className="mt-6" onClick={() => navigate('/')}>Volver al inicio</Button>
    </div>
  )
}
