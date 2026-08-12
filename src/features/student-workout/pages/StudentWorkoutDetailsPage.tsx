import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Link, useParams } from "react-router";

import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  getStudentWorkoutById,
  getStudentWorkoutProgress,
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function StudentWorkoutDetailsPage() {
  const params = useParams();
  const studentWorkoutId = Number(params.studentWorkoutId);

  const {
    data: authenticatedUser,
    isLoading: isLoadingAuthenticatedUser,
    isError: isAuthenticatedUserError,
  } = useAuthenticatedUser();

  const studentId = authenticatedUser?.userId;

  const hasInvalidStudentWorkoutId =
    !Number.isFinite(studentWorkoutId) || studentWorkoutId <= 0;

  const studentWorkoutQuery = useQuery({
    queryKey: ["student-workout", studentId, studentWorkoutId],
    queryFn: () => getStudentWorkoutById(studentId!, studentWorkoutId),
    enabled: Boolean(studentId) && !hasInvalidStudentWorkoutId,
    retry: false,
  });

  const workoutProgressQuery = useQuery({
    queryKey: ["student-workout-progress", studentId, studentWorkoutId],
    queryFn: () => getStudentWorkoutProgress(studentId!, studentWorkoutId),
    enabled: Boolean(studentId) && !hasInvalidStudentWorkoutId,
    retry: false,
  });

  const studentWorkout = studentWorkoutQuery.data;
  const workoutProgress = workoutProgressQuery.data;

  const isLoading =
    isLoadingAuthenticatedUser ||
    studentWorkoutQuery.isLoading ||
    workoutProgressQuery.isLoading;

  const isError =
    isAuthenticatedUserError ||
    studentWorkoutQuery.isError ||
    workoutProgressQuery.isError ||
    hasInvalidStudentWorkoutId;

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[#f5f7f5]">
          Carregando treino
        </p>
        <p className="mt-2 text-sm leading-6 text-[#8fa098]">
          Estamos buscando os detalhes deste treino.
        </p>
      </Card>
    );
  }

  if (isError || !studentWorkout || !workoutProgress) {
    return (
      <div className="space-y-5">
        <Link
          to="/student/workouts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8fa098] hover:text-[#70e39b]"
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
              Não foi possível carregar este treino.
            </p>
            <p className="mt-2 text-sm leading-6 text-red-100/80">
              O treino pode estar inativo, removido ou não pertencer ao seu
              perfil.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const completedExercises = workoutProgress.completedExercises;
  const totalExercises = workoutProgress.totalExercises;
  const progressPercentage = workoutProgress.progressPercentage;

  return (
    <div className="space-y-7">
      <Link
        to="/student/workouts"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8fa098] hover:text-[#70e39b]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar para treinos
      </Link>

      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa098]">
          Treino da semana
        </p>

        <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
          {studentWorkout.workoutName}
        </h1>

        <p className="mt-4 max-w-[320px] text-sm leading-6 text-[#9ca8a1]">
          {weekDayLabels[studentWorkout.weekDay]} • Criado por{" "}
          {studentWorkout.teacherName}
        </p>
      </header>

      <section className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 shadow-xl shadow-black/10">
        <span className="inline-flex min-h-8 items-center rounded-full bg-[#1d3828] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#70e39b]">
          {weekDayLabels[studentWorkout.weekDay]}
        </span>

        <h2 className="mt-6 text-[28px] font-semibold leading-none tracking-[-0.05em] text-[#f5f7f5]">
          {studentWorkout.workoutName}
        </h2>

        <p className="mt-4 text-sm leading-6 text-[#9aa39d]">
          Atribuído em {formatDate(studentWorkout.assignedAt)}
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9aa39d]">
              {completedExercises} de {totalExercises} concluídos
            </span>
            <span className="font-semibold text-[#70e39b]">
              {progressPercentage}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#26322b]">
            <div
              className="h-full rounded-full bg-[#70e39b]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
              Exercícios
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
              Progresso do treino
            </h2>
          </div>

          <p className="text-xs font-medium text-[#8fa098]">
            {completedExercises}/{totalExercises}
          </p>
        </div>

        {workoutProgress.exercises.length === 0 ? (
          <div className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center">
            <p className="text-sm font-semibold text-[#f5f7f5]">
              Nenhum exercício cadastrado
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8fa098]">
              Este treino ainda não possui exercícios.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutProgress.exercises.map((exercise) => (
              <article
                key={exercise.workoutExerciseId}
                className={[
                  "flex items-center gap-4 rounded-[24px] border p-4 shadow-xl shadow-black/10",
                  exercise.completed
                    ? "border-[#2f5b40] bg-[#142019]/80 opacity-75"
                    : "border-[#26322b] bg-[#111914]",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    exercise.completed
                      ? "bg-[#1d3828] text-[#70e39b]"
                      : "bg-[#1b211d] text-[#8fa098]",
                  ].join(" ")}
                >
                  {exercise.completed ? (
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Circle aria-hidden="true" className="h-5 w-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[#f5f7f5]">
                    {exercise.exerciseName}
                  </p>

                  <p className="mt-1 text-xs text-[#8fa098]">
                    Ordem {exercise.exerciseOrder}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                    exercise.completed
                      ? "border-[#70e39b]/25 bg-[#1d3828] text-[#70e39b]"
                      : "border-[#3a423d] bg-[#171d19] text-[#8f9b94]",
                  ].join(" ")}
                >
                  {exercise.completed ? "Concluído" : "Pendente"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
