import { Card } from '../../../components/ui/Card'

type StudentWorkoutCompletionCardProps = {
  completedExercises: number
  totalExercises: number
}

export function StudentWorkoutCompletionCard({
  completedExercises,
  totalExercises,
}: StudentWorkoutCompletionCardProps) {
  return (
    <Card className="mt-5">
      <div className="rounded-2xl border border-[#2F4F3E]/20 bg-[#2F4F3E]/10 p-5">
        <p className="text-sm font-semibold text-[#2F4F3E]">
          Treino concluído
        </p>

        <h3 className="mt-2 text-xl font-bold text-[#1F1F1F]">
          Parabéns, você concluiu seu treino!
        </h3>

        <p className="mt-2 text-sm text-[#6F6A62]">
          Você finalizou todos os exercícios planejados para este treino.
        </p>

        <div className="mt-4 rounded-2xl bg-[#FFFEFB] p-4">
          <p className="text-xs font-semibold text-[#8A8378]">
            Resumo do treino
          </p>

          <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
            {completedExercises} de {totalExercises} exercícios concluídos
          </p>

          <p className="mt-1 text-xs text-[#6F6A62]">
            Continue acompanhando seus treinos com consistência para evoluir.
          </p>
        </div>
      </div>
    </Card>
  )
}