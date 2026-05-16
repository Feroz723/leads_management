// Lead store using Zustand
import { create } from 'zustand'
import type { Lead, User } from '@/types'

const getStoredUser = (): User | null => {
  const rawUser = localStorage.getItem('user')
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token })
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
}))

interface LeadsState {
  leads: Lead[]
  selectedLead: Lead | null
  loading: boolean
  setLeads: (leads: Lead[]) => void
  setSelectedLead: (lead: Lead | null) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  removeLead: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  selectedLead: null,
  loading: false,
  setLeads: (leads) => set({ leads }),
  setSelectedLead: (selectedLead) => set({ selectedLead }),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      ),
    })),
  removeLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}))
