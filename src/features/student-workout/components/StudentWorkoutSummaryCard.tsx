import { Card } from '../../../components/ui/Card'

type StudentWorkoutSummaryCardProps = {
  totalExercises: number
  completedExercises: number
  pendingExercises: number
  progressPercentage: number
  statusLabel: string
}

export function StudentWorkoutSummaryCard({
  totalExercises,
  completedExercises,
  pendingExercises,
  progressPercentage,
  statusLabel,
}: StudentWorkoutSummaryCardProps) {
  return (
    <Card className="mt-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#FAF9F6] p-3">
          <p className="text-xs font-semibold text-[#8A8378]">Total</p>

          <p className="mt-1 text-lg font-bold text-[#1F1F1F]">
            {totalExercises}
          </p>

          <p className="text-xs text-[#6F6A62]">exercícios</p>
        </div>

        <div className="rounded-2xl bg-[#FAF9F6] p-3">
          <p className="text-xs font-semibold text-[#8A8378]">Concluídos</p>

          <p className="mt-1 text-lg font-bold text-[#2F4F3E]">
            {completedExercises}
          </p>

          <p className="text-xs text-[#6F6A62]">feitos</p>
        </div>

        <div className="rounded-2xl bg-[#FAF9F6] p-3">
          <p className="text-xs font-semibold text-[#8A8378]">Pendentes</p>

          <p className="mt-1 text-lg font-bold text-[#1F1F1F]">
            {pendingExercises}
          </p>

          <p className="text-xs text-[#6F6A62]">restantes</p>
        </div>

        <div className="rounded-2xl bg-[#FAF9F6] p-3">
          <p className="text-xs font-semibold text-[#8A8378]">Status</p>

          <p className="mt-1 text-lg font-bold text-[#1F1F1F]">
            {statusLabel}
          </p>

          <p className="text-xs text-[#6F6A62]">
            {progressPercentage}% concluído
          </p>
        </div>
      </div>
    </Card>
  )
}