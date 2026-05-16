import { useCallback } from 'react'
import { Badge, Button, Card, StatCard } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { leadsApi } from '@/services/api'
import type { Lead, LeadResponse } from '@/types'
import { formatDate } from '@/utils/helpers'

const statusColors: Record<Lead['status'], 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  New: 'blue',
  Contacted: 'yellow',
  Qualified: 'green',
  Lost: 'red',
}

const DashboardPage = () => {
  const fetchDashboardLeads = useCallback(
    () => leadsApi.getLeads({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  )
  const { data, loading, error, refetch } = useApi<LeadResponse>(fetchDashboardLeads)

  const leads = data?.data ?? []
  const stats = [
    { title: 'Total Leads', value: String(data?.pagination.total ?? 0) },
    { title: 'New', value: String(countByStatus(leads, 'New')) },
    { title: 'Contacted', value: String(countByStatus(leads, 'Contacted')) },
    { title: 'Qualified', value: String(countByStatus(leads, 'Qualified')) },
  ]

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-200 text-red-700">
        <p>Error loading dashboard: {error}</p>
        <Button onClick={refetch} className="mt-2">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your leads dashboard</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-primary-500 border-t-transparent h-8 w-8"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.title} title={stat.title} value={stat.value} />
            ))}
          </div>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Recent Leads</h2>
            {leads.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No leads found</div>
            ) : (
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">
                        {lead.email} - {formatDate(lead.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusColors[lead.status]}>{lead.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

const countByStatus = (leads: Lead[], status: Lead['status']): number => {
  return leads.filter((lead) => lead.status === status).length
}

export default DashboardPage
