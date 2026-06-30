import type { ReactNode } from 'react'

type AdminLayoutProps = {
  children: ReactNode
}

const navigationItems = [
  'Visão geral',
  'Alunos',
  'Treinos',
  'Exercícios',
  'Atribuições',
  'Relatórios',
]

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#1F1F1F]">
      <aside className="hidden border-r border-[#243D30]/20 bg-[#0F2A20] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64">
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div>
            <p className="text-xl font-bold tracking-tight">GymFlow</p>
            <p className="mt-1 text-xs text-white/60">
              Entenda. Execute. Evolua.
            </p>
          </div>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = item === 'Treinos'

            return (
              <button
                key={item}
                type="button"
                className={[
                  'w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F4EF] text-sm font-semibold text-[#2F4F3E]">
              JS
            </div>

            <div>
              <p className="text-sm font-semibold text-white">João Silva</p>
              <p className="text-xs text-white/60">Professor</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[#E4DFD6] bg-[#F6F4EF]/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-5 sm:px-6">
            <div>
              <p className="text-sm font-bold text-[#1F1F1F] lg:hidden">
                GymFlow
              </p>
              <p className="text-xs text-[#6F6A62]">
                Área do professor/admin
              </p>
            </div>

            <div className="rounded-full border border-[#D8D3CA] bg-white px-3 py-1 text-xs font-medium text-[#2F4F3E]">
              MVP
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-[#E4DFD6] px-4 py-3 lg:hidden">
            {navigationItems.map((item) => {
              const isActive = item === 'Treinos'

              return (
                <button
                  key={item}
                  type="button"
                  className={[
                    'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition',
                    isActive
                      ? 'bg-[#2F4F3E] text-white'
                      : 'bg-white text-[#6F6A62] hover:bg-[#EDEAE3] hover:text-[#1F1F1F]',
                  ].join(' ')}
                >
                  {item}
                </button>
              )
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}