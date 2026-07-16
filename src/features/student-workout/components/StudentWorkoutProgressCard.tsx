import { Card } from '../../../components/ui/Card'

type StudentWorkoutProgressCardProps = {
  progressPercentage: number
  completedExercises: number
  totalExercises: number
  progressMessage: string
}

export function StudentWorkoutProgressCard({
  progressPercentage,
  completedExercises,
  totalExercises,
  progressMessage,
}: StudentWorkoutProgressCardProps) {
  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6F6A62]">Progresso do treino</span>
        <span className="font-semibold text-[#1F1F1F]">
          {progressPercentage}%
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-[#EDEAE3]">
        <div
          className="h-2 rounded-full bg-[#2F4F3E]"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>

      <p className="mt-2 text-xs text-[#6F6A62]">
        {completedExercises} de {totalExercises} exercícios concluídos
      </p>

      <p className="mt-2 text-sm font-medium text-[#2F4F3E]">
        {progressMessage}
      </p>
    </Card>
  )
}