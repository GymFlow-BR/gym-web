import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router'

import { logout } from '../../features/auth/services/authService'

type StudentLayoutProps = {
  children: ReactNode
}

const navItems = [
  { label: 'Treino', to: '/student/current-workout' },
  { label: 'Exercícios', to: '/student/exercises' },
  { label: 'Perfil', to: '/student/profile' },
]

export function StudentLayout({ children }: StudentLayoutProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    <div className="min-h-screen bg-[#F3F0E8] pb-24 text-[#1F1F1F]">
      <header className="border-b border-[#E4DFD6] bg-[#FAF9F6] px-5 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GymFlow</h1>
            <p className="text-sm font-medium text-[#2F4F3E]">
              Área do aluno
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="rounded-xl border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-2 text-xs font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#E4DFD6] bg-[#FAF9F6] px-4 py-3">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-2xl px-3 py-3 text-center text-sm font-medium transition',
                  isActive
                    ? 'bg-[#2F4F3E] text-[#FAF9F6]'
                    : 'text-[#6F6A62] hover:bg-[#EFEAE1]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}