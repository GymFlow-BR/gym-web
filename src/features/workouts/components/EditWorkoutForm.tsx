import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { updateWorkout } from "../services/workoutService";
import type { UpdateWorkoutRequest, Workout } from "../types/workout";

const workoutStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

const editWorkoutSchema = z.object({
  workoutName: z
    .string()
    .trim()
    .min(1, "O nome do treino é obrigatório.")
    .min(2, "O nome do treino deve ter pelo menos 2 caracteres.")
    .max(120, "O nome do treino deve ter no máximo 120 caracteres."),
  status: workoutStatusSchema,
});

type EditWorkoutFormData = z.infer<typeof editWorkoutSchema>;

type EditWorkoutFormProps = {
  workout: Workout;
  onCancel: () => void;
  onSuccess: () => void;
};

function toUpdateWorkoutRequest(
  data: EditWorkoutFormData,
): UpdateWorkoutRequest {
  return {
    workoutName: data.workoutName.trim(),
    status: data.status,
  };
}

export function EditWorkoutForm({
  workout,
  onCancel,
  onSuccess,
}: EditWorkoutFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditWorkoutFormData>({
    resolver: zodResolver(editWorkoutSchema),
    defaultValues: {
      workoutName: workout.workoutName,
      status: workout.status,
    },
  });

  useEffect(() => {
    reset({
      workoutName: workout.workoutName,
      status: workout.status,
    });
  }, [workout, reset]);

  const updateWorkoutMutation = useMutation({
    mutationFn: (data: UpdateWorkoutRequest) =>
      updateWorkout(workout.workoutId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      onSuccess();
    },
  });

  const errorMessage =
    isApiError(updateWorkoutMutation.error) &&
    updateWorkoutMutation.error.status === 403
      ? "Você não possui permissão para editar treinos."
      : "Não foi possível atualizar o treino. Tente novamente.";

  function handleUpdateWorkout(data: EditWorkoutFormData) {
    updateWorkoutMutation.mutate(toUpdateWorkoutRequest(data));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
      <div className="border-b border-[#E4DFD6] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Treinos modelo
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
          Editar treino
        </h2>

        <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
          Atualize os dados do treino selecionado.
        </p>
      </div>

      <div className="p-5">
        {updateWorkoutMutation.isError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Erro ao atualizar treino.
            </p>

            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <form
          className="grid gap-4 lg:grid-cols-[1fr_180px] lg:items-end"
          onSubmit={handleSubmit(handleUpdateWorkout)}
        >
          <div>
            <label
              htmlFor="editWorkoutName"
              className="mb-2 block text-sm font-medium text-[#1F1F1F]"
            >
              Nome do treino
            </label>

            <input
              id="editWorkoutName"
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              {...register("workoutName")}
            />

            {errors.workoutName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.workoutName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="editWorkoutStatus"
              className="mb-2 block text-sm font-medium text-[#1F1F1F]"
            >
              Status
            </label>

            <select
              id="editWorkoutStatus"
              className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              {...register("status")}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>

            {errors.status?.message && (
              <p className="mt-2 text-sm text-red-600">Status inválido.</p>
            )}
          </div>

          <div className="lg:col-start-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="submit"
                disabled={updateWorkoutMutation.isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {updateWorkoutMutation.isPending
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={updateWorkoutMutation.isPending}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-5 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
