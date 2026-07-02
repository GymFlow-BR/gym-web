import { useQuery } from '@tanstack/react-query'

import { getAuthenticatedUser } from '../services/authService'

export function useAuthenticatedUser() {
  return useQuery({
    queryKey: ['authenticated-user'],
    queryFn: getAuthenticatedUser,
    retry: false,
  })
}