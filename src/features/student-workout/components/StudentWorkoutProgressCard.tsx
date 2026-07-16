type StudentWorkoutProgressCardProps = {
  progressPercentage: number;
  completedExercises: number;
  totalExercises: number;
  progressMessage: string;
};

export function StudentWorkoutProgressCard({
  progressPercentage,
  completedExercises,
  totalExercises,
  progressMessage,
}: StudentWorkoutProgressCardProps) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-[#16221B] p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#C9C3B8]">
          Progresso do treino
        </p>

        <p className="text-sm font-bold text-[#F6F4EF]">
          {progressPercentage}%
        </p>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-[#F6F4EF]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-[#9CA89F]">
        {completedExercises} de {totalExercises} exercícios concluídos
      </p>

      <p className="mt-3 text-sm font-medium text-[#F6F4EF]">
        {progressMessage}
      </p>
    </div>
  );
}
