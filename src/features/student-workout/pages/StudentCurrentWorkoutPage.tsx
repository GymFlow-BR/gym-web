import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  completeStudentWorkoutExercise,
  getStudentCurrentWorkout,
  getStudentCurrentWorkoutProgress,
  uncompleteStudentWorkoutExercise,
} from "../services/studentWorkoutService";
import { RestTimer } from "../components/RestTimer";
import { StudentWorkoutSummaryCard } from "../components/StudentWorkoutSummaryCard";
import { StudentWorkoutProgressCard } from "../components/StudentWorkoutProgressCard";
import { StudentWorkoutCompletionCard } from "../components/StudentWorkoutCompletionCard";

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
  const pendingExercises = Math.max(totalExercises - completedExercises, 0);

  const isWorkoutCompleted = totalExercises > 0 && progressPercentage === 100;

  const progressMessage = getProgressMessage(
    progressPercentage,
    totalExercises,
  );

  function getWorkoutStatusLabel(
    progressPercentage: number,
    totalExercises: number,
  ) {
    if (totalExercises === 0) {
      return "Aguardando exercícios";
    }

    if (progressPercentage === 100) {
      return "Concluído";
    }

    if (progressPercentage === 0) {
      return "Não iniciado";
    }

    return "Em andamento";
  }

  const workoutStatusLabel = getWorkoutStatusLabel(
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

  function getNextPendingWorkoutExerciseId() {
    if (isWorkoutCompleted) {
      return null;
    }

    const nextPendingExercise = sortedExercises.find((exercise) => {
      const exerciseProgress = getExerciseProgress(exercise.workoutExerciseId);

      return !exerciseProgress?.completed;
    });

    return nextPendingExercise?.workoutExerciseId ?? null;
  }

  const nextPendingWorkoutExerciseId = getNextPendingWorkoutExerciseId();

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
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [restFinishedExerciseName]);

  const hasToggleExerciseError =
    completeExerciseMutation.isError || uncompleteExerciseMutation.isError;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#16221B] p-5 shadow-lg shadow-black/10">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#F6F4EF]">
              Carregando seu treino
            </p>

            <p className="mt-1 text-sm text-[#C9C3B8]">
              Estamos buscando seu treino atual e o progresso salvo.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded-full bg-white/10" />
            <div className="h-3 w-full rounded-full bg-white/10" />
            <div className="h-3 w-5/6 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticatedUserError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 shadow-lg shadow-black/10">
        <p className="text-sm font-semibold text-red-200">
          Não foi possível identificar o aluno autenticado.
        </p>

        <p className="mt-1 text-sm text-red-100/80">
          Faça login novamente para acessar seu treino atual.
        </p>
      </div>
    );
  }

  if (authenticatedUser?.role !== "STUDENT") {
    return (
      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 shadow-lg shadow-black/10">
        <p className="text-sm font-semibold text-yellow-100">
          Esta área é exclusiva para alunos.
        </p>

        <p className="mt-1 text-sm text-yellow-100/80">
          Acesse com uma conta de aluno para visualizar o treino atual.
        </p>
      </div>
    );
  }

  if (isCurrentWorkoutError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#16221B] p-5 text-center shadow-lg shadow-black/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA89F]">
          Treino atual
        </p>

        <p className="mt-2 text-lg font-semibold text-[#F6F4EF]">
          Nenhum treino disponível no momento
        </p>

        <p className="mt-2 text-sm text-[#C9C3B8]">
          Seu professor ainda não atribuiu um treino ativo para você.
        </p>

        <p className="mt-3 text-sm text-[#9CA89F]">
          Quando um treino for liberado, ele aparecerá automaticamente nesta
          tela para você acompanhar os exercícios.
        </p>
      </div>
    );
  }

  if (!currentWorkout) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#16221B] p-5 shadow-lg shadow-black/10">
        <p className="text-sm text-[#C9C3B8]">
          Nenhum treino atual disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#C9C3B8]">Treino atual</p>

            <h2 className="mt-1 text-2xl font-bold text-[#F6F4EF]">
              {currentWorkout.workoutName}
            </h2>
          </div>

          <span className="rounded-full border border-[#9FC5AE]/20 bg-[#9FC5AE]/10 px-3 py-1 text-xs font-semibold text-[#9FC5AE]">
            Ativo
          </span>
        </div>

        <StudentWorkoutSummaryCard
          totalExercises={totalExercises}
          completedExercises={completedExercises}
          pendingExercises={pendingExercises}
          progressPercentage={progressPercentage}
          statusLabel={workoutStatusLabel}
        />

        <StudentWorkoutProgressCard
          progressPercentage={progressPercentage}
          completedExercises={completedExercises}
          totalExercises={totalExercises}
          progressMessage={progressMessage}
        />

        {isWorkoutCompleted && (
          <StudentWorkoutCompletionCard
            completedExercises={completedExercises}
            totalExercises={totalExercises}
            studentName={authenticatedUser.name}
          />
        )}

        {restFinishedExerciseName && (
          <div className="mt-5 rounded-2xl border border-[#9FC5AE]/20 bg-[#16221B] p-4 shadow-lg shadow-black/10">
            <p className="text-sm font-semibold text-[#9FC5AE]">
              Descanso finalizado
            </p>

            <p className="mt-1 text-sm text-[#C9C3B8]">
              O descanso de {restFinishedExerciseName} terminou. Você pode
              seguir para a próxima série ou para o próximo exercício.
            </p>
          </div>
        )}

        {hasToggleExerciseError && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 shadow-lg shadow-black/10">
            <p className="text-sm font-semibold text-red-200">
              Não foi possível salvar sua alteração.
            </p>

            <p className="mt-1 text-sm text-red-100/80">
              O exercício não foi marcado ou desmarcado. Verifique sua conexão e
              tente novamente.
            </p>
          </div>
        )}

        {isCurrentWorkoutProgressError && (
          <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 shadow-lg shadow-black/10">
            <p className="text-sm font-semibold text-yellow-100">
              Progresso temporariamente indisponível
            </p>

            <p className="mt-1 text-sm text-yellow-100/80">
              Você ainda pode visualizar os exercícios do treino. Caso marque ou
              desmarque algum exercício agora, tente conferir o progresso
              novamente em alguns instantes.
            </p>
          </div>
        )}
      </section>

      {sortedExercises.length === 0 && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#16221B] p-5 text-center shadow-lg shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA89F]">
            Treino em preparação
          </p>

          <p className="mt-2 text-lg font-semibold text-[#F6F4EF]">
            Seu treino ainda não possui exercícios
          </p>

          <p className="mt-2 text-sm text-[#C9C3B8]">
            O treino já foi atribuído ao seu perfil, mas os exercícios ainda não
            foram adicionados.
          </p>

          <p className="mt-3 text-sm text-[#9CA89F]">
            Fale com seu professor para confirmar quando a montagem do treino
            for finalizada.
          </p>
        </div>
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
            const isNextPendingExercise =
              nextPendingWorkoutExerciseId === exercise.workoutExerciseId;

            return (
              <div
                key={exercise.workoutExerciseId}
                className={[
                  "rounded-2xl border p-4 shadow-sm transition",
                  isCompleted
                    ? "border-[#9FC5AE]/20 bg-[#101A14]/85 text-[#F6F4EF]"
                    : isNextPendingExercise
                      ? "border-[#9FC5AE]/50 bg-[#16221B] text-[#F6F4EF] shadow-md ring-2 ring-[#9FC5AE]/10"
                      : "border-white/10 bg-[#16221B] text-[#F6F4EF]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#F6F4EF]">
                        {exercise.exerciseOrder}. {exercise.exerciseName}
                      </p>

                      {isNextPendingExercise && (
                        <span className="rounded-full bg-[#2F4F3E] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Próximo
                        </span>
                      )}

                      {isCompleted && (
                        <span className="rounded-full border border-[#9FC5AE]/30 bg-[#9FC5AE]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#D8F3E0]">
                          Concluído
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#C9C3B8]">
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
                      "flex shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                      isCompleted
                        ? "border-[#9FC5AE]/30 bg-[#2F4F3E] text-[#F6F4EF]"
                        : "border-[#9FC5AE]/30 bg-[#9FC5AE]/10 text-[#D8F3E0] hover:bg-[#9FC5AE]/15",
                    ].join(" ")}
                    aria-label={
                      isUpdatingThisExercise
                        ? "Salvando alteração do exercício"
                        : isCompleted
                          ? "Desmarcar exercício como concluído"
                          : "Marcar exercício como concluído"
                    }
                  >
                    {isUpdatingThisExercise
                      ? "Salvando..."
                      : isCompleted
                        ? "Feito"
                        : "Marcar"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                    <p className="text-xs font-semibold text-[#9CA89F]">
                      Séries
                    </p>
                    <p className="mt-1 text-base font-bold text-[#F6F4EF]">
                      {exercise.sets}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                    <p className="text-xs font-semibold text-[#9CA89F]">
                      Repetições
                    </p>
                    <p className="mt-1 text-base font-bold text-[#F6F4EF]">
                      {exercise.reps}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                    <p className="text-xs font-semibold text-[#9CA89F]">
                      Carga
                    </p>
                    <p className="mt-1 text-base font-bold text-[#F6F4EF]">
                      {formatRecommendedLoad(exercise.recommendedLoad)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                    <p className="text-xs font-semibold text-[#9CA89F]">
                      Descanso
                    </p>
                    <p className="mt-1 text-base font-bold text-[#F6F4EF]">
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
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleExerciseDetails(exercise.workoutExerciseId)
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#F6F4EF]"
                    >
                      <span>
                        {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                      </span>

                      <span
                        className={[
                          "text-xs transition-transform",
                          isExpanded ? "rotate-180" : "rotate-0",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {exercise.description && (
                          <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                            <p className="text-xs font-semibold text-[#9CA89F]">
                              Descrição
                            </p>

                            <p className="mt-1 text-sm text-[#F6F4EF]">
                              {exercise.description}
                            </p>
                          </div>
                        )}

                        {exercise.notes && (
                          <div className="rounded-2xl border border-white/10 bg-[#1D2B23] p-3">
                            <p className="text-xs font-semibold text-[#9CA89F]">
                              Observações
                            </p>

                            <p className="mt-1 text-sm text-[#C9C3B8]">
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
                                className="rounded-full border border-[#9FC5AE]/30 bg-[#9FC5AE]/10 px-3 py-1 text-xs font-semibold text-[#D8F3E0] transition hover:bg-[#9FC5AE]/15"
                              >
                                Ver imagem
                              </a>
                            )}

                            {exercise.videoUrl && (
                              <a
                                href={exercise.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#9FC5AE]/30 bg-[#9FC5AE]/10 px-3 py-1 text-xs font-semibold text-[#D8F3E0] transition hover:bg-[#9FC5AE]/15"
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
    </>
  );
}
