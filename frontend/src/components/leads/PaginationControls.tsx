import { ChangeEvent } from 'react'
import { Button } from '@/components/ui'
import type { PaginationInfo } from '@/types'

interface PaginationControlsProps {
  pagination: PaginationInfo
  recordsPerPage: number
  onPageChange: (page: number) => void
  onRecordsPerPageChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

function PaginationControls({
  pagination,
  recordsPerPage,
  onPageChange,
  onRecordsPerPageChange,
}: PaginationControlsProps) {
  if (pagination.pages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        <select
          value={recordsPerPage}
          onChange={onRecordsPerPageChange}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-[80px]"
        >
          {[5, 10, 25, 50, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
          disabled={pagination.page === pagination.pages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default PaginationControls
