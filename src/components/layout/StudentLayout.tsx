import { NavLink } from 'react-router'

import type { ReactNode } from 'react'

type StudentLayoutProps = {
  children: ReactNode
  preview?: boolean
}

const navigationItems = [
  {
    label: 'Treino',
    href: '/student/current-workout',
  },
  {
    label: 'Exercícios',
    href: '/student/exercises',
  },
  {
    label: 'Perfil',
    href: '/student/profile',
  },
]

export function StudentLayout({
  children,
  preview = false,
}: StudentLayoutProps) {
  return (
    <div
      className={
        preview
          ? 'bg-[#F3F0E8] text-[#1F1F1F]'
          : 'min-h-screen bg-[#F3F0E8] text-[#1F1F1F]'
      }
    >
      <div
        className={[
          'mx-auto flex w-full max-w-md flex-col bg-[#FAF9F6]',
          preview
            ? 'h-[560px]'
            : 'min-h-screen border-x border-[#E4DFD6]',
        ].join(' ')}
      >
        <header className="sticky top-0 z-10 border-b border-[#E4DFD6] bg-[#FAF9F6]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2F4F3E]">
                GymFlow
              </p>

              <h1 className="text-lg font-bold text-[#1F1F1F]">Meu treino</h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F4F3E] text-sm font-semibold text-white">
              S
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
          {children}
        </main>

        <nav
          className={[
            'z-10 w-full max-w-md border-t border-[#E4DFD6] bg-[#FAF9F6]/95 px-5 py-3 backdrop-blur',
            preview
              ? 'sticky bottom-0'
              : 'fixed bottom-0 left-1/2 -translate-x-1/2',
          ].join(' ')}
        >
          <div className="grid grid-cols-3 gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-2 text-center text-xs font-medium transition',
                    isActive
                      ? 'bg-[#2F4F3E] text-white'
                      : 'text-[#6F6A62] hover:bg-[#EDEAE3] hover:text-[#1F1F1F]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}