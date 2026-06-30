import { AdminLayout } from '../components/layout/AdminLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { StudentLayout } from '../components/layout/StudentLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const workouts = [
  {
    name: 'Treino A - Peito e Tríceps',
    group: 'Peito, Tríceps',
    exercises: 6,
    students: 28,
    status: 'Ativo',
  },
  {
    name: 'Treino B - Pernas',
    group: 'Pernas',
    exercises: 7,
    students: 34,
    status: 'Ativo',
  },
  {
    name: 'Treino C - Costas e Bíceps',
    group: 'Costas, Bíceps',
    exercises: 6,
    students: 21,
    status: 'Ativo',
  },
  {
    name: 'Treino D - Ombros',
    group: 'Ombros',
    exercises: 5,
    students: 18,
    status: 'Inativo',
  },
]

const studentExercises = [
  {
    name: 'Supino Reto',
    description: '4 séries • 8–12 reps',
    done: true,
  },
  {
    name: 'Supino Inclinado',
    description: '4 séries • 8–12 reps',
    done: true,
  },
  {
    name: 'Crucifixo Reto',
    description: '3 séries • 10–15 reps',
    active: true,
  },
  {
    name: 'Tríceps Corda',
    description: '3 séries • 10–15 reps',
  },
  {
    name: 'Tríceps Testa',
    description: '3 séries • 8–12 reps',
  },
]

function App() {
  return (
    <AdminLayout>
      <PageHeader
        title="Treinos"
        description="Gerencie os treinos da sua academia de forma simples e organizada."
        action={<Button>Novo treino</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-0">
          <div className="border-b border-[#E4DFD6] p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                name="search"
                placeholder="Buscar treinos..."
                aria-label="Buscar treinos"
              />

              <Input
                name="group"
                placeholder="Todos os grupos"
                aria-label="Grupo muscular"
              />

              <Input name="status" placeholder="Status" aria-label="Status" />
            </div>
          </div>

          <div className="divide-y divide-[#EDEAE3]">
            {workouts.map((workout) => (
              <div
                key={workout.name}
                className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center"
              >
                <div>
                  <h2 className="font-semibold text-[#1F1F1F]">
                    {workout.name}
                  </h2>

                  <p className="mt-1 text-sm text-[#6F6A62]">
                    {workout.group}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Exercícios</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {workout.exercises}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Alunos</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {workout.students}
                  </p>
                </div>

                <span
                  className={[
                    'w-fit rounded-full px-3 py-1 text-xs font-semibold',
                    workout.status === 'Ativo'
                      ? 'bg-[#2F4F3E]/10 text-[#2F4F3E]'
                      : 'bg-[#EDEAE3] text-[#6F6A62]',
                  ].join(' ')}
                >
                  {workout.status}
                </span>

                <button
                  type="button"
                  className="text-xl leading-none text-[#8A8378] hover:text-[#1F1F1F]"
                  aria-label={`Abrir ações de ${workout.name}`}
                >
                  ⋮
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[#E4DFD6] p-5 text-sm text-[#6F6A62] sm:flex-row sm:items-center sm:justify-between">
            <span>Mostrando 4 de 12 treinos</span>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                1
              </Button>

              <Button variant="ghost" size="sm">
                2
              </Button>

              <Button variant="ghost" size="sm">
                3
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Preview do aluno
              </h2>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Visualização mobile-first do treino atual.
              </p>
            </div>

            <span className="rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
              Mobile
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[2rem] border border-[#E4DFD6] bg-[#FAF9F6] shadow-sm">
            <StudentLayout preview>
              <section>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#6F6A62]">Treino atual</p>

                    <h2 className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                      Treino A
                    </h2>

                    <p className="text-lg font-semibold text-[#2F4F3E]">
                      Peito e Tríceps
                    </p>
                  </div>

                  <span className="rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
                    Em andamento
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#E4DFD6] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6F6A62]">
                      Progresso do treino
                    </span>

                    <span className="font-semibold text-[#1F1F1F]">50%</span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-[#EDEAE3]">
                    <div className="h-2 w-1/2 rounded-full bg-[#2F4F3E]" />
                  </div>

                  <p className="mt-2 text-xs text-[#6F6A62]">
                    3 de 6 exercícios concluídos
                  </p>
                </div>
              </section>

              <div className="mt-5 space-y-3">
                {studentExercises.map((exercise, index) => (
                  <div
                    key={exercise.name}
                    className={[
                      'rounded-2xl border p-4 transition',
                      exercise.active
                        ? 'border-[#2F4F3E] bg-[#2F4F3E] text-white shadow-sm'
                        : 'border-[#E4DFD6] bg-white text-[#1F1F1F]',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {index + 1}. {exercise.name}
                        </p>

                        <p
                          className={[
                            'mt-1 text-xs',
                            exercise.active
                              ? 'text-white/75'
                              : 'text-[#6F6A62]',
                          ].join(' ')}
                        >
                          {exercise.description}
                        </p>
                      </div>

                      <span
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded-full border text-xs',
                          exercise.active
                            ? 'border-white/40 text-white'
                            : exercise.done
                              ? 'border-[#2F4F3E] bg-[#2F4F3E] text-white'
                              : 'border-[#B7B2A8] text-[#6F6A62]',
                        ].join(' ')}
                      >
                        {exercise.done ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </StudentLayout>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default App