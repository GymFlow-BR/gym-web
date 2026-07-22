import { Card } from "../../../components/ui/Card";
import type { StudentWorkout } from "../../student-workout/types/studentWorkout";

type StudentAssignedWorkoutsCardProps = {
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
  if (status === "ACTIVE") {
    return "Ativo";
  }

  if (status === "INACTIVE") {
    return "Inativo";
  }

  if (status === "ARCHIVED") {
    return "Arquivado";
  }

  return status;
}

export function StudentAssignedWorkoutsCard({
  studentWorkouts,
  isLoading,
  isError,
}: StudentAssignedWorkoutsCardProps) {
  return (
    <Card>
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Treinos
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Treinos atribuídos
        </h2>

        <p className="text-sm text-[#6F6A62]">
          Veja os treinos que já foram vinculados a este aluno.
        </p>
      </div>

      {isLoading && (
        <div
          role="status"
          className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
        >
          <p className="text-sm text-[#6F6A62]">
            Carregando treinos atribuídos...
          </p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao carregar treinos atribuídos.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Não foi possível buscar os treinos vinculados a este aluno.
          </p>
        </div>
      )}

      {!isLoading && !isError && studentWorkouts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Nenhum treino vinculado
          </p>
          <p className="mt-1 text-sm text-[#6F6A62]">
            Este aluno ainda não recebeu nenhum treino.
          </p>
        </div>
      )}

      {!isLoading && !isError && studentWorkouts.length > 0 && (
        <div className="space-y-3">
          {studentWorkouts.map((studentWorkout) => {
            const isActive = studentWorkout.status === "ACTIVE";

            return (
              <div
                key={studentWorkout.studentWorkoutId}
                className={
                  isActive
                    ? "rounded-2xl border border-green-200 bg-green-50 p-4"
                    : "rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p
                      className={
                        isActive
                          ? "text-sm font-semibold text-green-800"
                          : "text-sm font-semibold text-[#1F1F1F]"
                      }
                    >
                      {studentWorkout.workoutName}
                    </p>

                    <p
                      className={
                        isActive
                          ? "mt-1 text-sm text-green-700"
                          : "mt-1 text-sm text-[#6F6A62]"
                      }
                    >
                      Atribuído em {formatDate(studentWorkout.assignedAt)}
                    </p>
                  </div>

                  <span
                    className={
                      isActive
                        ? "inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700"
                        : "inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                    }
                  >
                    {formatStatus(studentWorkout.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
