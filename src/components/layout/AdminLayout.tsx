import type { ReactNode } from 'react'

type AdminLayoutProps = {
  children: ReactNode
}

const navigationItems = [
  'Dashboard',
  'Alunos',
  'Exercícios',
  'Treinos',
  'Atribuições',
]

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="hidden border-r border-slate-800 bg-slate-900/70 lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-lg font-bold tracking-tight">GymFlow</span>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {navigationItems.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <p className="text-sm font-semibold text-white lg:hidden">
                GymFlow
              </p>
              <p className="text-xs text-slate-400">
                Área do professor/admin
              </p>
            </div>

            <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              MVP
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-slate-800 px-4 py-3 lg:hidden">
            {navigationItems.map((item) => (
              <button
                key={item}
                type="button"
                className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300"
              >
                {item}
              </button>
            ))}
          </nav>
        </header>

        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  )
}