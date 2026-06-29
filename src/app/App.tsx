function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-400">
          GymFlow Frontend
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Projeto frontend iniciado com sucesso
        </h1>

        <p className="mt-4 max-w-2xl text-base text-slate-300">
          React, TypeScript, Vite e Tailwind CSS configurados para o MVP.
        </p>

        <button className="mt-8 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
          Começar
        </button>
      </section>
    </main>
  )
}

export default App