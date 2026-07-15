import type { UserRole } from '../types/auth'

export function getDefaultPathByRole(role: UserRole) {
  if (role === 'STUDENT') {
    return '/student/current-workout'
  }

  return '/admin'
}