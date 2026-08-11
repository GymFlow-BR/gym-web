import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  completeStudentWorkoutExercise,
  getStudentCurrentWorkout,
  getStudentCurrentWorkoutProgress,
  uncompleteStudentWorkoutExercise,
} from "../services/studentWorkoutService";
import { StudentWorkoutCompletionCard } from "../components/StudentWorkoutCompletionCard";
import { StudentWorkoutGreeting } from "../components/StudentWorkoutGreeting";
import { StudentWorkoutTodayCard } from "../components/StudentWorkoutTodayCard";
import { StudentWorkoutExerciseCard } from "../components/StudentWorkoutExerciseCard";

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

  function getExerciseProgress(workoutExerciseId: number) {
    return currentWorkoutProgress?.exercises.find(
      (exercise) => exercise.workoutExerciseId === workoutExerciseId,
    );
  }

  function getPendingWorkoutExerciseIds() {
    if (isWorkoutCompleted) {
      return [];
    }

    return sortedExercises
      .filter((exercise) => {
        const exerciseProgress = getExerciseProgress(
          exercise.workoutExerciseId,
        );

        return !exerciseProgress?.completed;
      })
      .map((exercise) => exercise.workoutExerciseId);
  }

  const pendingWorkoutExerciseIds = getPendingWorkoutExerciseIds();
  const startWorkoutExerciseId = pendingWorkoutExerciseIds[0] ?? null;
  const nextWorkoutExerciseId = pendingWorkoutExerciseIds[1] ?? null;

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
      <div
        role="status"
        className="rounded-2xl border border-white/10 bg-[#16221B] p-5 shadow-lg shadow-black/10"
      >
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
      <Card>
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
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
        <StudentWorkoutGreeting studentName={authenticatedUser.name} />

        <StudentWorkoutTodayCard
          workoutName={currentWorkout.workoutName}
          assignedAt={currentWorkout.assignedAt}
          totalExercises={totalExercises}
          completedExercises={completedExercises}
          pendingExercises={pendingExercises}
          progressPercentage={progressPercentage}
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
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 shadow-lg shadow-black/10"
          >
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
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
                Exercícios
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
                Sua sequência de hoje
              </h2>
            </div>

            <p className="text-xs font-medium text-[#8fa098]">
              {completedExercises}/{totalExercises}
            </p>
          </div>

          <div className="space-y-3">
            {sortedExercises.map((exercise) => {
              const exerciseProgress = getExerciseProgress(
                exercise.workoutExerciseId,
              );

              const isUpdatingThisExercise =
                updatingWorkoutExerciseId === exercise.workoutExerciseId;

              const isExpanded = expandedWorkoutExerciseIds.includes(
                exercise.workoutExerciseId,
              );

              const exerciseSequenceTag = exerciseProgress?.completed
                ? "COMPLETED"
                : startWorkoutExerciseId === exercise.workoutExerciseId
                  ? "START"
                  : nextWorkoutExerciseId === exercise.workoutExerciseId
                    ? "NEXT"
                    : null;

              return (
                <StudentWorkoutExerciseCard
                  key={exercise.workoutExerciseId}
                  exercise={exercise}
                  exerciseProgress={exerciseProgress}
                  exerciseSequenceTag={exerciseSequenceTag}
                  isExpanded={isExpanded}
                  isUpdating={isUpdatingThisExercise}
                  isCurrentWorkoutProgressError={isCurrentWorkoutProgressError}
                  activeRestWorkoutExerciseId={activeRestWorkoutExerciseId}
                  remainingRestSeconds={remainingRestSeconds}
                  isRestTimerPaused={isRestTimerPaused}
                  onToggleCompletion={handleToggleExerciseCompletion}
                  onToggleDetails={handleToggleExerciseDetails}
                  onStartRestTimer={handleStartRestTimer}
                  onPauseRestTimer={handlePauseRestTimer}
                  onResumeRestTimer={handleResumeRestTimer}
                  onCancelRestTimer={handleCancelRestTimer}
                />
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
