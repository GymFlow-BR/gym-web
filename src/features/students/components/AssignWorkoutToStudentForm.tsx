import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type { Workout } from "../../workouts/types/workout";

const schema = z.object({
  workoutId: z.number().min(1, "Selecione um treino."),
});

type FormData = z.infer<typeof schema>;

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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { workoutId: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createStudentWorkout(studentId, { workoutId: data.workoutId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout", studentId],
      });
      await queryClient.invalidateQueries({ queryKey: ["student-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await onSuccess();
    },
  });

  function getErrorMessage() {
    if (isApiError(mutation.error)) {
      if (mutation.error.status === 403)
        return "Você não possui permissão para atribuir treinos.";
      if (mutation.error.status === 404)
        return "Aluno ou treino não encontrado.";
      if (mutation.error.status === 409)
        return "Este aluno já possui esse treino atribuído.";
      if (mutation.error.status === 400)
        return "Revise o treino selecionado e tente novamente.";
    }
    return "Não foi possível atribuir o treino. Tente novamente.";
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
    >
      {mutation.isError && (
        <p
          role="alert"
          className="rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3 text-xs text-[#ff8c87]"
        >
          {getErrorMessage()}
        </p>
      )}

      <div>
        <label
          htmlFor="workoutId"
          className="mb-2 block text-xs font-medium text-[#d7dcd9]"
        >
          Treino
        </label>
        <select
          id="workoutId"
          disabled={
            isLoading || activeWorkouts.length === 0 || mutation.isPending
          }
          className="h-12 w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:cursor-not-allowed disabled:opacity-50"
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
          <p className="mt-2 text-xs text-[#ff7f79]">
            {errors.workoutId.message}
          </p>
        )}
        {!isLoading && activeWorkouts.length === 0 && (
          <p className="mt-2 text-xs text-[#89948e]">
            Nenhum treino ativo disponível.
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[#303733] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="h-11 rounded-xl border border-[#39413c] px-5 text-sm font-semibold text-[#f5f7f5] transition hover:bg-[#222724] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            isLoading || activeWorkouts.length === 0 || mutation.isPending
          }
          className="h-11 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] disabled:opacity-50"
        >
          {mutation.isPending ? "Salvando..." : "Salvar treino"}
        </button>
      </div>
    </form>
  );
}
