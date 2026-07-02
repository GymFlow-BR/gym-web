import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { isApiError } from '../../../services/apiError'
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'
import type { UserRole } from '../types/auth'

type PublicOnlyRouteProps = {
  children: ReactNode
}

function getDefaultPathByRole(role: UserRole) {
  if (role === 'STUDENT') {
    return '/student/current-workout'
  }

  return '/admin'
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const {
    data: user,
    error,
    isLoading,
    isError,
  } = useAuthenticatedUser()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] px-5 text-[#1F1F1F]">
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-[#6F6A62]">
            Verificando sessão...
          </p>
        </div>
      </main>
    )
  }

  if (!isError && user) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />
  }

  if (isApiError(error) && error.status === 401) {
    return children
  }

  return children
}