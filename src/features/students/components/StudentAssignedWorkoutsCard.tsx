import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  History,
} from "lucide-react";
import { useState } from "react";

import { isApiError } from "../../../services/apiError";
import { updateStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type {
  StudentWorkout,
  WeekDay,
} from "../../student-workout/types/studentWorkout";

type Props = {
  studentId: number;
  studentWorkouts: StudentWorkout[];
  isLoading: boolean;
  isError: boolean;
  onDeactivateSuccess: () => void | Promise<void>;
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
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "INACTIVE") return "Inativo";
  if (status === "ARCHIVED") return "Arquivado";
  return status;
}

function sortActiveWorkoutsByWeekDay(
  firstWorkout: StudentWorkout,
  secondWorkout: StudentWorkout,
) {
  return (
    weekDayOrder[firstWorkout.weekDay] - weekDayOrder[secondWorkout.weekDay]
  );
}

function sortHistoryByAssignedAt(
  firstWorkout: StudentWorkout,
  secondWorkout: StudentWorkout,
) {
  return (
    new Date(secondWorkout.assignedAt).getTime() -
    new Date(firstWorkout.assignedAt).getTime()
  );
}

export function StudentAssignedWorkoutsCard({
  studentId,
  studentWorkouts,
  isLoading,
  isError,
  onDeactivateSuccess,
}: Props) {
  const [workoutPendingDeactivation, setWorkoutPendingDeactivation] =
    useState<StudentWorkout | null>(null);

  const activeWeeklyWorkouts = studentWorkouts
    .filter((workout) => workout.status === "ACTIVE")
    .slice()
    .sort(sortActiveWorkoutsByWeekDay);

  const historicalWorkouts = studentWorkouts
    .filter((workout) => workout.status !== "ACTIVE")
    .slice()
    .sort(sortHistoryByAssignedAt);

  const deactivateWorkoutMutation = useMutation({
    mutationFn: (studentWorkoutId: number) =>
      updateStudentWorkout(studentId, studentWorkoutId, {
        status: "INACTIVE",
      }),
    onSuccess: async () => {
      setWorkoutPendingDeactivation(null);
      await onDeactivateSuccess();
    },
  });

  function handleRequestDeactivateWorkout(workout: StudentWorkout) {
    setWorkoutPendingDeactivation(workout);
  }

  function handleCancelDeactivateWorkout() {
    if (deactivateWorkoutMutation.isPending) {
      return;
    }

    setWorkoutPendingDeactivation(null);
  }

  function handleConfirmDeactivateWorkout() {
    if (!workoutPendingDeactivation) {
      return;
    }

    deactivateWorkoutMutation.mutate(
      workoutPendingDeactivation.studentWorkoutId,
    );
  }

  function getDeactivateWorkoutErrorMessage() {
    if (isApiError(deactivateWorkoutMutation.error)) {
      if (deactivateWorkoutMutation.error.status === 403) {
        return "Você não possui permissão para inativar este treino.";
      }

      if (deactivateWorkoutMutation.error.status === 404) {
        return "Treino atribuído não encontrado.";
      }

      if (deactivateWorkoutMutation.error.status === 400) {
        return "Não foi possível inativar este treino. Revise os dados e tente novamente.";
      }
    }

    return "Não foi possível inativar este treino. Tente novamente.";
  }

  return (
    <>
      <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
              Rotina semanal
            </p>

            <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
              Treinos do aluno
            </h2>

            <p className="mt-2 max-w-[560px] text-sm leading-6 text-[#89948e]">
              Acompanhe os treinos ativos da semana e consulte atribuições
              antigas no histórico.
            </p>
          </div>

          {!isLoading && !isError && (
            <span className="inline-flex min-h-8 w-fit items-center rounded-full border border-[#2f5b40] bg-[#20382a] px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#70e39b]">
              {activeWeeklyWorkouts.length} ativos
            </span>
          )}
        </div>

        {isLoading && (
          <p role="status" className="mt-6 text-sm text-[#89948e]">
            Carregando treinos atribuídos...
          </p>
        )}

        {isError && (
          <p role="alert" className="mt-6 text-sm text-[#ff8c87]">
            Não foi possível carregar os treinos atribuídos.
          </p>
        )}

        {!isLoading && !isError && studentWorkouts.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-[#343b37] px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#f5f7f5]">
              Nenhum treino na rotina
            </p>

            <p className="mt-1 text-xs leading-5 text-[#89948e]">
              Este aluno ainda não recebeu treinos para a semana.
            </p>
          </div>
        )}

        {!isLoading && !isError && studentWorkouts.length > 0 && (
          <div className="mt-6 space-y-7">
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d3828] text-[#70e39b]">
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-[#f5f7f5]">
                      Rotina ativa
                    </h3>
                    <p className="mt-0.5 text-xs text-[#7f8a84]">
                      Treinos que aparecem para o aluno durante a semana.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-[#89948e]">
                  {activeWeeklyWorkouts.length}/7 dias
                </span>
              </div>

              {activeWeeklyWorkouts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#343b37] px-5 py-6 text-center">
                  <p className="text-sm font-semibold text-[#f5f7f5]">
                    Nenhum treino ativo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#89948e]">
                    Atribua um treino e selecione o dia da semana para montar a
                    rotina do aluno.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeWeeklyWorkouts.map((workout) => (
                    <article
                      key={workout.studentWorkoutId}
                      className="rounded-xl border border-[#2f5b40] bg-[#19241d] px-4 py-4 transition hover:border-[#3f7652] hover:bg-[#1b2a20]"
                    >
                      <div className="flex h-full flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#70e39b] text-[10px] font-bold uppercase tracking-[0.06em] text-[#0d1b13]">
                              {weekDayShortLabels[workout.weekDay]}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#f5f7f5]">
                                {workout.workoutName}
                              </p>

                              <p className="mt-1 text-xs text-[#8fa098]">
                                {weekDayLabels[workout.weekDay]}
                              </p>

                              <p className="mt-2 line-clamp-1 text-xs text-[#7f8a84]">
                                Criado por {workout.teacherName}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex min-h-6 shrink-0 items-center rounded-full bg-[#183725] px-2.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-[#70e39b]">
                            Ativo
                          </span>
                        </div>

                        <div className="flex items-center justify-end border-t border-[#2f5b40]/60 pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleRequestDeactivateWorkout(workout)
                            }
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#3e4a43] px-3 text-xs font-semibold text-[#d7dcd9] transition hover:border-[#f2c97d] hover:bg-[#211d14] hover:text-[#f2c97d]"
                          >
                            Inativar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#29302c] pt-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#252a27] text-[#9aa29d]">
                    <History aria-hidden="true" className="h-4 w-4" />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-[#f5f7f5]">
                      Histórico
                    </h3>
                    <p className="mt-0.5 text-xs text-[#7f8a84]">
                      Atribuições inativas ou arquivadas.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-[#89948e]">
                  {historicalWorkouts.length}
                </span>
              </div>

              {historicalWorkouts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#303733] px-5 py-5 text-center">
                  <p className="text-xs text-[#89948e]">
                    Nenhum treino antigo por enquanto.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historicalWorkouts.map((workout) => (
                    <article
                      key={workout.studentWorkoutId}
                      className="rounded-xl border border-[#303733] bg-[#191c1a] px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#252a27] text-[#9aa29d]">
                            <CalendarDays
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#f5f7f5]">
                              {workout.workoutName}
                            </p>

                            <p className="mt-1 text-xs text-[#7f8a84]">
                              {weekDayLabels[workout.weekDay]} • Atribuído em{" "}
                              {formatDate(workout.assignedAt)}
                            </p>

                            <p className="mt-1 text-xs text-[#7f8a84]">
                              Criado por {workout.teacherName}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex min-h-7 w-fit items-center rounded-full bg-[#292c2a] px-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9aa29d]">
                          {formatStatus(workout.status)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {workoutPendingDeactivation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-student-workout-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050706]/80 px-4 backdrop-blur-[5px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deactivateWorkoutMutation.isPending
            ) {
              handleCancelDeactivateWorkout();
            }
          }}
        >
          <div className="w-full max-w-[460px] rounded-[26px] border border-[#39413c] bg-[#191c1a] p-6 text-center shadow-2xl shadow-black/40 sm:p-7">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#453b25] bg-[#211d14] text-[#f2c97d]">
              <AlertTriangle aria-hidden="true" className="h-6 w-6" />
            </div>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#f2c97d]">
              Inativar treino
            </p>

            <h2
              id="deactivate-student-workout-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#f5f7f5]"
            >
              Remover da rotina ativa?
            </h2>

            <p className="mx-auto mt-5 max-w-[360px] text-sm leading-6 text-[#a7b0aa]">
              O treino{" "}
              <strong className="font-semibold text-[#f5f7f5]">
                {workoutPendingDeactivation.workoutName}
              </strong>{" "}
              deixará de aparecer na rotina ativa de{" "}
              <strong className="font-semibold text-[#f5f7f5]">
                {weekDayLabels[workoutPendingDeactivation.weekDay]}
              </strong>
              .
            </p>

            <div className="mt-6 rounded-2xl border border-[#453b25] bg-[#211d14] px-4 py-4 text-left">
              <p className="text-xs font-semibold text-[#f2c97d]">Atenção</p>
              <p className="mt-1 text-xs leading-5 text-[#b9a57d]">
                A atribuição não será apagada. Ela será movida para o histórico
                como treino inativo.
              </p>
            </div>

            {deactivateWorkoutMutation.isError && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3 text-xs text-[#ff8c87]"
              >
                {getDeactivateWorkoutErrorMessage()}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCancelDeactivateWorkout}
                disabled={deactivateWorkoutMutation.isPending}
                className="h-11 w-full rounded-xl border border-[#39413c] px-5 text-sm font-semibold text-[#f5f7f5] transition hover:bg-[#222724] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[135px]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivateWorkout}
                disabled={deactivateWorkoutMutation.isPending}
                className="h-11 w-full rounded-xl border border-[#633a3a] bg-[#251918] px-5 text-sm font-semibold text-[#ff8c87] transition hover:bg-[#2d1d1b] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[155px]"
              >
                {deactivateWorkoutMutation.isPending
                  ? "Inativando..."
                  : "Inativar treino"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
