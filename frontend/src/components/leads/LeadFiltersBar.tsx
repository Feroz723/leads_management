import { ChangeEvent } from 'react'
import { Button, Card } from '@/components/ui'
import type { Lead } from '@/types'

interface LeadFiltersBarProps {
  search: string
  filterStatus: 'all' | Lead['status']
  filterSource: 'all' | Lead['source']
  sortBy: 'latest' | 'oldest'
  exporting: boolean
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  onStatusChange: (value: 'all' | Lead['status']) => void
  onSourceChange: (value: 'all' | Lead['source']) => void
  onSortChange: (value: 'latest' | 'oldest') => void
  onExport: () => void
}

const leadSources: Lead['source'][] = ['Website', 'Instagram', 'Referral']

function LeadFiltersBar({
  search,
  filterStatus,
  filterSource,
  sortBy,
  exporting,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onSortChange,
  onExport,
}: LeadFiltersBarProps) {
  return (
    <Card className="p-0">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={onSearchChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
        />
        <select
          value={filterStatus}
          onChange={(event) => onStatusChange(event.target.value as 'all' | Lead['status'])}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[120px]"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
        <select
          value={filterSource}
          onChange={(event) => onSourceChange(event.target.value as 'all' | Lead['source'])}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[120px]"
        >
          <option value="all">All Sources</option>
          {leadSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as 'latest' | 'oldest')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <Button variant="secondary" onClick={onExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </Card>
  )
}

export default LeadFiltersBar
