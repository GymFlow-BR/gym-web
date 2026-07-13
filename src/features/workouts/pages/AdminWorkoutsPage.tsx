import type { SVGProps } from 'react'

type WorkoutStatus = 'Ativo' | 'Inativo'

type Workout = {
  name: string
  group: string
  exercises: number
  students: number
  status: WorkoutStatus
}

const workouts: Workout[] = [
  {
    name: 'Treino A - Peito e Tríceps',
    group: 'Peito, Tríceps',
    exercises: 6,
    students: 26,
    status: 'Ativo',
  },
  {
    name: 'Treino B - Pernas',
    group: 'Pernas',
    exercises: 7,
    students: 18,
    status: 'Ativo',
  },
  {
    name: 'Treino C - Costas e Bíceps',
    group: 'Costas, Bíceps',
    exercises: 8,
    students: 21,
    status: 'Ativo',
  },
  {
    name: 'Treino D - Ombros',
    group: 'Ombros',
    exercises: 5,
    students: 15,
    status: 'Inativo',
  },
]

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function MoreVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

function WorkoutTileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 8v8M3.2 10v4M19 8v8M20.8 10v4M8.5 12h7" />
      <rect x="5" y="6.5" width="3" height="11" rx="1" />
      <rect x="16" y="6.5" width="3" height="11" rx="1" />
    </svg>
  )
}

function StatusBadge({ status }: { status: WorkoutStatus }) {
  const isActive = status === 'Ativo'

  return (
    <span
      className={[
        'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        isActive ? 'bg-[#1BA65A]/10 text-[#12793F]' : 'bg-gray-100 text-gray-500',
      ].join(' ')}
    >
      {status}
    </span>
  )
}

export function AdminWorkoutsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Treinos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os treinos dos seus alunos.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1BA65A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#159452]"
        >
          <PlusIcon className="h-4 w-4" />
          Novo treino
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar treino"
              aria-label="Buscar treino"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por grupo muscular"
              className="w-full appearance-none rounded-lg border border-gray-200 py-2.5 pl-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10 sm:w-44"
              defaultValue="all"
            >
              <option value="all">Todos os grupos</option>
              <option value="chest">Peito</option>
              <option value="back">Costas</option>
              <option value="legs">Pernas</option>
              <option value="shoulders">Ombros</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por status"
              className="w-full appearance-none rounded-lg border border-gray-200 py-2.5 pl-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10 sm:w-36"
              defaultValue="all"
            >
              <option value="all">Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="hidden grid-cols-[1fr_110px_90px_100px_32px] gap-4 px-5 py-3 text-xs font-medium text-gray-400 md:grid">
          <span>Treino</span>
          <span>Exercícios</span>
          <span>Alunos</span>
          <span>Status</span>
          <span />
        </div>

        <div className="divide-y divide-gray-100">
          {workouts.map((workout) => (
            <div
              key={workout.name}
              className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-gray-50 md:grid-cols-[1fr_110px_90px_100px_32px] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#0F3D31] text-white">
                  <WorkoutTileIcon className="h-6 w-6" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {workout.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {workout.group}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700 md:text-center">
                <span className="text-xs text-gray-400 md:hidden">
                  Exercícios:{' '}
                </span>
                {workout.exercises}
              </div>

              <div className="text-sm text-gray-700 md:text-center">
                <span className="text-xs text-gray-400 md:hidden">
                  Alunos:{' '}
                </span>
                {workout.students}
              </div>

              <div>
                <StatusBadge status={workout.status} />
              </div>

              <button
                type="button"
                aria-label="Mais opções"
                className="w-fit text-gray-400 transition hover:text-gray-600"
              >
                <MoreVerticalIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Mostrando 1 a {workouts.length} de {workouts.length} treinos
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1BA65A] text-sm font-semibold text-white"
            >
              1
            </button>

            <button
              type="button"
              aria-label="Próxima página"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
