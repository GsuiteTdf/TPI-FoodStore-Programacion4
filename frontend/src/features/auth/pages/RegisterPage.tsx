import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '@/features/auth/api/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'
import { AuthShell } from '@/features/auth/components/AuthShell'

export function RegisterPage() {
  const navigate = useNavigate()
  const mostrar = useToastStore((s) => s.mostrar)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registerUser(value)
        mostrar('¡Cuenta creada! Ya podés iniciar sesión')
        navigate('/login', { replace: true })
      } catch (err) { setError(handleApiError(err)) }
    },
  })
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registrate en segundos y empezá a pedir."
      imagen="/img/productos/pizza-especial.jpg"
      frase="Sumate y pedí lo que más te guste."
      pie={<>¿Ya tenés cuenta? <Link to="/login" className="font-bold text-brand-600 hover:underline">Iniciá sesión</Link></>}
    >
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
        {error && <div className="sm:col-span-2"><EstadoError message={error} /></div>}
        <form.Field name="username" validators={{ onChange: ({ value }) => value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres' }}>
          {(field) => <Input label="Usuario" icon="👤" autoComplete="username" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => value.trim().length >= 2 ? undefined : 'Nombre obligatorio' }}>
          {(field) => <Input label="Nombre completo" icon="🙂" autoComplete="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <div className="sm:col-span-2">
          <form.Field name="email" validators={{ onChange: ({ value }) => value.includes('@') ? undefined : 'Email inválido' }}>
            {(field) => <Input type="email" label="Email" icon="✉️" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />}
          </form.Field>
        </div>
        <div className="sm:col-span-2">
          <form.Field name="password" validators={{ onChange: ({ value }) => value.length >= 8 ? undefined : 'Mínimo 8 caracteres' }}>
            {(field) => {
              const largo = field.state.value.length
              const nivel = largo === 0 ? 0 : largo < 8 ? 1 : /\d/.test(field.state.value) && /[A-Z]/.test(field.state.value) ? 3 : 2
              return (
                <div>
                  <Input type="password" label="Contraseña" icon="🔑" autoComplete="new-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors[0]} />
                  <div className="mt-2 flex gap-1.5" aria-hidden>
                    {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${nivel >= n ? (nivel === 1 ? 'bg-rose-400' : nivel === 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-orange-100'}`} />)}
                  </div>
                </div>
              )
            }}
          </form.Field>
        </div>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(enviando) => <Button size="lg" className="w-full sm:col-span-2" type="submit" disabled={enviando}>{enviando ? 'Creando cuenta…' : 'Registrarme'}</Button>}
        </form.Subscribe>
      </form>
    </AuthShell>
  )
}
