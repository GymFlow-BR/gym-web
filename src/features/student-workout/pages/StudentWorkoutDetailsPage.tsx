import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Dumbbell, ListTodo } from "lucide-react";
import { Link, useParams } from "react-router";

import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { StudentWorkoutCompletionCard } from "../components/StudentWorkoutCompletionCard";
import { StudentWorkoutExerciseCard } from "../components/StudentWorkoutExerciseCard";
import {
  completeSpecificStudentWorkoutExercise,
  getStudentWorkoutDetails,
  getStudentWorkoutProgress,
  uncompleteSpecificStudentWorkoutExercise,
} from "../services/studentWorkoutService";
import type { WeekDay } from "../types/studentWorkout";

const weekDayLabels: Record<WeekDay, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function formatAssignedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function StudentWorkoutDetailsPage() {
  const queryClient = useQueryClient();
  const params = useParams();

  const studentWorkoutId = Number(params.studentWorkoutId);

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

  const hasInvalidStudentWorkoutId =
    !Number.isFinite(studentWorkoutId) || studentWorkoutId <= 0;

  const {
    data: studentWorkoutDetails,
    isLoading: isLoadingStudentWorkoutDetails,
    isError: isStudentWorkoutDetailsError,
  } = useQuery({
    queryKey: ["student-workout-details", studentId, studentWorkoutId],
    queryFn: () => getStudentWorkoutDetails(studentId!, studentWorkoutId),
    enabled: Boolean(studentId) && !hasInvalidStudentWorkoutId,
    retry: false,
  });

  const {
    data: workoutProgress,
    isLoading: isLoadingWorkoutProgress,
    isError: isWorkoutProgressError,
  } = useQuery({
    queryKey: ["student-workout-progress", studentId, studentWorkoutId],
    queryFn: () => getStudentWorkoutProgress(studentId!, studentWorkoutId),
    enabled:
      Boolean(studentId) &&
      !hasInvalidStudentWorkoutId &&
      Boolean(studentWorkoutDetails),
    retry: false,
  });

  const completeExerciseMutation = useMutation({
    mutationFn: (workoutExerciseId: number) =>
      completeSpecificStudentWorkoutExercise(
        studentId!,
        studentWorkoutId,
        workoutExerciseId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-workout-progress", studentId, studentWorkoutId],
      });
    },
    onSettled: () => {
      setUpdatingWorkoutExerciseId(null);
    },
  });

  const uncompleteExerciseMutation = useMutation({
    mutationFn: (workoutExerciseId: number) =>
      uncompleteSpecificStudentWorkoutExercise(
        studentId!,
        studentWorkoutId,
        workoutExerciseId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-workout-progress", studentId, studentWorkoutId],
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

  const workoutExercises = studentWorkoutDetails?.exercises;

  const sortedExercises = useMemo(() => {
    if (!workoutExercises) {
      return [];
    }

    return [...workoutExercises].sort(
      (first, second) => first.exerciseOrder - second.exerciseOrder,
    );
  }, [workoutExercises]);

  const progressPercentage = workoutProgress?.progressPercentage ?? 0;
  const completedExercises = workoutProgress?.completedExercises ?? 0;
  const totalExercises =
    workoutProgress?.totalExercises ?? sortedExercises.length;
  const pendingExercises = Math.max(totalExercises - completedExercises, 0);

  const isWorkoutCompleted = totalExercises > 0 && progressPercentage === 100;

  function getExerciseProgress(workoutExerciseId: number) {
    return workoutProgress?.exercises.find(
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

  const isLoading =
    isLoadingAuthenticatedUser ||
    isLoadingStudentWorkoutDetails ||
    isLoadingWorkoutProgress;

  const hasToggleExerciseError =
    completeExerciseMutation.isError || uncompleteExerciseMutation.isError;

  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 shadow-xl shadow-black/10"
      >
        <p className="text-sm font-semibold text-[#f5f7f5]">
          Carregando seu treino
        </p>

        <p className="mt-2 text-sm leading-6 text-[#8fa098]">
          Estamos buscando os detalhes, exercícios e progresso salvo.
        </p>

        <div className="mt-6 space-y-3">
          <div className="h-4 w-2/3 rounded-full bg-[#1d241f]" />
          <div className="h-3 w-full rounded-full bg-[#1d241f]" />
          <div className="h-3 w-5/6 rounded-full bg-[#1d241f]" />
        </div>
      </div>
    );
  }

  if (isAuthenticatedUserError) {
    return (
      <Card>
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4"
        >
          <p className="text-sm font-semibold text-red-200">
            Não foi possível identificar o aluno autenticado.
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Faça login novamente para acessar este treino.
          </p>
        </div>
      </Card>
    );
  }

  if (authenticatedUser?.role !== "STUDENT") {
    return (
      <Card>
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold text-yellow-100">
            Esta área é exclusiva para alunos.
          </p>

          <p className="mt-2 text-sm leading-6 text-yellow-100/80">
            Acesse com uma conta de aluno para visualizar seus treinos.
          </p>
        </div>
      </Card>
    );
  }

  if (
    hasInvalidStudentWorkoutId ||
    isStudentWorkoutDetailsError ||
    !studentWorkoutDetails
  ) {
    return (
      <div className="space-y-5">
        <Link
          to="/student/workouts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8fa098] transition hover:text-[#70e39b]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para treinos
        </Link>

        <Card>
          <div
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4"
          >
            <p className="text-sm font-semibold text-red-200">
              Não foi possível abrir este treino.
            </p>

            <p className="mt-2 text-sm leading-6 text-red-100/80">
              Ele pode estar inativo, removido ou não fazer parte da sua rotina
              atual.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <Link
        to="/student/workouts"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8fa098] transition hover:text-[#70e39b]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar para treinos
      </Link>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa098]">
          {weekDayLabels[studentWorkoutDetails.weekDay]}
        </p>

        <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
          {studentWorkoutDetails.workoutName}
        </h1>
      </section>

      <section className="relative overflow-hidden rounded-[26px] border border-[#2e4b38] bg-[#111611] p-5 shadow-2xl shadow-black/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[34px] border-[#1d3828]/45"
        />

        <div className="relative">
          <span className="inline-flex h-8 items-center rounded-full bg-[#1d3828] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#70e39b]">
            Treino da semana
          </span>

          <h2 className="mt-6 text-[29px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
            {studentWorkoutDetails.workoutName}
          </h2>

          <div className="mt-4 space-y-1">
            <p className="text-sm leading-6 text-[#9aa39d]">
              Criado por {studentWorkoutDetails.teacherName}
            </p>

            <p className="text-xs leading-5 text-[#7f8a84]">
              Atribuído em{" "}
              {formatAssignedDate(studentWorkoutDetails.assignedAt)}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#c5ccc8]">
            <span className="inline-flex items-center gap-2">
              <Dumbbell aria-hidden="true" className="h-4 w-4 text-[#70e39b]" />
              {totalExercises}{" "}
              {totalExercises === 1 ? "exercício" : "exercícios"}
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

      {isWorkoutCompleted && (
        <StudentWorkoutCompletionCard
          completedExercises={completedExercises}
          totalExercises={totalExercises}
          studentName={authenticatedUser.name}
        />
      )}

      {restFinishedExerciseName && (
        <div className="rounded-2xl border border-[#9FC5AE]/20 bg-[#16221B] p-4 shadow-lg shadow-black/10">
          <p className="text-sm font-semibold text-[#9FC5AE]">
            Descanso finalizado
          </p>

          <p className="mt-1 text-sm text-[#C9C3B8]">
            O descanso de {restFinishedExerciseName} terminou. Você pode seguir
            para a próxima série ou para o próximo exercício.
          </p>
        </div>
      )}

      {hasToggleExerciseError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 shadow-lg shadow-black/10"
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

      {isWorkoutProgressError && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 shadow-lg shadow-black/10">
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

      {sortedExercises.length === 0 && (
        <div className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center shadow-xl shadow-black/10">
          <p className="text-sm font-semibold text-[#f5f7f5]">
            Treino em preparação
          </p>

          <p className="mt-2 text-sm leading-6 text-[#8fa098]">
            Este treino já faz parte da sua rotina, mas ainda não possui
            exercícios cadastrados.
          </p>

          <p className="mt-3 text-sm leading-6 text-[#7f8a84]">
            Fale com seu professor para confirmar quando a montagem for
            finalizada.
          </p>
        </div>
      )}

      {sortedExercises.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
                Exercícios
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
                Sequência do treino
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
                  isCurrentWorkoutProgressError={isWorkoutProgressError}
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
    </div>
  );
}
