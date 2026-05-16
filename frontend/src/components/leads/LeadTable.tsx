import { Badge, Button, Card } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import type { Lead, UserRole } from '@/types'

interface LeadTableProps {
  leads: Lead[]
  userRole?: UserRole
  onView: (id: string) => void
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}

const statusColors: Record<Lead['status'], 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  New: 'blue',
  Contacted: 'yellow',
  Qualified: 'green',
  Lost: 'red',
}

function LeadTable({ leads, userRole, onView, onEdit, onDelete }: LeadTableProps) {
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4 font-semibold text-gray-700">Name</th>
              <th className="text-left p-4 font-semibold text-gray-700">Email</th>
              <th className="text-left p-4 font-semibold text-gray-700">Status</th>
              <th className="text-left p-4 font-semibold text-gray-700">Source</th>
              <th className="text-left p-4 font-semibold text-gray-700">Created At</th>
              <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4 text-gray-600">{lead.email}</td>
                  <td className="p-4">
                    <Badge variant={statusColors[lead.status]}>{lead.status}</Badge>
                  </td>
                  <td className="p-4 text-gray-600">{lead.source}</td>
                  <td className="p-4 text-gray-600">{formatDate(lead.createdAt)}</td>
                  <td className="p-4">
                    <Button variant="secondary" size="sm" className="mr-2" onClick={() => onView(lead.id)}>
                      View
                    </Button>
                    <Button variant="secondary" size="sm" className="mr-2" onClick={() => onEdit(lead)}>
                      Edit
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="danger" size="sm" onClick={() => onDelete(lead.id)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default LeadTable
