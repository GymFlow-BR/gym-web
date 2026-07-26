import { ArrowRight } from "lucide-react";

import { isApiError } from "../../../services/apiError";
import type { StudentCurrentWorkout } from "../../student-workout/types/studentWorkout";
import type { Workout } from "../../workouts/types/workout";
import { AssignWorkoutToStudentForm } from "./AssignWorkoutToStudentForm";

type Props = {
  studentId: number;
  currentWorkout?: StudentCurrentWorkout;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isAssigningWorkout: boolean;
  workoutSuccessMessage: string | null;
  activeWorkouts: Workout[];
  isWorkoutsLoading: boolean;
  onStartAssigningWorkout: () => void;
  onCancelAssigningWorkout: () => void;
  onAssignWorkoutSuccess: () => void | Promise<void>;
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

function isNotFound(error: unknown) {
  return isApiError(error) && error.status === 404;
}

export function StudentCurrentWorkoutCard({
  studentId,
  currentWorkout,
  isLoading,
  isError,
  error,
  isAssigningWorkout,
  workoutSuccessMessage,
  activeWorkouts,
  isWorkoutsLoading,
  onStartAssigningWorkout,
  onCancelAssigningWorkout,
  onAssignWorkoutSuccess,
}: Props) {
  const sortedExercises =
    currentWorkout?.exercises
      .slice()
      .sort((a, b) => a.exerciseOrder - b.exerciseOrder) ?? [];

  return (
    <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
            Treino atual
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
            Treino atribuído
          </h2>
        </div>
        {currentWorkout && !isAssigningWorkout && (
          <span className="inline-flex min-h-7 items-center rounded-full bg-[#183725] px-3 text-[10px] font-semibold uppercase text-[#70e39b]">
            {formatStatus(currentWorkout.status)}
          </span>
        )}
      </div>

      {workoutSuccessMessage && !isAssigningWorkout && (
        <p className="mt-5 rounded-xl border border-[#2f5b40] bg-[#20382a] px-4 py-3 text-sm text-[#70e39b]">
          {workoutSuccessMessage}
        </p>
      )}

      {isAssigningWorkout && (
        <div className="mt-6 rounded-2xl border border-[#303733] bg-[#1a1e1b] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89968f]">
            {currentWorkout ? "Troca de treino" : "Atribuição de treino"}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[#f5f7f5]">
            {currentWorkout ? "Trocar treino atual" : "Atribuir treino"}
          </h3>
          <p className="mt-2 text-sm text-[#89948e]">
            Selecione um treino ativo para este aluno.
          </p>
          <div className="mt-6">
            <AssignWorkoutToStudentForm
              studentId={studentId}
              activeWorkouts={activeWorkouts}
              currentWorkoutId={currentWorkout?.workoutId}
              isLoading={isWorkoutsLoading}
              onCancel={onCancelAssigningWorkout}
              onSuccess={onAssignWorkoutSuccess}
            />
          </div>
        </div>
      )}

      {isLoading && !isAssigningWorkout && (
        <p role="status" className="mt-6 text-sm text-[#89948e]">
          Carregando treino atual...
        </p>
      )}

      {!isLoading && !isAssigningWorkout && isError && isNotFound(error) && (
        <div className="mt-6 rounded-xl border border-dashed border-[#343b37] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-[#f5f7f5]">
            Nenhum treino atual
          </p>
          <p className="mt-2 text-xs text-[#89948e]">
            Este aluno ainda não possui um treino ativo.
          </p>
          <button
            type="button"
            onClick={onStartAssigningWorkout}
            className="mt-5 h-11 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13]"
          >
            Atribuir treino
          </button>
        </div>
      )}

      {!isLoading && !isAssigningWorkout && isError && !isNotFound(error) && (
        <p role="alert" className="mt-6 text-sm text-[#ff8c87]">
          Não foi possível carregar o treino atual.
        </p>
      )}

      {!isLoading && !isAssigningWorkout && currentWorkout && (
        <div className="mt-6">
          <div className="flex flex-col gap-5 rounded-2xl border border-[#2f5b40] bg-[#20382a] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#70e39b]">
                Nome do treino
              </p>
              <p className="mt-3 text-xl font-semibold text-[#f5f7f5]">
                {currentWorkout.workoutName}
              </p>
              <p className="mt-2 text-xs text-[#8fa098]">
                Atribuído em {formatDate(currentWorkout.assignedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onStartAssigningWorkout}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#a8b5ae] hover:text-[#70e39b]"
            >
              Trocar
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              ["Exercícios", String(currentWorkout.exercises.length)],
              ["Status", formatStatus(currentWorkout.status)],
              ["Atribuição", formatDate(currentWorkout.assignedAt)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[#303733] px-4 py-4 text-center"
              >
                <p className="text-[10px] uppercase text-[#748078]">{label}</p>
                <p className="mt-2 text-lg font-semibold text-[#f5f7f5]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {sortedExercises.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-[#343b37] p-6 text-center text-sm text-[#89948e]">
              Este treino ainda não possui exercícios.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-[#303733]">
              <div className="hidden grid-cols-[70px_minmax(200px,1fr)_100px_110px_110px] gap-4 border-b border-[#303733] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#748078] md:grid">
                <span>Ordem</span>
                <span>Exercício</span>
                <span className="text-center">Séries</span>
                <span className="text-center">Repetições</span>
                <span className="text-center">Descanso</span>
              </div>

              <div className="divide-y divide-[#303733]">
                {sortedExercises.map((exercise) => (
                  <div
                    key={exercise.workoutExerciseId}
                    className="grid gap-4 px-4 py-4 md:grid-cols-[70px_minmax(200px,1fr)_100px_110px_110px] md:items-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#20382a] text-xs font-semibold text-[#70e39b]">
                      {exercise.exerciseOrder}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#f5f7f5]">
                        {exercise.exerciseName}
                      </p>
                      <p className="mt-1 text-xs text-[#7f8a84]">
                        {exercise.muscleGroup ?? "Não informado"}
                        {exercise.equipmentName
                          ? ` • ${exercise.equipmentName}`
                          : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:contents">
                      <div>
                        <span className="text-[9px] uppercase text-[#748078] md:hidden">
                          Séries
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#f5f7f5] md:mt-0 md:text-center">
                          {exercise.sets}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#748078] md:hidden">
                          Repetições
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#f5f7f5] md:mt-0 md:text-center">
                          {exercise.reps}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#748078] md:hidden">
                          Descanso
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#f5f7f5] md:mt-0 md:text-center">
                          {exercise.restTimeSeconds
                            ? `${exercise.restTimeSeconds}s`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
