import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import type { Lead } from '@/types'

interface LeadDetailsModalProps {
  lead: Lead | null
  loading: boolean
  onClose: () => void
  onEdit: (lead: Lead) => void
}

const statusColors: Record<Lead['status'], 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  New: 'blue',
  Contacted: 'yellow',
  Qualified: 'green',
  Lost: 'red',
}

function LeadDetailsModal({ lead, loading, onClose, onEdit }: LeadDetailsModalProps) {
  if (!lead && !loading) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            lead && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{lead.email}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={statusColors[lead.status]}>{lead.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="font-medium text-gray-900">{lead.source}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium text-gray-900">{formatDate(lead.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(lead.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => onEdit(lead)}>Edit Lead</Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadDetailsModal
