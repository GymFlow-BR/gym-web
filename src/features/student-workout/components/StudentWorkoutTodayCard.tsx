import { CheckCircle2, Dumbbell, ListTodo } from "lucide-react";

type StudentWorkoutTodayCardProps = {
  workoutName: string;
  assignedAt: string;
  totalExercises: number;
  completedExercises: number;
  pendingExercises: number;
  progressPercentage: number;
};

function formatAssignedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function StudentWorkoutTodayCard({
  workoutName,
  assignedAt,
  totalExercises,
  completedExercises,
  pendingExercises,
  progressPercentage,
}: StudentWorkoutTodayCardProps) {
  return (
    <section className="relative mt-7 overflow-hidden rounded-[26px] border border-[#2e4b38] bg-[#111611] p-5 shadow-2xl shadow-black/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[34px] border-[#1d3828]/45"
      />

      <div className="relative">
        <span className="inline-flex h-8 items-center rounded-full bg-[#1d3828] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#70e39b]">
          Treino de hoje
        </span>

        <h2 className="mt-6 text-[29px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
          {workoutName}
        </h2>

        <p className="mt-4 text-sm leading-6 text-[#9aa39d]">
          Atribuído em {formatAssignedDate(assignedAt)}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#c5ccc8]">
          <span className="inline-flex items-center gap-2">
            <Dumbbell aria-hidden="true" className="h-4 w-4 text-[#70e39b]" />
            {totalExercises} {totalExercises === 1 ? "exercício" : "exercícios"}
          </span>

          <span className="inline-flex items-center gap-2">
            <CheckCircle2
              aria-hidden="true"
              className="h-4 w-4 text-[#70e39b]"
            />
            {completedExercises} concluídos
          </span>

          <span className="inline-flex items-center gap-2">
            <ListTodo aria-hidden="true" className="h-4 w-4 text-[#70e39b]" />
            {pendingExercises} pendentes
          </span>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#9aa39d]">
              {completedExercises} de {totalExercises} concluídos
            </p>

            <p className="text-sm font-bold text-[#70e39b]">
              {progressPercentage}%
            </p>
          </div>

          <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-[#29312b]">
            <div
              className="h-full rounded-full bg-[#70e39b] transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
