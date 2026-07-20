import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { isApiError } from "../../../services/apiError";
import { getExercises } from "../../exercises/services/exerciseService";
import { createWorkoutExercise } from "../services/workoutService";
import type { CreateWorkoutExerciseRequest } from "../types/workout";

const createWorkoutExerciseSchema = z.object({
  exerciseId: z
    .string()
    .min(1, "Selecione um exercício.")
    .refine((value) => Number(value) >= 1, "Selecione um exercício."),

  exerciseOrder: z
    .string()
    .min(1, "A ordem é obrigatória.")
    .refine(
      (value) => Number.isInteger(Number(value)),
      "A ordem deve ser um número inteiro.",
    )
    .refine(
      (value) => Number(value) >= 1,
      "A ordem deve ser maior ou igual a 1.",
    ),

  sets: z
    .string()
    .min(1, "A quantidade de séries é obrigatória.")
    .refine(
      (value) => Number.isInteger(Number(value)),
      "A quantidade de séries deve ser um número inteiro.",
    )
    .refine(
      (value) => Number(value) >= 1,
      "A quantidade de séries deve ser maior ou igual a 1.",
    ),

  reps: z
    .string()
    .trim()
    .min(1, "As repetições são obrigatórias.")
    .max(50, "As repetições devem ter no máximo 50 caracteres."),

  recommendedLoad: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "A carga recomendada não pode ser negativa."),

  restTimeSeconds: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      return Number.isInteger(Number(value)) && Number(value) >= 0;
    }, "O tempo de descanso deve ser um número inteiro maior ou igual a 0."),

  notes: z.string().trim().optional().or(z.literal("")),
});

type CreateWorkoutExerciseFormData = z.infer<
  typeof createWorkoutExerciseSchema
>;

type CreateWorkoutExerciseFormProps = {
  workoutId: number;
};

function normalizeOptionalNumber(value?: string) {
  if (!value || value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

function normalizeOptionalText(value?: string) {
  if (!value || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

function toCreateWorkoutExerciseRequest(
  data: CreateWorkoutExerciseFormData,
): CreateWorkoutExerciseRequest {
  return {
    exerciseId: Number(data.exerciseId),
    exerciseOrder: Number(data.exerciseOrder),
    sets: Number(data.sets),
    reps: data.reps.trim(),
    recommendedLoad: normalizeOptionalNumber(data.recommendedLoad),
    restTimeSeconds: normalizeOptionalNumber(data.restTimeSeconds),
    notes: normalizeOptionalText(data.notes),
  };
}

export function CreateWorkoutExerciseForm({
  workoutId,
}: CreateWorkoutExerciseFormProps) {
  const queryClient = useQueryClient();

  const {
    data: exercises,
    isLoading: isLoadingExercises,
    isError: isExercisesError,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkoutExerciseFormData>({
    resolver: zodResolver(createWorkoutExerciseSchema),
    defaultValues: {
      exerciseId: "",
      exerciseOrder: "1",
      sets: "3",
      reps: "",
      recommendedLoad: "",
      restTimeSeconds: "",
      notes: "",
    },
  });

  const createWorkoutExerciseMutation = useMutation({
    mutationFn: (data: CreateWorkoutExerciseRequest) =>
      createWorkoutExercise(workoutId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workout-exercises", workoutId],
      });

      reset({
        exerciseId: "",
        exerciseOrder: "1",
        sets: "3",
        reps: "",
        recommendedLoad: "",
        restTimeSeconds: "",
        notes: "",
      });
    },
  });

  function getCreateWorkoutExerciseErrorMessage() {
    if (!isApiError(createWorkoutExerciseMutation.error)) {
      return "Não foi possível adicionar o exercício ao treino. Tente novamente.";
    }

    if (createWorkoutExerciseMutation.error.status === 403) {
      return "Você não possui permissão para adicionar exercícios ao treino.";
    }

    if (createWorkoutExerciseMutation.error.status === 409) {
      return "Já existe um exercício com essa ordem neste treino. Escolha outra ordem.";
    }

    return "Não foi possível adicionar o exercício ao treino. Tente novamente.";
  }

  const errorMessage = getCreateWorkoutExerciseErrorMessage();

  function handleCreateWorkoutExercise(data: CreateWorkoutExerciseFormData) {
    createWorkoutExerciseMutation.mutate(toCreateWorkoutExerciseRequest(data));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
      <div className="border-b border-[#E4DFD6] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Montagem do treino
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
          Adicionar exercício
        </h2>

        <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
          Escolha um exercício cadastrado e defina ordem, séries, repetições,
          carga, descanso e observações para este treino modelo.
        </p>
      </div>

      <div className="p-5">
        {createWorkoutExerciseMutation.isSuccess && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              Exercício adicionado ao treino com sucesso.
            </p>
          </div>
        )}

        {createWorkoutExerciseMutation.isError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Erro ao adicionar exercício.
            </p>

            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {isExercisesError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Não foi possível carregar os exercícios.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Verifique se a API está rodando e se existem exercícios
              cadastrados.
            </p>
          </div>
        )}

        <form
          className="grid gap-4 lg:grid-cols-12"
          onSubmit={handleSubmit(handleCreateWorkoutExercise)}
        >
          <div className="lg:col-span-6">
            <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
              Exercício
            </label>

            <select
              className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              disabled={isLoadingExercises || isExercisesError}
              {...register("exerciseId")}
            >
              <option value="">
                {isLoadingExercises
                  ? "Carregando exercícios..."
                  : "Selecione um exercício"}
              </option>

              {exercises?.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.exerciseName} — {exercise.muscleGroup}
                </option>
              ))}
            </select>

            {errors.exerciseId?.message && (
              <p className="mt-2 text-sm text-red-600">
                {errors.exerciseId.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <Input
              label="Ordem"
              type="number"
              min={1}
              placeholder="Ex: 1"
              error={errors.exerciseOrder?.message}
              {...register("exerciseOrder")}
            />
          </div>

          <div className="lg:col-span-2">
            <Input
              label="Séries"
              type="number"
              min={1}
              placeholder="Ex: 3"
              error={errors.sets?.message}
              {...register("sets")}
            />
          </div>

          <div className="lg:col-span-2">
            <Input
              label="Repetições"
              placeholder="Ex: 8-12"
              error={errors.reps?.message}
              {...register("reps")}
            />
          </div>

          <div className="lg:col-span-3">
            <Input
              label="Carga recomendada"
              type="number"
              min={0}
              step="0.01"
              placeholder="Ex: 40"
              error={errors.recommendedLoad?.message}
              {...register("recommendedLoad")}
            />
          </div>

          <div className="lg:col-span-3">
            <Input
              label="Descanso em segundos"
              type="number"
              min={0}
              placeholder="Ex: 90"
              error={errors.restTimeSeconds?.message}
              {...register("restTimeSeconds")}
            />
          </div>

          <div className="lg:col-span-6">
            <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
              Observações
            </label>

            <textarea
              className="min-h-24 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              placeholder="Ex: Controlar a descida e manter amplitude completa"
              {...register("notes")}
            />

            {errors.notes?.message && (
              <p className="mt-2 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex items-end lg:col-span-6 lg:justify-end">
            <Button
              type="submit"
              className="w-full lg:w-auto"
              disabled={
                createWorkoutExerciseMutation.isPending ||
                isLoadingExercises ||
                isExercisesError
              }
            >
              {createWorkoutExerciseMutation.isPending
                ? "Adicionando..."
                : "Adicionar exercício ao treino"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
