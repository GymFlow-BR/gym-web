import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router'

import { logout } from '../../features/auth/services/authService'

type AdminLayoutProps = {
  children: ReactNode
}

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Treinos', to: '/admin/workouts' },
  { label: 'Exercícios', to: '/admin/exercises' },
  { label: 'Alunos', to: '/admin/students' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
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
    <div className="min-h-screen bg-[#F3F0E8] text-[#1F1F1F]">
      <aside className="fixed hidden h-screen w-72 border-r border-[#E4DFD6] bg-[#FAF9F6] px-6 py-6 lg:block">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GymFlow</h1>
          <p className="mt-1 text-sm font-medium text-[#2F4F3E]">
            Painel administrativo
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                [
                  'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-[#2F4F3E] text-[#FAF9F6]'
                    : 'text-[#6F6A62] hover:bg-[#EFEAE1] hover:text-[#1F1F1F]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 py-3 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-[#E4DFD6] bg-[#FAF9F6] px-5 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">GymFlow</h1>
              <p className="text-xs font-medium text-[#2F4F3E]">
                Painel administrativo
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="rounded-xl border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-2 text-xs font-semibold text-[#6F6A62] disabled:cursor-not-allowed disabled:opacity-60"
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
                    'whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[#2F4F3E] text-[#FAF9F6]'
                      : 'bg-[#FFFEFB] text-[#6F6A62]',
                  ].join(' ')
                }
              >
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