import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CheckCircle2, Dumbbell } from "lucide-react";
import { Link } from "react-router";

import { Card } from "../../../components/ui/Card";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  getStudentCurrentWorkout,
  getStudentWorkouts,
} from "../services/studentWorkoutService";
import type { StudentWorkoutStatus } from "../types/studentWorkout";

const statusLabels: Record<StudentWorkoutStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado",
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

  const isError =
    isAuthenticatedUserError ||
    (currentWorkoutQuery.isError && studentWorkoutsQuery.isError);

  const assignedWorkouts =
    studentWorkoutsQuery.data
      ?.slice()
      .sort(
        (firstWorkout, secondWorkout) =>
          new Date(secondWorkout.assignedAt).getTime() -
          new Date(firstWorkout.assignedAt).getTime(),
      ) ?? [];

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
    <div className="space-y-6">
      <header className="pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa098]">
          Seus treinos
        </p>

        <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
          Treinos
        </h1>

        <p className="mt-4 max-w-[320px] text-sm leading-6 text-[#9ca8a1]">
          Consulte o treino ativo e os treinos que já foram atribuídos ao seu
          perfil.
        </p>
      </header>

      {currentWorkout ? (
        <section className="overflow-hidden rounded-[26px] border border-[#70e39b]/35 bg-[#142019] shadow-2xl shadow-black/20">
          <div className="border-b border-[#26322b] bg-[#172a1f] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#70e39b] text-[#0d1b13]">
                <Dumbbell aria-hidden="true" className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70e39b]">
                  Treino ativo
                </p>

                <h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.04em] text-[#f5f7f5]">
                  {currentWorkout.workoutName}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#26322b] bg-[#0d130f] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
                  Exercícios
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#f5f7f5]">
                  {currentWorkout.exercises.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#26322b] bg-[#0d130f] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
                  Status
                </p>

                <p className="mt-3 inline-flex rounded-full border border-[#70e39b]/25 bg-[#1d3828] px-3 py-1 text-xs font-bold text-[#70e39b]">
                  Ativo
                </p>
              </div>
            </div>

            <Link
              to="/student/current-workout"
              className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#70e39b] text-sm font-bold text-[#0d1b13] transition hover:bg-[#83e8a8]"
            >
              Abrir treino de hoje
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center shadow-xl shadow-black/10">
          <p className="text-sm font-semibold text-[#f5f7f5]">
            Nenhum treino ativo
          </p>

          <p className="mt-2 text-sm leading-6 text-[#8fa098]">
            Quando seu professor atribuir um treino ativo, ele aparecerá aqui.
          </p>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa098]">
              Atribuições
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
              Histórico simples
            </h2>
          </div>

          <p className="text-xs font-medium text-[#8fa098]">
            {assignedWorkouts.length}
          </p>
        </div>

        {assignedWorkouts.length === 0 ? (
          <div className="rounded-[26px] border border-[#26322b] bg-[#111914] p-5 text-center shadow-xl shadow-black/10">
            <p className="text-sm font-semibold text-[#f5f7f5]">
              Nenhum treino atribuído
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8fa098]">
              Seus treinos atribuídos aparecerão nesta lista.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedWorkouts.map((workout) => (
              <article
                key={workout.studentWorkoutId}
                className="rounded-[24px] border border-[#26322b] bg-[#111914] p-4 shadow-xl shadow-black/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1d3828] text-[#70e39b]">
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

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#f5f7f5]">
                          {workout.workoutName}
                        </h3>

                        <p className="mt-1 text-xs text-[#8fa098]">
                          Atribuído em {formatDate(workout.assignedAt)}
                        </p>
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
