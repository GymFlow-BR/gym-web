import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type { Workout } from "../../workouts/types/workout";

const assignWorkoutToStudentSchema = z.object({
  workoutId: z.number().min(1, "Selecione um treino."),
});

type AssignWorkoutToStudentFormData = z.infer<
  typeof assignWorkoutToStudentSchema
>;

type AssignWorkoutToStudentFormProps = {
  studentId: number;
  activeWorkouts: Workout[];
  currentWorkoutId?: number;
  isLoading: boolean;
  onCancel: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignWorkoutToStudentForm({
  studentId,
  activeWorkouts,
  currentWorkoutId,
  isLoading,
  onCancel,
  onSuccess,
}: AssignWorkoutToStudentFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignWorkoutToStudentFormData>({
    resolver: zodResolver(assignWorkoutToStudentSchema),
    defaultValues: {
      workoutId: 0,
    },
  });

  const assignWorkoutMutation = useMutation({
    mutationFn: (data: AssignWorkoutToStudentFormData) =>
      createStudentWorkout(studentId, {
        workoutId: data.workoutId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout", studentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["student-workouts"],
      });

      await onSuccess();
    },
  });

  const hasActiveWorkouts = activeWorkouts.length > 0;

  function handleAssignWorkout(data: AssignWorkoutToStudentFormData) {
    assignWorkoutMutation.mutate(data);
  }

  function getAssignWorkoutErrorMessage() {
    if (!assignWorkoutMutation.error) {
      return null;
    }

    if (isApiError(assignWorkoutMutation.error)) {
      if (assignWorkoutMutation.error.status === 403) {
        return "Você não possui permissão para atribuir treinos.";
      }

      if (assignWorkoutMutation.error.status === 404) {
        return "Aluno ou treino não encontrado.";
      }

      if (assignWorkoutMutation.error.status === 409) {
        return "Este aluno já possui esse treino atribuído. Escolha outro treino.";
      }

      if (assignWorkoutMutation.error.status === 400) {
        return "Revise o treino selecionado e tente novamente.";
      }
    }

    return "Não foi possível atribuir o treino. Tente novamente.";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleAssignWorkout)}>
      {assignWorkoutMutation.isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao atribuir treino.
          </p>
          <p className="mt-1 text-sm text-red-600">
            {getAssignWorkoutErrorMessage()}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="workoutId"
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          Treino
        </label>

        <select
          id="workoutId"
          className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
          disabled={
            isLoading || !hasActiveWorkouts || assignWorkoutMutation.isPending
          }
          {...register("workoutId", { valueAsNumber: true })}
        >
          <option value={0}>Selecione um treino</option>

          {activeWorkouts.map((workout) => (
            <option key={workout.workoutId} value={workout.workoutId}>
              {workout.workoutName}
              {workout.workoutId === currentWorkoutId ? " (atual)" : ""}
            </option>
          ))}
        </select>

        {errors.workoutId && (
          <p className="mt-2 text-sm text-red-600">
            {errors.workoutId.message}
          </p>
        )}

        {!isLoading && !hasActiveWorkouts && (
          <p className="mt-2 text-sm text-[#6F6A62]">
            Nenhum treino ativo disponível para atribuição.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E4DFD6] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={assignWorkoutMutation.isPending}
          className="flex h-11 items-center justify-center rounded-2xl border border-[#D8D2C8] bg-[#FFFEFB] px-5 text-sm font-semibold text-[#2F4F3E] transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            isLoading || !hasActiveWorkouts || assignWorkoutMutation.isPending
          }
          className="flex h-11 items-center justify-center rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assignWorkoutMutation.isPending ? "Salvando..." : "Salvar treino"}
        </button>
      </div>
    </form>
  );
}
