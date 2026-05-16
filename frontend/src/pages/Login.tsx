import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { authApi, getApiErrorMessage } from '@/services/api'
import { useAuthStore } from '@/context/store'

interface LoginForm {
  email: string
  password: string
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateLoginForm(form)
    setErrors(validationErrors)
    setSubmitError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const { user, token } = await authApi.login(form)
      setAuth(user, token)
      const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">Access your leads workspace</p>
        </div>

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-5">
          New here?{' '}
          <Link className="font-medium text-primary-600 hover:text-primary-700" to="/register">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  )
}

const validateLoginForm = (form: LoginForm): Partial<LoginForm> => {
  const errors: Partial<LoginForm> = {}

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  }

  return errors
}

export default LoginPage
