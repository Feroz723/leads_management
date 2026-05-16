import axios from 'axios'
import type {
  AuthCredentials,
  AuthResponse,
  Lead,
  LeadFormValues,
  LeadResponse,
  RegisterPayload,
  User,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface ApiResponse<T> {
  data: T
}

interface ProfileResponse {
  user: User
}

export interface LeadsQueryParams {
  page?: number
  limit?: number
  status?: Lead['status']
  source?: Lead['source']
  search?: string
  sortBy?: 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface LeadExportParams {
  status?: Lead['status']
  source?: Lead['source']
  search?: string
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; errors?: string[] } | undefined
    if (responseData?.errors?.length) {
      return responseData.errors.join(', ')
    }

    return responseData?.message ?? error.message
  }

  return error instanceof Error ? error.message : 'Something went wrong'
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<ProfileResponse>('/auth/profile')
    return data.user
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}

export const leadsApi = {
  getLeads: async (params?: LeadsQueryParams): Promise<LeadResponse> => {
    const { data } = await api.get('/leads', { params })
    return data
  },

  exportLeads: async (params?: LeadExportParams): Promise<Blob> => {
    const response = await api.get('/leads/export/csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  getLead: async (id: string): Promise<Lead> => {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`)
    return data.data
  },

  createLead: async (lead: LeadFormValues): Promise<Lead> => {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', lead)
    return data.data
  },

  updateLead: async (id: string, updates: LeadFormValues): Promise<Lead> => {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, updates)
    return data.data
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`)
  },
}

export default api
