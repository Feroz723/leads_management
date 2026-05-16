import { useState, useEffect, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options?: UseApiOptions<T>
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await apiCall()
      setState({ data, loading: false, error: null })
      options?.onSuccess?.(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      options?.onError?.(error)
    }
  }, [apiCall, options])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}
