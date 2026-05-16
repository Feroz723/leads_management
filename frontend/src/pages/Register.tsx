import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { authApi, getApiErrorMessage } from '@/services/api'
import { useAuthStore } from '@/context/store'
import type { RegisterPayload } from '@/types'

function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState<Omit<RegisterPayload, 'role'>>({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateRegisterForm(form)
    setErrors(validationErrors)
    setSubmitError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const { user, token } = await authApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'sales_user',
      })
      setAuth(user, token)
      navigate('/dashboard', { replace: true })
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
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing leads with your team</p>
        </div>

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
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
            {submitting ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-5">
          Already registered?{' '}
          <Link className="font-medium text-primary-600 hover:text-primary-700" to="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  )
}

const validateRegisterForm = (
  form: Omit<RegisterPayload, 'role'>
): Partial<Record<'name' | 'email' | 'password', string>> => {
  const errors: Partial<Record<'name' | 'email' | 'password', string>> = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email'
  }

  if (form.password.length < 6) {
    errors.password = 'Use at least 6 characters'
  }

  return errors
}

export default RegisterPage
