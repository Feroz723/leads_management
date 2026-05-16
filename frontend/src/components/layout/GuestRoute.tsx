import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/context/store'

function GuestRoute() {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default GuestRoute
