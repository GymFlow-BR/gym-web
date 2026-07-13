import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
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
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Editar treino</h2>

        <p className="mt-1 text-sm text-[#6F6A62]">
          Atualize as informações básicas do treino modelo selecionado.
        </p>
      </div>

      {updateWorkoutMutation.isError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erro ao atualizar treino.
          </p>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form
        className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"
        onSubmit={handleSubmit(handleUpdateWorkout)}
      >
        <Input
          label="Nome do treino"
          placeholder="Ex: Treino A - Peito e Tríceps"
          error={errors.workoutName?.message}
          {...register("workoutName")}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
            Status
          </label>

          <select
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 lg:w-44"
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

        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
          <Button type="submit" disabled={updateWorkoutMutation.isPending}>
            {updateWorkoutMutation.isPending
              ? "Salvando..."
              : "Salvar alterações"}
          </Button>

          <button
            type="button"
            onClick={onCancel}
            disabled={updateWorkoutMutation.isPending}
            className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-5 py-3 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}
