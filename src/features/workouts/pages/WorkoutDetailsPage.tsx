import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isApiError } from "../../../services/apiError";
import { Link, useParams } from "react-router";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import {
  getWorkoutById,
  getWorkoutExercises,
  removeWorkoutExercise,
} from "../services/workoutService";
import { CreateWorkoutExerciseForm } from "../components/CreateWorkoutExerciseForm";

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

function formatRestTime(seconds: number | null) {
  if (seconds === null) {
    return "Não informado";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

function formatRecommendedLoad(value: number | null) {
  if (value === null) {
    return "Não informado";
  }

  return `${value} kg`;
}

export function WorkoutDetailsPage() {
  const queryClient = useQueryClient();
  const { workoutId } = useParams();

  const parsedWorkoutId = Number(workoutId);
  const isValidWorkoutId = Number.isFinite(parsedWorkoutId);

  const {
    data: workout,
    isLoading: isLoadingWorkout,
    isError: isWorkoutError,
    error: workoutError,
  } = useQuery({
    queryKey: ["workout", parsedWorkoutId],
    queryFn: () => getWorkoutById(parsedWorkoutId),
    enabled: isValidWorkoutId,
  });

  const {
    data: workoutExercises,
    isLoading: isLoadingWorkoutExercises,
    isError: isWorkoutExercisesError,
    error: workoutExercisesError,
  } = useQuery({
    queryKey: ["workout-exercises", parsedWorkoutId],
    queryFn: () => getWorkoutExercises(parsedWorkoutId),
    enabled: isValidWorkoutId,
  });

  const removeWorkoutExerciseMutation = useMutation<void, Error, number>({
    mutationFn: (workoutExerciseId: number) =>
      removeWorkoutExercise(parsedWorkoutId, workoutExerciseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workout-exercises", parsedWorkoutId],
      });
    },
  });

  const removeWorkoutExerciseErrorMessage =
    isApiError(removeWorkoutExerciseMutation.error) &&
    removeWorkoutExerciseMutation.error.status === 403
      ? "Você não possui permissão para remover exercícios deste treino."
      : "Não foi possível remover o exercício do treino. Tente novamente.";

  function handleRemoveWorkoutExercise(workoutExerciseId: number) {
    removeWorkoutExerciseMutation.mutate(workoutExerciseId);
  }

  const isLoading = isLoadingWorkout || isLoadingWorkoutExercises;
  const isError = isWorkoutError || isWorkoutExercisesError;
  const error = workoutError || workoutExercisesError;

  if (!isValidWorkoutId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treino inválido"
          description="Não foi possível identificar o treino solicitado."
        />

        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-5 shadow-sm">
          <p className="text-sm text-[#6F6A62]">
            O identificador informado na URL não corresponde a um treino válido.
          </p>

          <Link
            to="/admin/workouts"
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8D3CA] bg-[#FFFEFB] px-3 py-2 text-sm font-semibold text-[#2F4F3E] shadow-sm transition hover:border-[#2F4F3E] hover:bg-[#F6F4EF]"
          >
            ← Voltar para treinos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/workouts"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8D3CA] bg-[#FFFEFB] px-3 py-2 text-sm font-semibold text-[#2F4F3E] shadow-sm transition hover:border-[#2F4F3E] hover:bg-[#F6F4EF]"
        >
          ← Voltar para treinos
        </Link>
      </div>

      <PageHeader
        title={workout?.workoutName ?? "Detalhes do treino"}
        description="Visualize os detalhes do treino modelo e os exercícios vinculados."
      />

      {isLoading && (
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Carregando detalhes do treino...
          </p>

          <p className="mt-1 text-sm text-[#6F6A62]">
            Estamos buscando as informações do treino e os exercícios
            vinculados.
          </p>
        </div>
      )}

      {isError && (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Não foi possível carregar os detalhes do treino.
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

      {!isLoading && !isError && workout && (
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Treino modelo
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#1F1F1F]">
                {workout.workoutName}
              </h2>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Configure os exercícios que farão parte deste treino antes de
                atribuí-lo aos alunos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:flex md:items-center">
              <div className="rounded-2xl border border-[#EDEAE3] bg-[#FAF9F6] px-4 py-3">
                <p className="text-xs font-semibold text-[#8A8378]">
                  Professor ID
                </p>
                <p className="mt-1 text-sm font-bold text-[#1F1F1F]">
                  {workout.teacherId}
                </p>
              </div>

              <div className="rounded-2xl border border-[#EDEAE3] bg-[#FAF9F6] px-4 py-3">
                <p className="text-xs font-semibold text-[#8A8378]">Status</p>

                <span
                  className={[
                    "mt-1 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                    getWorkoutStatusClassName(workout.status),
                  ].join(" ")}
                >
                  {formatWorkoutStatus(workout.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && workout && (
        <CreateWorkoutExerciseForm workoutId={parsedWorkoutId} />
      )}

      {removeWorkoutExerciseMutation.isError && (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Erro ao remover exercício.
            </p>

            <p className="mt-1 text-sm text-red-600">
              {removeWorkoutExerciseErrorMessage}
            </p>
          </div>
        </Card>
      )}

      {!isLoading &&
        !isError &&
        workoutExercises &&
        workoutExercises.length === 0 && (
          <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-6 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              Exercícios do treino
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
              Nenhum exercício vinculado
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-[#6F6A62]">
              Use o formulário acima para adicionar exercícios a este treino
              modelo. Depois disso, eles aparecerão organizados por ordem de
              execução.
            </p>
          </div>
        )}

      {!isLoading &&
        !isError &&
        workoutExercises &&
        workoutExercises.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
            <div className="border-b border-[#E4DFD6] p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1F1F1F]">
                    Exercícios do treino
                  </h2>

                  <p className="mt-1 text-sm text-[#6F6A62]">
                    Mostrando {workoutExercises.length} exercício
                    {workoutExercises.length === 1 ? "" : "s"} vinculado
                    {workoutExercises.length === 1 ? "" : "s"}.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
                  Ordenado por execução
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#EDEAE3]">
              {[...workoutExercises]
                .sort(
                  (first, second) => first.exerciseOrder - second.exerciseOrder,
                )
                .map((workoutExercise) => (
                  <div
                    key={workoutExercise.id}
                    className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] lg:grid-cols-[auto_1fr_76px_96px_88px_96px_auto] lg:items-center lg:gap-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F4F3E]/10 text-sm font-bold text-[#2F4F3E]">
                      {workoutExercise.exerciseOrder}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1F1F1F]">
                        {workoutExercise.exerciseName}
                      </h3>

                      <p className="mt-1 text-sm text-[#6F6A62]">
                        {workoutExercise.muscleGroup} •{" "}
                        {workoutExercise.equipmentName || "Sem equipamento"}
                      </p>

                      {workoutExercise.notes && (
                        <p className="mt-2 text-sm text-[#6F6A62]">
                          {workoutExercise.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-[#8A8378]">Séries</p>
                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {workoutExercise.sets}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-[#8A8378]">Repetições</p>
                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {workoutExercise.reps}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-[#8A8378]">Carga</p>
                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {formatRecommendedLoad(workoutExercise.recommendedLoad)}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-[#8A8378]">Descanso</p>
                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {formatRestTime(workoutExercise.restTimeSeconds)}
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveWorkoutExercise(workoutExercise.id)
                        }
                        disabled={removeWorkoutExerciseMutation.isPending}
                        className="w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removeWorkoutExerciseMutation.isPending
                          ? "Removendo..."
                          : "Remover"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}
