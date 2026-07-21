import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SVGProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { createWorkout } from "../services/workoutService";
import type { CreateWorkoutRequest } from "../types/workout";

const createWorkoutSchema = z.object({
  workoutName: z
    .string()
    .trim()
    .min(1, 'O nome do treino é obrigatório.')
    .min(2, 'O nome do treino deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome do treino deve ter no máximo 120 caracteres.'),
})

type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>;

type CreateWorkoutFormProps = {
  onCancel: () => void;
};

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function toCreateWorkoutRequest(
  data: CreateWorkoutFormData,
  teacherId: number,
): CreateWorkoutRequest {
  return {
    teacherId,
    workoutName: data.workoutName.trim(),
  };
}

export function CreateWorkoutForm({ onCancel }: CreateWorkoutFormProps) {
  const queryClient = useQueryClient();
  const { data: user } = useAuthenticatedUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      workoutName: "",
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      reset();
    },
  });

  const errorMessage =
    isApiError(createWorkoutMutation.error) &&
    createWorkoutMutation.error.status === 403
      ? "Você não possui permissão para cadastrar treinos."
      : "Não foi possível cadastrar o treino. Tente novamente.";

  function handleCreateWorkout(data: CreateWorkoutFormData) {
    if (!user) {
      return;
    }

    createWorkoutMutation.mutate(toCreateWorkoutRequest(data, user.userId));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#E4DFD6] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
            Treinos modelo
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
            Novo treino
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
            Cadastre um treino modelo para depois associar exercícios e atribuir
            aos alunos.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar formulário"
          title="Fechar formulário"
          className="shrink-0 rounded-xl p-2 text-[#8A8378] transition hover:bg-[#F6F4EF] hover:text-[#2F4F3E]"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5">
        {createWorkoutMutation.isSuccess && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              Treino cadastrado com sucesso.
            </p>
          </div>
        )}

        {createWorkoutMutation.isError && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Erro ao cadastrar treino.
            </p>

            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleCreateWorkout)}>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="workoutName"
                className="mb-2 block text-sm font-medium text-[#1F1F1F]"
              >
                Nome do treino
              </label>

              <input
                id="workoutName"
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

            <button
              type="submit"
              disabled={createWorkoutMutation.isPending || !user}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {createWorkoutMutation.isPending
                ? "Cadastrando..."
                : "Cadastrar treino"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
