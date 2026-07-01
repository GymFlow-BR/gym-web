import { api } from '../../../services/api'
import type { AuthenticatedUser, LoginRequest } from '../types/auth'

export function login(data: LoginRequest) {
  return api.post<AuthenticatedUser, LoginRequest>('/api/auth/login', data)
}

export function getAuthenticatedUser() {
  return api.get<AuthenticatedUser>('/api/auth/me')
}

export function logout() {
  return api.post<void>('/api/auth/logout')
}