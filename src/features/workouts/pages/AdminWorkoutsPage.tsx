import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'

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
]

export function AdminWorkoutsPage() {
  return (
    <>
      <PageHeader
        title="Treinos"
        description="Gerencie os treinos da sua academia de forma simples e organizada."
        action={<Button>Novo treino</Button>}
      />

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
              className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] md:grid-cols-[1fr_auto_auto_auto] md:items-center"
            >
              <div>
                <h2 className="font-semibold text-[#1F1F1F]">
                  {workout.name}
                </h2>

                <p className="mt-1 text-sm text-[#6F6A62]">{workout.group}</p>
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

              <span className="w-fit rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
                {workout.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}