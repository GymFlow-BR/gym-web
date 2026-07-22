import { Card } from "../../../components/ui/Card";
import { isApiError } from "../../../services/apiError";
import { AssignWorkoutToStudentForm } from "./AssignWorkoutToStudentForm";
import type { StudentCurrentWorkout } from "../../student-workout/types/studentWorkout";
import type { Workout } from "../../workouts/types/workout";

type StudentCurrentWorkoutCardProps = {
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
  if (status === "ACTIVE") {
    return "Ativo";
  }

  if (status === "INACTIVE") {
    return "Inativo";
  }

  if (status === "ARCHIVED") {
    return "Arquivado";
  }

  return status;
}

function isCurrentWorkoutNotFound(error: unknown) {
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
}: StudentCurrentWorkoutCardProps) {
  return (
    <Card>
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Treino atual
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Treino atribuído
        </h2>

        <p className="text-sm text-[#6F6A62]">
          Acompanhe o treino atual deste aluno.
        </p>
      </div>

      {workoutSuccessMessage && !isAssigningWorkout && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            {workoutSuccessMessage}
          </p>
        </div>
      )}

      {isAssigningWorkout && (
        <div className="mb-5 rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-5">
          <div className="mb-5 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              {currentWorkout ? "Troca de treino" : "Atribuição de treino"}
            </p>

            <h3 className="text-base font-semibold text-[#1F1F1F]">
              {currentWorkout ? "Trocar treino atual" : "Atribuir treino"}
            </h3>

            <p className="text-sm text-[#6F6A62]">
              Selecione um treino ativo para este aluno.
            </p>
          </div>

          <AssignWorkoutToStudentForm
            studentId={studentId}
            activeWorkouts={activeWorkouts}
            currentWorkoutId={currentWorkout?.workoutId}
            isLoading={isWorkoutsLoading}
            onCancel={onCancelAssigningWorkout}
            onSuccess={onAssignWorkoutSuccess}
          />
        </div>
      )}

      {isLoading && !isAssigningWorkout && (
        <div
          role="status"
          className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
        >
          <p className="text-sm text-[#6F6A62]">Carregando treino atual...</p>
        </div>
      )}

      {!isLoading &&
        !isAssigningWorkout &&
        isError &&
        isCurrentWorkoutNotFound(error) && (
          <div className="rounded-3xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F0E8] text-lg font-bold text-[#2F4F3E]">
              —
            </div>

            <p className="text-sm font-semibold text-[#1F1F1F]">
              Nenhum treino atual
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6F6A62]">
              Este aluno ainda não possui um treino ativo atribuído.
            </p>

            <button
              type="button"
              onClick={onStartAssigningWorkout}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-[#D8D2C8] bg-[#FFFEFB] px-4 text-sm font-semibold text-[#2F4F3E] transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
            >
              Atribuir treino
            </button>
          </div>
        )}

      {!isLoading &&
        !isAssigningWorkout &&
        isError &&
        !isCurrentWorkoutNotFound(error) && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Erro ao carregar treino.
            </p>
            <p className="mt-1 text-sm text-red-600">
              Não foi possível carregar o treino atual do aluno. Tente
              novamente.
            </p>
          </div>
        )}

      {!isLoading && !isAssigningWorkout && currentWorkout && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Nome do treino
                </p>

                <p className="mt-1 text-xl font-semibold text-[#1F1F1F]">
                  {currentWorkout.workoutName}
                </p>

                <p className="mt-2 text-sm text-[#6F6A62]">
                  Atribuído em {formatDate(currentWorkout.assignedAt)}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {formatStatus(currentWorkout.status)}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Exercícios
                </p>
                <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                  {currentWorkout.exercises.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Status
                </p>
                <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                  {formatStatus(currentWorkout.status)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Atribuição
                </p>
                <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                  {formatDate(currentWorkout.assignedAt)}
                </p>
              </div>
            </div>
          </div>

          {currentWorkout.exercises.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Treino sem exercícios
              </p>
              <p className="mt-1 text-sm text-[#6F6A62]">
                Este treino ainda não possui exercícios vinculados.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E4DFD6]">
              <div className="grid bg-[#FAF9F6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8A8378] md:grid-cols-[64px_minmax(220px,1fr)_120px_120px_120px] md:gap-x-6">
                <span className="text-center">Ordem</span>
                <span>Exercício</span>
                <span className="hidden text-center md:block">Séries</span>
                <span className="hidden text-center md:block">Reps</span>
                <span className="hidden text-center md:block">Descanso</span>
              </div>

              <div className="divide-y divide-[#E4DFD6]">
                {currentWorkout.exercises
                  .slice()
                  .sort(
                    (firstExercise, secondExercise) =>
                      firstExercise.exerciseOrder -
                      secondExercise.exerciseOrder,
                  )
                  .map((exercise) => (
                    <div
                      key={exercise.workoutExerciseId}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[64px_minmax(220px,1fr)_120px_120px_120px] md:items-center md:gap-x-6"
                    >
                      <div className="flex justify-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2F4F3E] text-sm font-semibold text-white">
                          {exercise.exerciseOrder}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-[#1F1F1F]">
                          {exercise.exerciseName}
                        </p>

                        <p className="mt-1 text-sm text-[#6F6A62]">
                          {exercise.muscleGroup ??
                            "Grupo muscular não informado"}
                          {exercise.equipmentName
                            ? ` • ${exercise.equipmentName}`
                            : ""}
                        </p>

                        {exercise.notes && (
                          <p className="mt-2 text-sm text-[#8A8378]">
                            {exercise.notes}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs md:hidden">
                          <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                            {exercise.sets} séries
                          </span>
                          <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                            {exercise.reps} reps
                          </span>
                          <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                            {exercise.restTimeSeconds
                              ? `${exercise.restTimeSeconds}s`
                              : "Sem descanso"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                        {exercise.sets}
                      </div>

                      <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                        {exercise.reps}
                      </div>

                      <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                        {exercise.restTimeSeconds
                          ? `${exercise.restTimeSeconds}s`
                          : "-"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
