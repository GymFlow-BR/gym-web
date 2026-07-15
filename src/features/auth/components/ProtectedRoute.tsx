import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { isApiError } from '../../../services/apiError'
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'
import type { UserRole } from '../types/auth'
import { getDefaultPathByRole } from '../utils/getDefaultPathByRole'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
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
            Validando sua sessão...
          </p>
        </div>
      </main>
    )
  }

  if (isError) {
    if (isApiError(error) && error.status === 401) {
      return <Navigate to="/login" replace />
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] px-5 text-[#1F1F1F]">
        <div className="max-w-md rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-[#1F1F1F]">
            Não foi possível validar sua sessão.
          </p>

          <p className="mt-2 text-sm text-[#6F6A62]">
            Tente recarregar a página ou fazer login novamente.
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />
  }

  return children
}