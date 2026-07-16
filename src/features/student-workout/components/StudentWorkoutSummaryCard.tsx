type StudentWorkoutSummaryCardProps = {
  totalExercises: number;
  completedExercises: number;
  pendingExercises: number;
  progressPercentage: number;
  statusLabel: string;
};

export function StudentWorkoutSummaryCard({
  totalExercises,
  completedExercises,
  pendingExercises,
  progressPercentage,
  statusLabel,
}: StudentWorkoutSummaryCardProps) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-[#16221B] p-5 shadow-lg shadow-black/10">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-4">
          <p className="text-xs font-semibold text-[#9CA89F]">Total</p>

          <p className="mt-2 text-xl font-bold text-[#F6F4EF]">
            {totalExercises}
          </p>

          <p className="text-xs text-[#C9C3B8]">exercícios</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-4">
          <p className="text-xs font-semibold text-[#9CA89F]">Concluídos</p>

          <p className="mt-2 text-xl font-bold text-[#F6F4EF]">
            {completedExercises}
          </p>

          <p className="text-xs text-[#C9C3B8]">feitos</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-4">
          <p className="text-xs font-semibold text-[#9CA89F]">Pendentes</p>

          <p className="mt-2 text-xl font-bold text-[#F6F4EF]">
            {pendingExercises}
          </p>

          <p className="text-xs text-[#C9C3B8]">restantes</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-4">
          <p className="text-xs font-semibold text-[#9CA89F]">Status</p>

          <p className="mt-2 text-lg font-bold text-[#F6F4EF]">{statusLabel}</p>

          <p className="text-xs text-[#C9C3B8]">
            {progressPercentage}% concluído
          </p>
        </div>
      </div>
    </div>
  );
}
