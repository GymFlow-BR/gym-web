import type { ReactNode } from 'react'

type StudentLayoutProps = {
  children: ReactNode
  preview?: boolean
}

export function StudentLayout({
  children,
  preview = false,
}: StudentLayoutProps) {
  return (
    <div className={preview ? 'bg-slate-950 text-white' : 'min-h-screen bg-slate-950 text-white'}>
      <div
        className={[
          'mx-auto flex w-full max-w-md flex-col border-x border-slate-900 bg-slate-950',
          preview ? 'h-[640px]' : 'min-h-screen',
        ].join(' ')}
      >
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                GymFlow
              </p>
              <h1 className="text-lg font-bold">Meu treino</h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
              S
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
          {children}
        </main>

        <nav
          className={[
            'z-10 w-full max-w-md border-t border-slate-800 bg-slate-950/95 px-5 py-3 backdrop-blur',
            preview
              ? 'sticky bottom-0'
              : 'fixed bottom-0 left-1/2 -translate-x-1/2',
          ].join(' ')}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-white"
            >
              Treino
            </button>

            <button
              type="button"
              className="rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              Exercícios
            </button>

            <button
              type="button"
              className="rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              Perfil
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}