import type { ReactNode } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/context/store'
import { Button } from '@/components/ui'

interface LayoutProps {
  children?: ReactNode
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                Leads Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link to="/leads" className="text-gray-700 hover:text-primary-600">
                Leads
              </Link>
              {user && (
                <span className="hidden sm:inline text-sm text-gray-500">
                  {user.name} - {user.role === 'admin' ? 'Admin' : 'Sales'}
                </span>
              )}
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
    </div>
  )
}

export default Layout
