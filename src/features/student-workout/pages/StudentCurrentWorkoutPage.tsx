import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

const exercises = [
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
]

export function StudentCurrentWorkoutPage() {
  return (
    <>
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

        <Card className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6F6A62]">Progresso do treino</span>
            <span className="font-semibold text-[#1F1F1F]">50%</span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[#EDEAE3]">
            <div className="h-2 w-1/2 rounded-full bg-[#2F4F3E]" />
          </div>

          <p className="mt-2 text-xs text-[#6F6A62]">
            3 de 6 exercícios concluídos
          </p>
        </Card>
      </section>

      <div className="mt-5 space-y-3">
        {exercises.map((exercise, index) => (
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
                    exercise.active ? 'text-white/75' : 'text-[#6F6A62]',
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

      <Button className="mt-5" fullWidth>
        Continuar treino
      </Button>
    </>
  )
}