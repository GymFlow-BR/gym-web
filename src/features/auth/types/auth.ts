export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type LoginRequest = {
  email: string
  password: string
}

export type AuthenticatedUser = {
  userId: number
  organizationId: number
  name: string
  email: string
  role: UserRole
}