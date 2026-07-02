import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'
import type { UserRole } from '../types/auth'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
}

function getDefaultPathByRole(role: UserRole) {
  if (role === 'STUDENT') {
    return '/student/current-workout'
  }

  return '/admin'
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    data: user,
    isLoading,
    isError,
  } = useAuthenticatedUser()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] px-5 text-[#1F1F1F]">
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-[#6F6A62]">
            Validando sua sessão...
          </p>
        </div>
      </main>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />
  }

  return children
}