import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  getStudentCurrentWorkout,
  getStudentWorkouts,
} from "../services/studentWorkoutService";
import type {
  StudentWorkout,
  StudentWorkoutStatus,
  WeekDay,
} from "../types/studentWorkout";

const statusLabels: Record<StudentWorkoutStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado",
};

const weekDayLabels: Record<WeekDay, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const weekDayShortLabels: Record<WeekDay, string> = {
  MONDAY: "SEG",
  TUESDAY: "TER",
  WEDNESDAY: "QUA",
  THURSDAY: "QUI",
  FRIDAY: "SEX",
  SATURDAY: "SÁB",
  SUNDAY: "DOM",
};

const weekDayOrder: Record<WeekDay, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusClassName(status: StudentWorkoutStatus) {
  if (status === "ACTIVE") {
    return "border-[#70e39b]/25 bg-[#1d3828] text-[#70e39b]";
  }

  if (status === "ARCHIVED") {
    return "border-[#4b5563]/35 bg-[#1f2937]/50 text-[#cbd5e1]";
  }

  return "border-[#3a423d] bg-[#171d19] text-[#8f9b94]";
}

function sortByWeekDay(
  firstWorkout: StudentWorkout,
  secondWorkout: StudentWorkout,
) {
  return (
    weekDayOrder[firstWorkout.weekDay] - weekDayOrder[secondWorkout.weekDay]
  );
}

export function StudentWorkoutsPage() {
  const {
    data: authenticatedUser,
    isLoading: isLoadingAuthenticatedUser,
    isError: isAuthenticatedUserError,
  } = useAuthenticatedUser();

  const studentId = authenticatedUser?.userId;

  const currentWorkoutQuery = useQuery({
    queryKey: ["student-current-workout", studentId],
    queryFn: () => getStudentCurrentWorkout(studentId!),
    enabled: Boolean(studentId),
    retry: false,
  });

  const studentWorkoutsQuery = useQuery({
    queryKey: ["student-workouts", studentId],
    queryFn: () => getStudentWorkouts(studentId!),
    enabled: Boolean(studentId),
  });

  const isLoading =
    isLoadingAuthenticatedUser ||
    currentWorkoutQuery.isLoading ||
    studentWorkoutsQuery.isLoading;

  const isError = isAuthenticatedUserError || studentWorkoutsQuery.isError;

  const assignedWorkouts =
    studentWorkoutsQuery.data
      ?.slice()
      .sort(
        (firstWorkout, secondWorkout) =>
          new Date(secondWorkout.assignedAt).getTime() -
          new Date(firstWorkout.assignedAt).getTime(),
      ) ?? [];

  const activeWeeklyWorkouts = assignedWorkouts
    .filter((workout) => workout.status === "ACTIVE")
    .sort(sortByWeekDay);

  const historicalWorkouts = assignedWorkouts.filter(
    (workout) => workout.status !== "ACTIVE",
  );

  const currentWorkout = currentWorkoutQuery.data;

  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 shadow-xl shadow-black/10"
      >
        <p className="text-sm font-semibold text-[#f5f7f5]">
          Carregando seus treinos
        </p>

        <p className="mt-2 text-sm leading-6 text-[#8fa098]">
          Estamos buscando seus treinos atribuídos.
        </p>

        <div className="mt-6 space-y-3">
          <div className="h-4 w-2/3 rounded-full bg-[#1d241f]" />
          <div className="h-3 w-full rounded-full bg-[#1d241f]" />
          <div className="h-3 w-5/6 rounded-full bg-[#1d241f]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4"
        >
          <p className="text-sm font-semibold text-red-200">
            Não foi possível carregar seus treinos.
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Recarregue a página ou faça login novamente.
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

  return (
    <div className="space-y-7">
      <header className="pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa098]">
          Seus treinos
        </p>

        <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
          Rotina da semana
        </h1>

        <p className="mt-4 max-w-[320px] text-sm leading-6 text-[#9ca8a1]">
          Veja os treinos ativos preparados para a sua semana e acompanhe seu
          histórico de atribuições.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
              Semana atual
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
              Treinos ativos
            </h2>
          </div>

          <p className="text-xs font-medium text-[#8fa098]">
            {activeWeeklyWorkouts.length}
          </p>
        </div>

        {activeWeeklyWorkouts.length === 0 ? (
          <div className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center shadow-xl shadow-black/10">
            <p className="text-sm font-semibold text-[#f5f7f5]">
              Nenhum treino ativo na semana
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8fa098]">
              Quando seu professor atribuir treinos ativos para a sua rotina,
              eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeWeeklyWorkouts.map((workout) => {
              const isTodayWorkout =
                currentWorkout?.studentWorkoutId === workout.studentWorkoutId;

              return (
                <Link
                  key={workout.studentWorkoutId}
                  to={`/student/workouts/${workout.studentWorkoutId}`}
                  className={[
                    "group flex items-center gap-4 rounded-[24px] border p-4 shadow-xl shadow-black/10 transition duration-200",
                    isTodayWorkout
                      ? "border-[#70e39b]/35 bg-[#142019]"
                      : "border-[#26322b] bg-[#111914] hover:-translate-y-0.5 hover:border-[#3b4a41] hover:bg-[#141a16]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[11px] font-bold uppercase tracking-[0.06em]",
                      isTodayWorkout
                        ? "bg-[#70e39b] text-[#0d1b13]"
                        : "bg-[#1d3828] text-[#70e39b]",
                    ].join(" ")}
                  >
                    {weekDayShortLabels[workout.weekDay]}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-[#f5f7f5]">
                        {workout.workoutName}
                      </h3>

                      {isTodayWorkout && (
                        <span className="rounded-full border border-[#70e39b]/25 bg-[#1d3828] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#70e39b]">
                          Hoje
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#8fa098]">
                      {weekDayLabels[workout.weekDay]}
                    </p>

                    <p className="mt-1 text-xs text-[#7f8a84]">
                      Criado por {workout.teacherName}
                    </p>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[#7f8a84] transition group-hover:translate-x-1 group-hover:text-[#70e39b]"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
              Atribuições
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
              Histórico
            </h2>
          </div>

          <p className="text-xs font-medium text-[#8fa098]">
            {historicalWorkouts.length}
          </p>
        </div>

        {historicalWorkouts.length === 0 ? (
          <div className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center shadow-xl shadow-black/10">
            <p className="text-sm font-semibold text-[#f5f7f5]">
              Nenhum treino antigo
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8fa098]">
              Treinos inativos ou arquivados aparecerão aqui quando existirem.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historicalWorkouts.map((workout) => (
              <article
                key={workout.studentWorkoutId}
                className="rounded-[22px] border border-[#26322b] bg-[#111914] px-4 py-3.5 shadow-xl shadow-black/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1d3828] text-[#70e39b]">
                        {workout.status === "ACTIVE" ? (
                          <CheckCircle2
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        ) : (
                          <CalendarDays
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold leading-tight text-[#f5f7f5]">
                            {workout.workoutName}
                          </h3>
                        </div>

                        <div className="mt-1.5 flex flex-col gap-0.5">
                          <p className="text-xs leading-5 text-[#7f8a84]">
                            Criado por {workout.teacherName}
                          </p>

                          <p className="text-xs leading-5 text-[#8fa098]">
                            Atribuído em {formatDate(workout.assignedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                      getStatusClassName(workout.status),
                    ].join(" ")}
                  >
                    {statusLabels[workout.status]}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
