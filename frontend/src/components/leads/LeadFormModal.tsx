import { FormEvent, useEffect, useState } from 'react'
import { Button, Input } from '@/components/ui'
import type { Lead, LeadFormValues } from '@/types'

interface LeadFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  lead?: Lead | null
  submitting: boolean
  error?: string
  onClose: () => void
  onSubmit: (values: LeadFormValues) => Promise<void>
}

const defaultValues: LeadFormValues = {
  name: '',
  email: '',
  status: 'New',
  source: 'Website',
}

function LeadFormModal({
  open,
  mode,
  lead,
  submitting,
  error,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const [values, setValues] = useState<LeadFormValues>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setValues(
      lead
        ? {
            name: lead.name,
            email: lead.email,
            status: lead.status,
            source: lead.source,
          }
        : defaultValues
    )
  }, [lead, open])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateLead(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    await onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Add Lead' : 'Edit Lead'}
          </h2>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Name"
            value={values.name}
            error={errors.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={values.email}
            error={errors.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lead-status">
                Status
              </label>
              <select
                id="lead-status"
                value={values.status}
                onChange={(event) =>
                  setValues((current) => ({ ...current, status: event.target.value as Lead['status'] }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lead-source">
                Source
              </label>
              <select
                id="lead-source"
                value={values.source}
                onChange={(event) =>
                  setValues((current) => ({ ...current, source: event.target.value as Lead['source'] }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const validateLead = (values: LeadFormValues): Partial<Record<keyof LeadFormValues, string>> => {
  const errors: Partial<Record<keyof LeadFormValues, string>> = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email'
  }

  return errors
}

export default LeadFormModal
