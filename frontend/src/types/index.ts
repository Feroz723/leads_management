export type UserRole = 'admin' | 'sales_user'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  name: string
  role: UserRole
}

export interface Lead {
  id: string
  name: string
  email: string
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost'
  source: 'Website' | 'Instagram' | 'Referral'
  createdAt: string
  updatedAt: string
}

export type LeadFormValues = Pick<Lead, 'name' | 'email' | 'status' | 'source'>

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface LeadResponse {
  success: boolean
  data: Lead[]
  pagination: PaginationInfo
}
