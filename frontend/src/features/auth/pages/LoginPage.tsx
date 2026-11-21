import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'
import { AuthShell } from '@/features/auth/components/AuthShell'

export function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const mostrar = useToastStore((s) => s.mostrar)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [verPassword, setVerPassword] = useState(false)
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const logged = await login(value.username, value.password)
        mostrar(`¡Bienvenido/a, ${logged.full_name.split(' ')[0]}!`)
        const from = (location.state as { from?: string } | null)?.from
        navigate(from ?? (logged.role === 'admin' ? '/admin/resumen' : '/'), { replace: true })
      } catch (err) { setError(handleApiError(err)) }
    },
  })
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/resumen' : '/'} replace />
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresá para hacer tu pedido y seguirlo en tiempo real."
      imagen="/img/productos/hamburguesa-doble.jpg"
      frase="Tu comida favorita, a un clic de distancia."
      pie={<>¿No tenés cuenta? <Link to="/register" className="font-bold text-brand-600 hover:underline">Registrate gratis</Link></>}
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
        {error && <EstadoError message={error} />}
        <form.Field name="username" validators={{ onChange: ({ value }) => value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres' }}>
          {(field) => <Input label="Usuario" icon="👤" autoComplete="username" placeholder="tu_usuario" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => value.length >= 8 ? undefined : 'Mínimo 8 caracteres' }}>
          {(field) => (
            <div className="relative">
              <Input type={verPassword ? 'text' : 'password'} label="Contraseña" icon="🔑" autoComplete="current-password" placeholder="••••••••" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />
              <button type="button" onClick={() => setVerPassword((v) => !v)} className="absolute top-[34px] right-3 cursor-pointer rounded-lg px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50">{verPassword ? 'Ocultar' : 'Ver'}</button>
            </div>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(enviando) => <Button size="lg" className="w-full" type="submit" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</Button>}
        </form.Subscribe>
      </form>
    </AuthShell>
  )
}
