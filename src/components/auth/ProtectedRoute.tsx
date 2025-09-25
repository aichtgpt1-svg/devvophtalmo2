import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import LoginForm from './LoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth().catch(error => {
      console.error('Error during auth check:', error)
    })
  }, [checkAuth])

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}
