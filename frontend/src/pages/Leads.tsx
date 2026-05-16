import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui'
import LeadDetailsModal from '@/components/leads/LeadDetailsModal'
import LeadFiltersBar from '@/components/leads/LeadFiltersBar'
import LeadFormModal from '@/components/leads/LeadFormModal'
import LeadTable from '@/components/leads/LeadTable'
import PaginationControls from '@/components/leads/PaginationControls'
import { useAuthStore } from '@/context/store'
import { leadsApi, getApiErrorMessage } from '@/services/api'
import type { LeadsQueryParams, LeadExportParams } from '@/services/api'
import type { Lead, LeadFormValues, LeadResponse } from '@/types'
import { useApi } from '@/hooks/useApi'

const LeadsPage: React.FC = () => {
  // State variables
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Lead['status']>('all')
  const [filterSource, setFilterSource] = useState<'all' | Lead['source']>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [formError, setFormError] = useState('')
  const [savingLead, setSavingLead] = useState(false)
  const [detailsLead, setDetailsLead] = useState<Lead | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  
  // Debounce timer reference
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildLeadParams = useCallback((): LeadsQueryParams => {
    const params: LeadsQueryParams = {
      page: currentPage,
      limit: recordsPerPage,
      sortBy: 'createdAt',
      sortOrder: sortBy === 'latest' ? 'desc' : 'asc',
    }

    if (filterStatus !== 'all') {
      params.status = filterStatus
    }

    if (filterSource !== 'all') {
      params.source = filterSource
    }

    if (debouncedSearch) {
      params.search = debouncedSearch
    }

    return params
  }, [currentPage, debouncedSearch, filterSource, filterStatus, recordsPerPage, sortBy])
  
  // Fetch leads using useApi hook
  const fetchLeads = useCallback(() => leadsApi.getLeads(buildLeadParams()), [buildLeadParams])
  const { data: leadsData, loading, error, refetch } = useApi<LeadResponse>(fetchLeads)
  
  // Extract leads and pagination info
  const leads = leadsData?.data ?? []
  const pagination = leadsData?.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 }
  
  // Debounced search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim())
      setCurrentPage(1)
    }, 300)
  }, [])
  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])
  
  // Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lead?')) {
      return
    }

    setActionError('')
    try {
      await leadsApi.deleteLead(id)
      refetch()
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    }
  }

  const handleExportClick = async () => {
    setExporting(true)
    setActionError('')
    try {
      const exportParams: LeadExportParams = {}

      if (filterStatus !== 'all') {
        exportParams.status = filterStatus
      }

      if (filterSource !== 'all') {
        exportParams.source = filterSource
      }

      if (debouncedSearch) {
        exportParams.search = debouncedSearch
      }

      const blob = await leadsApi.exportLeads(exportParams)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `leads-export-${timestamp}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const handleOpenCreate = () => {
    setActionError('')
    setFormError('')
    setEditingLead(null)
    setFormMode('create')
  }

  const handleOpenEdit = (lead: Lead) => {
    setActionError('')
    setFormError('')
    setDetailsLead(null)
    setEditingLead(lead)
    setFormMode('edit')
  }

  const handleCloseForm = () => {
    if (savingLead) {
      return
    }

    setFormMode(null)
    setEditingLead(null)
    setFormError('')
  }

  const handleSubmitLead = async (values: LeadFormValues) => {
    setSavingLead(true)
    setFormError('')
    try {
      if (formMode === 'edit' && editingLead) {
        await leadsApi.updateLead(editingLead.id, values)
      } else {
        await leadsApi.createLead(values)
      }

      setFormMode(null)
      setEditingLead(null)
      refetch()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSavingLead(false)
    }
  }

  const handleOpenDetails = async (id: string) => {
    setActionError('')
    setDetailsLead(null)
    setDetailsLoading(true)
    try {
      const lead = await leadsApi.getLead(id)
      setDetailsLead(lead)
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setDetailsLoading(false)
    }
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleRecordsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing records per page
  }
  
  // If there's an error, show it
  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-200 text-red-700">
        <p>Error loading leads: {error}</p>
        <Button onClick={refetch} className="mt-2">Retry</Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Manage all your leads in one place</p>
        </div>
        <Button onClick={handleOpenCreate}>Add Lead</Button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-primary-500 border-t-transparent h-8 w-8"></div>
          <span className="ml-3 text-gray-600">Loading leads...</span>
        </div>
      )}
      
      {!loading && (
        <>
          <LeadFiltersBar
            search={search}
            filterStatus={filterStatus}
            filterSource={filterSource}
            sortBy={sortBy}
            exporting={exporting}
            onSearchChange={handleSearchChange}
            onStatusChange={(value) => {
              setFilterStatus(value)
              setCurrentPage(1)
            }}
            onSourceChange={(value) => {
              setFilterSource(value)
              setCurrentPage(1)
            }}
            onSortChange={(value) => {
              setSortBy(value)
              setCurrentPage(1)
            }}
            onExport={handleExportClick}
          />
          <LeadTable
            leads={leads}
            userRole={user?.role}
            onView={handleOpenDetails}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
          <PaginationControls
            pagination={pagination}
            recordsPerPage={recordsPerPage}
            onPageChange={handlePageChange}
            onRecordsPerPageChange={handleRecordsPerPageChange}
          />
        </>
      )}
      <LeadFormModal
        open={formMode !== null}
        mode={formMode ?? 'create'}
        lead={editingLead}
        submitting={savingLead}
        error={formError}
        onClose={handleCloseForm}
        onSubmit={handleSubmitLead}
      />
      <LeadDetailsModal
        lead={detailsLead}
        loading={detailsLoading}
        onClose={() => setDetailsLead(null)}
        onEdit={handleOpenEdit}
      />
    </div>
  )
}

export default LeadsPage
