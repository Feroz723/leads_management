import { Routes, Route, Navigate } from 'react-router-dom'
import { GuestRoute, Layout, ProtectedRoute } from '@/components/layout'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
