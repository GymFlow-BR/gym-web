import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import { deactivateWorkout, getWorkouts } from "../services/workoutService";
import { CreateWorkoutForm } from "../components/CreateWorkoutForm";
import { isApiError } from "../../../services/apiError";

function formatWorkoutStatus(status: string) {
  const statusMap: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
  };

  return statusMap[status] ?? status;
}

function getWorkoutStatusClassName(status: string) {
  if (status === "ACTIVE") {
    return "bg-[#2F4F3E]/10 text-[#2F4F3E]";
  }

  if (status === "ARCHIVED") {
    return "bg-[#EDEAE3] text-[#6F6A62]";
  }

  return "bg-yellow-50 text-yellow-700";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminWorkoutsPage() {
  const queryClient = useQueryClient();

  const {
    data: workouts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const deactivateWorkoutMutation = useMutation<void, Error, number>({
    mutationFn: (workoutId: number) => deactivateWorkout(workoutId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const deactivateErrorMessage =
    isApiError(deactivateWorkoutMutation.error) &&
    deactivateWorkoutMutation.error.status === 403
      ? "Você não possui permissão para inativar treinos."
      : "Não foi possível inativar o treino. Tente novamente.";

  function handleDeactivateWorkout(workoutId: number) {
    deactivateWorkoutMutation.mutate(workoutId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treinos"
        description="Gerencie os treinos modelo da sua organização."
      />

      <CreateWorkoutForm />

      {deactivateWorkoutMutation.isError && (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Erro ao inativar treino.
            </p>

            <p className="mt-1 text-sm text-red-600">
              {deactivateErrorMessage}
            </p>
          </div>
        </Card>
      )}

      {isLoading && (
        <Card>
          <p className="text-sm text-[#6F6A62]">
            Carregando treinos cadastrados...
          </p>
        </Card>
      )}

      {isError && (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Não foi possível carregar os treinos.
            </p>

            <p className="mt-2 text-sm text-red-600">
              Verifique se a API está rodando e se o usuário possui permissão
              para acessar este recurso.
            </p>

            <p className="mt-3 text-xs text-red-500">
              {error instanceof Error
                ? error.message
                : "Erro inesperado ao comunicar com a API."}
            </p>
          </div>
        </Card>
      )}

      {!isLoading && !isError && workouts?.length === 0 && (
        <Card>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Nenhum treino cadastrado
            </h2>

            <p className="mt-2 text-sm text-[#6F6A62]">
              Quando treinos forem cadastrados, eles aparecerão nesta lista.
            </p>
          </div>
        </Card>
      )}

      {!isLoading && !isError && workouts && workouts.length > 0 && (
        <Card className="p-0">
          <div className="border-b border-[#E4DFD6] p-5">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Treinos cadastrados
            </h2>

            <p className="mt-1 text-sm text-[#6F6A62]">
              Mostrando {workouts.length} treino
              {workouts.length === 1 ? "" : "s"} ativo
              {workouts.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="divide-y divide-[#EDEAE3]">
            {workouts.map((workout) => (
              <div
                key={workout.workoutId}
                className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] md:grid-cols-[1fr_auto_auto_auto] md:items-center"
              >
                <div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    {workout.workoutName}
                  </h3>

                  <p className="mt-1 text-sm text-[#6F6A62]">
                    Treino modelo criado para reutilização com alunos.
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Professor ID</p>

                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {workout.teacherId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Criado em</p>

                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {formatDate(workout.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <span
                    className={[
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      getWorkoutStatusClassName(workout.status),
                    ].join(" ")}
                  >
                    {formatWorkoutStatus(workout.status)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeactivateWorkout(workout.workoutId)}
                    disabled={deactivateWorkoutMutation.isPending}
                    className="w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deactivateWorkoutMutation.isPending
                      ? "Inativando..."
                      : "Inativar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
