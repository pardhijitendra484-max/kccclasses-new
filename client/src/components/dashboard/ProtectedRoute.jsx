import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('kcc_token')
  const user  = JSON.parse(localStorage.getItem('kcc_user') || '{}')

  if (!token || !user?.role) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    // Wrong role — redirect to their own dashboard
    const map = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
    return <Navigate to={map[user.role] || '/login'} replace />
  }
  return children
}
