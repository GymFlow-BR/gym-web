import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  completeStudentWorkoutExercise,
  getStudentCurrentWorkout,
  getStudentCurrentWorkoutProgress,
  uncompleteStudentWorkoutExercise,
} from "../services/studentWorkoutService";
import { RestTimer } from "../components/RestTimer";

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

function getProgressMessage(
  progressPercentage: number,
  totalExercises: number,
) {
  if (totalExercises === 0) {
    return "Seu treino ainda não possui exercícios cadastrados.";
  }

  if (progressPercentage === 0) {
    return "Comece pelo primeiro exercício quando estiver pronto.";
  }

  if (progressPercentage === 100) {
    return "Todos os exercícios foram concluídos.";
  }

  return "Continue no seu ritmo. Seu progresso está sendo salvo.";
}

function getWorkoutActionLabel(
  progressPercentage: number,
  totalExercises: number,
) {
  if (totalExercises === 0) {
    return "Aguardando exercícios";
  }

  if (progressPercentage === 100) {
    return "Treino concluído";
  }

  if (progressPercentage === 0) {
    return "Começar treino";
  }

  return "Continuar treino";
}

export function StudentCurrentWorkoutPage() {
  const queryClient = useQueryClient();

  const [updatingWorkoutExerciseId, setUpdatingWorkoutExerciseId] = useState<
    number | null
  >(null);

  const [expandedWorkoutExerciseIds, setExpandedWorkoutExerciseIds] = useState<
    number[]
  >([]);

  const [activeRestWorkoutExerciseId, setActiveRestWorkoutExerciseId] =
    useState<number | null>(null);

  const [remainingRestSeconds, setRemainingRestSeconds] = useState<
    number | null
  >(null);

  const [restFinishedExerciseName, setRestFinishedExerciseName] = useState<
    string | null
  >(null);

  const [isRestTimerPaused, setIsRestTimerPaused] = useState(false);

  const {
    data: authenticatedUser,
    isLoading: isLoadingAuthenticatedUser,
    isError: isAuthenticatedUserError,
  } = useAuthenticatedUser();

  const studentId = authenticatedUser?.userId;

  const {
    data: currentWorkout,
    isLoading: isLoadingCurrentWorkout,
    isError: isCurrentWorkoutError,
  } = useQuery({
    queryKey: ["student-current-workout", studentId],
    queryFn: () => getStudentCurrentWorkout(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  const {
    data: currentWorkoutProgress,
    isLoading: isLoadingCurrentWorkoutProgress,
    isError: isCurrentWorkoutProgressError,
  } = useQuery({
    queryKey: ["student-current-workout-progress", studentId],
    queryFn: () => getStudentCurrentWorkoutProgress(studentId!),
    enabled: !!studentId && !!currentWorkout,
    retry: false,
  });

  const completeExerciseMutation = useMutation({
    mutationFn: (workoutExerciseId: number) =>
      completeStudentWorkoutExercise(studentId!, workoutExerciseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout-progress", studentId],
      });
    },
    onSettled: () => {
      setUpdatingWorkoutExerciseId(null);
    },
  });

  const uncompleteExerciseMutation = useMutation({
    mutationFn: (workoutExerciseId: number) =>
      uncompleteStudentWorkoutExercise(studentId!, workoutExerciseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout-progress", studentId],
      });
    },
    onSettled: () => {
      setUpdatingWorkoutExerciseId(null);
    },
  });

  function handleToggleExerciseCompletion(
    workoutExerciseId: number,
    completed: boolean,
  ) {
    setUpdatingWorkoutExerciseId(workoutExerciseId);

    if (completed) {
      uncompleteExerciseMutation.mutate(workoutExerciseId);
      return;
    }

    completeExerciseMutation.mutate(workoutExerciseId);
  }

  function handleToggleExerciseDetails(workoutExerciseId: number) {
    setExpandedWorkoutExerciseIds((currentIds) => {
      if (currentIds.includes(workoutExerciseId)) {
        return currentIds.filter((id) => id !== workoutExerciseId);
      }

      return [...currentIds, workoutExerciseId];
    });
  }

  function handleStartRestTimer(
    workoutExerciseId: number,
    restTimeSeconds: number,
  ) {
    setRestFinishedExerciseName(null);
    setIsRestTimerPaused(false);
    setActiveRestWorkoutExerciseId(workoutExerciseId);
    setRemainingRestSeconds(restTimeSeconds);
  }

  function handleCancelRestTimer() {
    setActiveRestWorkoutExerciseId(null);
    setRemainingRestSeconds(null);
    setRestFinishedExerciseName(null);
    setIsRestTimerPaused(false);
  }

  function handlePauseRestTimer() {
    setIsRestTimerPaused(true);
  }

  function handleResumeRestTimer() {
    setIsRestTimerPaused(false);
  }

  const isLoading =
    isLoadingAuthenticatedUser ||
    isLoadingCurrentWorkout ||
    isLoadingCurrentWorkoutProgress;

  const workoutExercises = currentWorkout?.exercises;

  const sortedExercises = useMemo(() => {
    if (!workoutExercises) {
      return [];
    }

    return [...workoutExercises].sort(
      (first, second) => first.exerciseOrder - second.exerciseOrder,
    );
  }, [workoutExercises]);

  const progressPercentage = currentWorkoutProgress?.progressPercentage ?? 0;
  const completedExercises = currentWorkoutProgress?.completedExercises ?? 0;
  const totalExercises =
    currentWorkoutProgress?.totalExercises ?? sortedExercises.length;

  const isWorkoutCompleted = totalExercises > 0 && progressPercentage === 100;

  const progressMessage = getProgressMessage(
    progressPercentage,
    totalExercises,
  );

  const workoutActionLabel = getWorkoutActionLabel(
    progressPercentage,
    totalExercises,
  );

  function getExerciseProgress(workoutExerciseId: number) {
    return currentWorkoutProgress?.exercises.find(
      (exercise) => exercise.workoutExerciseId === workoutExerciseId,
    );
  }

  function hasExerciseDetails(exercise: {
    description: string | null;
    notes: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
  }) {
    return Boolean(
      exercise.description ||
      exercise.notes ||
      exercise.imageUrl ||
      exercise.videoUrl,
    );
  }

  useEffect(() => {
    if (remainingRestSeconds === null || isRestTimerPaused) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingRestSeconds((currentSeconds) => {
        if (currentSeconds === null) {
          return null;
        }

        if (currentSeconds <= 1) {
          const finishedExercise = sortedExercises.find(
            (exercise) =>
              exercise.workoutExerciseId === activeRestWorkoutExerciseId,
          );

          setRestFinishedExerciseName(
            finishedExercise?.exerciseName ?? "exercício",
          );
          setActiveRestWorkoutExerciseId(null);
          setIsRestTimerPaused(false);

          return null;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeRestWorkoutExerciseId,
    isRestTimerPaused,
    remainingRestSeconds,
    sortedExercises,
  ]);

  useEffect(() => {
    if (!restFinishedExerciseName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRestFinishedExerciseName(null);
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [restFinishedExerciseName]);

  const hasToggleExerciseError =
    completeExerciseMutation.isError || uncompleteExerciseMutation.isError;

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#1F1F1F]">
              Carregando seu treino
            </p>

            <p className="mt-1 text-sm text-[#6F6A62]">
              Estamos buscando seu treino atual e o progresso salvo.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded-full bg-[#EDEAE3]" />
            <div className="h-3 w-full rounded-full bg-[#EDEAE3]" />
            <div className="h-3 w-5/6 rounded-full bg-[#EDEAE3]" />
          </div>
        </div>
      </Card>
    );
  }

  if (isAuthenticatedUserError) {
    return (
      <Card>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Não foi possível identificar o aluno autenticado.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Faça login novamente para acessar seu treino atual.
          </p>
        </div>
      </Card>
    );
  }

  if (authenticatedUser?.role !== "STUDENT") {
    return (
      <Card>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">
            Esta área é exclusiva para alunos.
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            Acesse com uma conta de aluno para visualizar o treino atual.
          </p>
        </div>
      </Card>
    );
  }

  if (isCurrentWorkoutError) {
    return (
      <Card>
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
            Treino atual
          </p>

          <p className="mt-2 text-lg font-semibold text-[#1F1F1F]">
            Nenhum treino disponível no momento
          </p>

          <p className="mt-2 text-sm text-[#6F6A62]">
            Seu professor ainda não atribuiu um treino ativo para você.
          </p>

          <p className="mt-3 text-sm text-[#8A8378]">
            Quando um treino for liberado, ele aparecerá automaticamente nesta
            tela para você acompanhar os exercícios.
          </p>
        </div>
      </Card>
    );
  }

  if (!currentWorkout) {
    return (
      <Card>
        <p className="text-sm text-[#6F6A62]">
          Nenhum treino atual disponível no momento.
        </p>
      </Card>
    );
  }

  return (
    <>
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#6F6A62]">Treino atual</p>

            <h2 className="mt-1 text-2xl font-bold text-[#1F1F1F]">
              {currentWorkout.workoutName}
            </h2>

            <p className="text-sm font-medium text-[#2F4F3E]">
              {sortedExercises.length} exercício
              {sortedExercises.length === 1 ? "" : "s"} no treino
            </p>
          </div>

          <span className="rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
            Ativo
          </span>
        </div>

        <Card className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6F6A62]">Progresso do treino</span>
            <span className="font-semibold text-[#1F1F1F]">
              {progressPercentage}%
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[#EDEAE3]">
            <div
              className="h-2 rounded-full bg-[#2F4F3E]"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-[#6F6A62]">
            {completedExercises} de {totalExercises} exercícios concluídos
          </p>

          <p className="mt-2 text-sm font-medium text-[#2F4F3E]">
            {progressMessage}
          </p>
        </Card>

        {isWorkoutCompleted && (
          <Card className="mt-5">
            <div className="rounded-2xl border border-[#2F4F3E]/20 bg-[#2F4F3E]/10 p-5">
              <p className="text-sm font-semibold text-[#2F4F3E]">
                Treino concluído
              </p>

              <h3 className="mt-2 text-xl font-bold text-[#1F1F1F]">
                Parabéns, você concluiu seu treino!
              </h3>

              <p className="mt-2 text-sm text-[#6F6A62]">
                Você finalizou todos os exercícios planejados para este treino.
              </p>

              <div className="mt-4 rounded-2xl bg-[#FFFEFB] p-4">
                <p className="text-xs font-semibold text-[#8A8378]">
                  Resumo do treino
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {completedExercises} de {totalExercises} exercícios concluídos
                </p>

                <p className="mt-1 text-xs text-[#6F6A62]">
                  Continue acompanhando seus treinos com consistência para
                  evoluir.
                </p>
              </div>
            </div>
          </Card>
        )}

        {restFinishedExerciseName && (
          <Card className="mt-5">
            <div className="rounded-2xl border border-[#2F4F3E]/20 bg-[#2F4F3E]/10 p-4">
              <p className="text-sm font-semibold text-[#2F4F3E]">
                Descanso finalizado
              </p>

              <p className="mt-1 text-sm text-[#6F6A62]">
                O descanso de {restFinishedExerciseName} terminou. Você pode
                seguir para a próxima série ou para o próximo exercício.
              </p>
            </div>
          </Card>
        )}

        {hasToggleExerciseError && (
          <Card className="mt-5">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Não foi possível atualizar o exercício.
              </p>

              <p className="mt-1 text-sm text-red-600">
                Tente novamente em alguns instantes.
              </p>
            </div>
          </Card>
        )}

        {isCurrentWorkoutProgressError && (
          <Card className="mt-5">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-800">
                Progresso temporariamente indisponível
              </p>

              <p className="mt-1 text-sm text-yellow-700">
                Você ainda pode visualizar os exercícios do treino. Caso marque
                ou desmarque algum exercício agora, tente conferir o progresso
                novamente em alguns instantes.
              </p>
            </div>
          </Card>
        )}
      </section>

      {sortedExercises.length === 0 && (
        <Card className="mt-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              Treino em preparação
            </p>

            <p className="mt-2 text-lg font-semibold text-[#1F1F1F]">
              Seu treino ainda não possui exercícios
            </p>

            <p className="mt-2 text-sm text-[#6F6A62]">
              O treino já foi atribuído ao seu perfil, mas os exercícios ainda
              não foram adicionados.
            </p>

            <p className="mt-3 text-sm text-[#8A8378]">
              Fale com seu professor para confirmar quando a montagem do treino
              for finalizada.
            </p>
          </div>
        </Card>
      )}

      {sortedExercises.length > 0 && (
        <div className="mt-5 space-y-3">
          {sortedExercises.map((exercise) => {
            const exerciseProgress = getExerciseProgress(
              exercise.workoutExerciseId,
            );
            const isCompleted = exerciseProgress?.completed ?? false;
            const isUpdatingThisExercise =
              updatingWorkoutExerciseId === exercise.workoutExerciseId;
            const isExpanded = expandedWorkoutExerciseIds.includes(
              exercise.workoutExerciseId,
            );
            const exerciseHasDetails = hasExerciseDetails(exercise);
            const isRestActiveForThisExercise =
              activeRestWorkoutExerciseId === exercise.workoutExerciseId &&
              remainingRestSeconds !== null;

            return (
              <div
                key={exercise.workoutExerciseId}
                className={[
                  "rounded-2xl border p-4 text-[#1F1F1F] shadow-sm transition",
                  isCompleted
                    ? "border-[#2F4F3E]/40 bg-[#2F4F3E]/10"
                    : "border-[#E4DFD6] bg-[#FFFEFB]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {exercise.exerciseOrder}. {exercise.exerciseName}
                    </p>

                    <p className="mt-1 text-xs text-[#6F6A62]">
                      {exercise.muscleGroup || "Grupo muscular não informado"} •{" "}
                      {exercise.equipmentName || "Sem equipamento"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleExerciseCompletion(
                        exercise.workoutExerciseId,
                        isCompleted,
                      )
                    }
                    disabled={
                      isUpdatingThisExercise || isCurrentWorkoutProgressError
                    }
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                      isCompleted
                        ? "border-[#2F4F3E] bg-[#2F4F3E] text-white"
                        : "border-[#B7B2A8] text-[#6F6A62]",
                    ].join(" ")}
                    aria-label={
                      isCompleted
                        ? "Desmarcar exercício como concluído"
                        : "Marcar exercício como concluído"
                    }
                  >
                    {isUpdatingThisExercise ? "..." : isCompleted ? "✓" : ""}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#FAF9F6] p-3">
                    <p className="text-xs text-[#8A8378]">Séries</p>
                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {exercise.sets}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] p-3">
                    <p className="text-xs text-[#8A8378]">Repetições</p>
                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {exercise.reps}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] p-3">
                    <p className="text-xs text-[#8A8378]">Carga</p>
                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {formatRecommendedLoad(exercise.recommendedLoad)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] p-3">
                    <p className="text-xs text-[#8A8378]">Descanso</p>
                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {formatRestTime(exercise.restTimeSeconds)}
                    </p>
                  </div>
                </div>

                {exercise.restTimeSeconds !== null &&
                  exercise.restTimeSeconds > 0 && (
                    <RestTimer
                      restTimeSeconds={exercise.restTimeSeconds}
                      remainingRestSeconds={remainingRestSeconds}
                      isActive={isRestActiveForThisExercise}
                      isPaused={isRestTimerPaused}
                      onStart={() =>
                        handleStartRestTimer(
                          exercise.workoutExerciseId,
                          exercise.restTimeSeconds!,
                        )
                      }
                      onPause={handlePauseRestTimer}
                      onResume={handleResumeRestTimer}
                      onCancel={handleCancelRestTimer}
                    />
                  )}

                {exerciseHasDetails && (
                  <div className="mt-4 border-t border-[#EDEAE3] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleExerciseDetails(exercise.workoutExerciseId)
                      }
                      className="text-sm font-semibold text-[#2F4F3E]"
                    >
                      {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {exercise.description && (
                          <div className="rounded-2xl bg-[#FAF9F6] p-3">
                            <p className="text-xs font-semibold text-[#8A8378]">
                              Descrição
                            </p>

                            <p className="mt-1 text-sm text-[#6F6A62]">
                              {exercise.description}
                            </p>
                          </div>
                        )}

                        {exercise.notes && (
                          <div className="rounded-2xl bg-[#FAF9F6] p-3">
                            <p className="text-xs font-semibold text-[#8A8378]">
                              Observações
                            </p>

                            <p className="mt-1 text-sm text-[#6F6A62]">
                              {exercise.notes}
                            </p>
                          </div>
                        )}

                        {(exercise.imageUrl || exercise.videoUrl) && (
                          <div className="flex flex-wrap gap-2">
                            {exercise.imageUrl && (
                              <a
                                href={exercise.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-1 text-xs font-semibold text-[#2F4F3E]"
                              >
                                Ver imagem
                              </a>
                            )}

                            {exercise.videoUrl && (
                              <a
                                href={exercise.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-1 text-xs font-semibold text-[#2F4F3E]"
                              >
                                Ver vídeo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        className="mt-5"
        fullWidth
        disabled={sortedExercises.length === 0 || isWorkoutCompleted}
      >
        {isWorkoutCompleted ? "Treino concluído" : workoutActionLabel}
      </Button>
    </>
  );
}
