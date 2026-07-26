import type { StudentWorkout } from "../../student-workout/types/studentWorkout";

type Props = {
  studentWorkouts: StudentWorkout[];
  isLoading: boolean;
  isError: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "INACTIVE") return "Inativo";
  if (status === "ARCHIVED") return "Arquivado";
  return status;
}

export function StudentAssignedWorkoutsCard({
  studentWorkouts,
  isLoading,
  isError,
}: Props) {
  return (
    <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
        Histórico
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
        Treinos atribuídos
      </h2>

      {isLoading && (
        <p role="status" className="mt-6 text-sm text-[#89948e]">
          Carregando histórico...
        </p>
      )}

      {isError && (
        <p role="alert" className="mt-6 text-sm text-[#ff8c87]">
          Não foi possível carregar os treinos atribuídos.
        </p>
      )}

      {!isLoading && !isError && studentWorkouts.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-[#343b37] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-[#f5f7f5]">
            Nenhum treino vinculado
          </p>
          <p className="mt-1 text-xs text-[#89948e]">
            Este aluno ainda não recebeu nenhum treino.
          </p>
        </div>
      )}

      {!isLoading && !isError && studentWorkouts.length > 0 && (
        <div className="mt-6 space-y-2">
          {studentWorkouts.map((workout) => {
            const isActive = workout.status === "ACTIVE";

            return (
              <div
                key={workout.studentWorkoutId}
                className={[
                  "flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                  isActive
                    ? "border-[#2f5b40] bg-[#19241d]"
                    : "border-[#303733] bg-[#191c1a]",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm font-semibold text-[#f5f7f5]">
                    {workout.workoutName}
                  </p>
                  <p className="mt-2 text-xs text-[#7f8a84]">
                    Atribuído em {formatDate(workout.assignedAt)}
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex min-h-7 w-fit items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
                    isActive
                      ? "bg-[#183725] text-[#70e39b]"
                      : "bg-[#292c2a] text-[#9aa29d]",
                  ].join(" ")}
                >
                  {formatStatus(workout.status)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
