import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode, SVGProps } from 'react'
import { NavLink, useNavigate } from 'react-router'

import { useAuthenticatedUser } from '../../features/auth/hooks/useAuthenticatedUser'
import { logout } from '../../features/auth/services/authService'
import type { UserRole } from '../../features/auth/types/auth'

type AdminLayoutProps = {
  children: ReactNode
}

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#0F3D31] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[64%] w-[64%]">
        <path
          d="M8.3 19c0-3.1 6-2.7 6-6.4s-6-2.5-6-6.4"
          stroke="#FFFFFF"
          strokeWidth={2.7}
          strokeLinecap="round"
        />
        <circle
          cx="15.4"
          cy="5.6"
          r="2.1"
          stroke="#FFFFFF"
          strokeWidth={2.2}
        />
      </svg>
    </span>
  )
}

function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  )
}

function StudentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M17.5 14.3c2.5.5 3.5 2.6 3.5 5.7" />
    </svg>
  )
}

function WorkoutsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 8v8M3.2 10v4M19 8v8M20.8 10v4M8.5 12h7" strokeWidth={2} />
      <rect x="5" y="6.5" width="3" height="11" rx="1" />
      <rect x="16" y="6.5" width="3" height="11" rx="1" />
    </svg>
  )
}

function ExercisesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 3 5 13h6l-1 8 8-10h-6z" />
    </svg>
  )
}

function EvaluationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="m8.5 13 2 2 4-4" />
    </svg>
  )
}

function ReportsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 20V10M11 20V4M18 20v-7" />
    </svg>
  )
}

const navItems = [
  { label: 'Visão geral', to: '/admin', icon: OverviewIcon },
  { label: 'Alunos', to: '/admin/students', icon: StudentsIcon },
  { label: 'Treinos', to: '/admin/workouts', icon: WorkoutsIcon },
  { label: 'Exercícios', to: '/admin/exercises', icon: ExercisesIcon },
  { label: 'Avaliações', to: '/admin/evaluations', icon: EvaluationsIcon },
  { label: 'Relatórios', to: '/admin/reports', icon: ReportsIcon },
]

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Personal',
  STUDENT: 'Aluno',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useAuthenticatedUser()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['authenticated-user'] })
      navigate('/login', { replace: true })
    },
  })

  function handleLogout() {
    logoutMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed hidden h-screen w-64 flex-col bg-gradient-to-b from-[#0B2A24] to-[#123D32] px-4 py-6 lg:flex">
        <div className="px-2">
          <span className="text-xl font-bold text-white">GymFlow</span>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-[#1BA65A] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              {user ? getInitials(user.name) : '...'}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name ?? 'Carregando...'}
              </p>
              <p className="truncate text-xs text-white/60">
                {user ? roleLabels[user.role] : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="mt-4 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-gradient-to-b from-[#0B2A24] to-[#123D32] px-5 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LogoMark className="h-8 w-8" />
              <span className="text-lg font-bold text-white">GymFlow</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  [
                    'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[#1BA65A] text-white'
                      : 'text-white/70 hover:text-white',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
