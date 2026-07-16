type StudentWorkoutCompletionCardProps = {
  completedExercises: number;
  totalExercises: number;
  studentName?: string | null;
};

export function StudentWorkoutCompletionCard({
  completedExercises,
  totalExercises,
  studentName,
}: StudentWorkoutCompletionCardProps) {
  const formattedStudentName = studentName?.trim();

  const completionTitle = formattedStudentName
    ? `Parabéns, ${formattedStudentName}! Treino concluído.`
    : "Parabéns! Treino concluído.";

  return (
    <div className="mt-5 rounded-2xl border border-[#9FC5AE]/20 bg-[#16221B] p-5 shadow-lg shadow-black/10">
      <div className="rounded-2xl border border-[#9FC5AE]/20 bg-[#1D2B23] p-5">
        <p className="text-sm font-semibold text-[#9FC5AE]">Treino concluído</p>

        <h3 className="mt-2 text-xl font-bold text-[#F6F4EF]">
          {completionTitle}
        </h3>

        <p className="mt-2 text-sm text-[#C9C3B8]">
          Você finalizou todos os exercícios planejados para este treino.
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#111713] p-4">
          <p className="text-xs font-semibold text-[#9CA89F]">
            Resumo do treino
          </p>

          <p className="mt-1 text-sm font-semibold text-[#F6F4EF]">
            {completedExercises} de {totalExercises} exercícios concluídos
          </p>

          <p className="mt-1 text-xs text-[#C9C3B8]">
            Continue acompanhando seus treinos com consistência para evoluir.
          </p>
        </div>
      </div>
    </div>
  );
}
