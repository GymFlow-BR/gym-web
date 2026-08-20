import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Dumbbell, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { getStudentsByOrganization } from "../../students/services/studentService";
import { getStudentWorkouts } from "../../student-workout/services/studentWorkoutService";
import { CreateWorkoutExerciseForm } from "../components/CreateWorkoutExerciseForm";
import {
  getWorkoutById,
  getWorkoutExercises,
  removeWorkoutExercise,
} from "../services/workoutService";

function formatWorkoutStatus(status: string) {
  const statusMap: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
  };

  return statusMap[status] ?? status;
}

function getWorkoutStatusDescription(status: string) {
  if (status === "ACTIVE") {
    return "Disponível para atribuição";
  }

  return "Indisponível para novas atribuições";
}

function getWorkoutStatusDotClassName(status: string) {
  if (status === "ACTIVE") {
    return "bg-[#70E39B]";
  }

  if (status === "ARCHIVED") {
    return "bg-[#A8B0AA]";
  }

  return "bg-[#F4C76B]";
}

function formatRestTime(seconds: number | null) {
  if (seconds === null) {
    return "—";
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
    return "—";
  }

  return `${value} kg`;
}

export function WorkoutDetailsPage() {
  const queryClient = useQueryClient();
  const { workoutId } = useParams();
  const authenticatedUserQuery = useAuthenticatedUser();

  const [workoutExerciseToRemove, setWorkoutExerciseToRemove] = useState<
    number | null
  >(null);

  const parsedWorkoutId = Number(workoutId);
  const isValidWorkoutId =
    Number.isFinite(parsedWorkoutId) && parsedWorkoutId > 0;

  const organizationId = authenticatedUserQuery.data?.organizationId;

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

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const students = studentsQuery.data ?? [];

  const studentWorkoutQueries = useQueries({
    queries: students.map((student) => ({
      queryKey: ["student-workouts", student.id],
      queryFn: () => getStudentWorkouts(student.id),
      enabled: isValidWorkoutId && Boolean(organizationId),
      staleTime: 60_000,
    })),
  });

  const linkedStudentsCount = useMemo(() => {
    return studentWorkoutQueries.filter((query) =>
      query.data?.some(
        (studentWorkout) =>
          studentWorkout.workoutId === parsedWorkoutId &&
          studentWorkout.status === "ACTIVE",
      ),
    ).length;
  }, [parsedWorkoutId, studentWorkoutQueries]);

  const isLoadingLinkedStudents =
    studentsQuery.isLoading ||
    studentWorkoutQueries.some((query) => query.isLoading);

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
    setWorkoutExerciseToRemove(workoutExerciseId);
  }

  function handleConfirmRemoveWorkoutExercise() {
    if (workoutExerciseToRemove === null) {
      return;
    }

    removeWorkoutExerciseMutation.mutate(workoutExerciseToRemove, {
      onSuccess: () => {
        setWorkoutExerciseToRemove(null);
      },
    });
  }

  function handleCancelRemoveWorkoutExercise() {
    if (removeWorkoutExerciseMutation.isPending) {
      return;
    }

    setWorkoutExerciseToRemove(null);
  }

  const sortedWorkoutExercises = [...(workoutExercises ?? [])].sort(
    (first, second) => first.exerciseOrder - second.exerciseOrder,
  );

  const isLoading = isLoadingWorkout || isLoadingWorkoutExercises;
  const isError = isWorkoutError || isWorkoutExercisesError;
  const error = workoutError || workoutExercisesError;

  if (!isValidWorkoutId) {
    return (
      <main className="min-h-full bg-[#0B0F0D] text-white">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <section className="rounded-[22px] border border-[#29302C] bg-[#171A18] p-6">
            <p className="text-sm font-semibold text-[#FF8A8A]">
              Treino inválido.
            </p>

            <p className="mt-2 text-sm text-[#91A097]">
              Não foi possível identificar o treino solicitado.
            </p>

            <Link
              to="/admin/workouts"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-[#39413C] px-4 text-sm font-semibold text-white transition hover:border-[#70E39B]/50 hover:bg-[#1D2A22]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para treinos
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#0B0F0D] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Link
          to="/admin/workouts"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#29302C] bg-[#101412] px-4 text-sm font-semibold text-[#C8D0CC] transition hover:border-[#70E39B]/45 hover:bg-[#18201B] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para treinos
        </Link>

        <header className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#91A097]">
            Treino modelo
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {workout?.workoutName ?? "Detalhes do treino"}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#91A097]">
            Configure a sequência e os parâmetros antes de atribuir aos alunos.
          </p>
        </header>

        {isLoading && (
          <div
            role="status"
            className="mt-8 rounded-[22px] border border-[#29302C] bg-[#171A18] px-6 py-12 text-center text-sm text-[#91A097]"
          >
            Carregando detalhes do treino...
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="mt-8 rounded-[22px] border border-[#6A3434] bg-[#2B1919] p-5"
          >
            <p className="text-sm font-semibold text-[#FF8A8A]">
              Não foi possível carregar os detalhes do treino.
            </p>

            <p className="mt-2 text-sm text-[#FFB0B0]">
              Verifique se a API está rodando e se o usuário possui permissão
              para acessar este recurso.
            </p>

            <p className="mt-3 text-xs text-[#FF8A8A]">
              {error instanceof Error
                ? error.message
                : "Erro inesperado ao comunicar com a API."}
            </p>
          </div>
        )}

        {!isLoading && !isError && workout && (
          <>
            <section className="mt-8 rounded-[22px] border border-[#29302C] bg-[#171A18] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1D3B2A] text-[#70E39B]">
                    <Dumbbell className="h-6 w-6" strokeWidth={1.9} />
                  </span>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
                      Treino modelo
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {workout.workoutName}
                    </h2>

                    <p className="mt-2 text-sm text-[#91A097]">
                      {sortedWorkoutExercises.length}{" "}
                      {sortedWorkoutExercises.length === 1
                        ? "exercício organizado"
                        : "exercícios organizados"}{" "}
                      na sequência.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="hidden h-14 w-px bg-[#29302C] lg:block" />

                  <div className="flex min-w-[150px] items-center gap-3 rounded-[16px] border border-[#29302C] bg-[#121614] px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1D3B2A] text-[#70E39B]">
                      <Users className="h-5 w-5" strokeWidth={1.8} />
                    </span>

                    <div>
                      <p className="text-lg font-semibold leading-none text-white">
                        {isLoadingLinkedStudents ? "..." : linkedStudentsCount}
                      </p>

                      <p className="mt-1 text-xs text-[#77827B]">
                        alunos vinculados
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-14 w-px bg-[#29302C] lg:block" />

                  <div className="flex min-w-[190px] items-center gap-3 rounded-[16px] border border-[#29302C] bg-[#121614] px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1D3B2A] text-[#70E39B]">
                      <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "h-2.5 w-2.5 rounded-full",
                            getWorkoutStatusDotClassName(workout.status),
                          ].join(" ")}
                        />

                        <span className="text-sm font-semibold text-white">
                          Treino{" "}
                          {workout.status === "ACTIVE"
                            ? "ativo"
                            : formatWorkoutStatus(workout.status).toLowerCase()}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#77827B]">
                        {getWorkoutStatusDescription(workout.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-5">
              <CreateWorkoutExerciseForm workoutId={parsedWorkoutId} />
            </div>

            {removeWorkoutExerciseMutation.isError && (
              <div
                role="alert"
                className="mt-5 rounded-[14px] border border-[#6A3434] bg-[#2B1919] px-4 py-3"
              >
                <p className="text-[13px] font-semibold text-[#FF8A8A]">
                  Erro ao remover exercício.
                </p>

                <p className="mt-1 text-[13px] text-[#FFB0B0]">
                  {removeWorkoutExerciseErrorMessage}
                </p>
              </div>
            )}

            {sortedWorkoutExercises.length === 0 && (
              <section className="mt-5 rounded-[22px] border border-dashed border-[#343B37] bg-[#151917] p-8 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
                  Sequência do treino
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Nenhum exercício vinculado
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#91A097]">
                  Use o formulário acima para adicionar exercícios a este treino
                  modelo. Depois disso, eles aparecerão organizados por ordem de
                  execução.
                </p>
              </section>
            )}

            {sortedWorkoutExercises.length > 0 && (
              <section className="mt-5 overflow-hidden rounded-[22px] border border-[#29302C] bg-[#171A18] shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-3 border-b border-[#29302C] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
                      Sequência do treino
                    </p>

                    <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-white">
                      Exercícios vinculados
                    </h2>

                    <p className="mt-2 text-sm text-[#91A097]">
                      Mostrando {sortedWorkoutExercises.length}{" "}
                      {sortedWorkoutExercises.length === 1
                        ? "exercício vinculado"
                        : "exercícios vinculados"}
                      .
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[#1C2B36] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8FC7FF]">
                    Ordenado por execução
                  </span>
                </div>

                <div className="divide-y divide-[#29302C]">
                  {sortedWorkoutExercises.map((workoutExercise) => (
                    <div
                      key={workoutExercise.id}
                      className="grid gap-4 px-5 py-5 transition hover:bg-[#1A1F1C] sm:px-7 lg:grid-cols-[auto_1fr_76px_96px_88px_96px_auto] lg:items-center"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202721] text-sm font-semibold text-[#C8D0CC]">
                        {workoutExercise.exerciseOrder}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {workoutExercise.exerciseName}
                        </h3>

                        <p className="mt-1 text-sm text-[#91A097]">
                          {workoutExercise.muscleGroup} •{" "}
                          {workoutExercise.equipmentName || "Sem equipamento"}
                        </p>

                        {workoutExercise.notes && (
                          <p className="mt-2 text-sm text-[#77827B]">
                            {workoutExercise.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase text-[#68736C]">
                          Séries
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {workoutExercise.sets}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase text-[#68736C]">
                          Repetições
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {workoutExercise.reps}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase text-[#68736C]">
                          Carga
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {formatRecommendedLoad(
                            workoutExercise.recommendedLoad,
                          )}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase text-[#68736C]">
                          Descanso
                        </p>
                        <p className="mt-1 font-semibold text-white">
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
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#5C3030] bg-[#2A1919] px-3 text-xs font-semibold text-[#FF8A8A] transition hover:border-[#FF7A7A]/70 hover:bg-[#3A2222] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                          {removeWorkoutExerciseMutation.isPending
                            ? "Removendo..."
                            : "Remover"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {workoutExerciseToRemove !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-workout-exercise-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelRemoveWorkoutExercise();
            }
          }}
        >
          <section className="w-full max-w-md rounded-[24px] border border-[#39413C] bg-[#171A18] p-6 text-white shadow-2xl shadow-black/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF8A8A]">
              Ação sensível
            </p>

            <h2
              id="remove-workout-exercise-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.04em]"
            >
              Remover exercício?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#91A097]">
              Este exercício será removido da sequência deste treino. O cadastro
              do exercício continuará disponível na biblioteca.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelRemoveWorkoutExercise}
                disabled={removeWorkoutExerciseMutation.isPending}
                className="h-12 rounded-xl border border-[#39413C] text-sm font-semibold text-[#EEF2EF] transition hover:bg-[#232825] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmRemoveWorkoutExercise}
                disabled={removeWorkoutExerciseMutation.isPending}
                className="h-12 rounded-xl bg-[#FF6B6B] text-sm font-semibold text-white transition hover:bg-[#FF7A7A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removeWorkoutExerciseMutation.isPending
                  ? "Removendo..."
                  : "Remover"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
