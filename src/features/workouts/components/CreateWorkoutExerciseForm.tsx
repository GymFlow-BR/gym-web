import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

function getFieldClassName(hasError?: boolean) {
  return [
    "h-14 w-full rounded-[14px] border bg-[#151917] px-4 text-[14px] text-[#F4F7F5] outline-none transition placeholder:text-[#6F7973]",
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    hasError
      ? "border-[#B95757] focus:border-[#FF7A7A] focus:ring-2 focus:ring-[#FF7A7A]/15"
      : "border-[#303632] focus:border-[#70E39B] focus:ring-2 focus:ring-[#70E39B]/15",
  ].join(" ");
}

function getTextAreaClassName(hasError?: boolean) {
  return [
    "min-h-[92px] w-full rounded-[14px] border bg-[#151917] px-4 py-3 text-[14px] text-[#F4F7F5] outline-none transition placeholder:text-[#6F7973]",
    hasError
      ? "border-[#B95757] focus:border-[#FF7A7A] focus:ring-2 focus:ring-[#FF7A7A]/15"
      : "border-[#303632] focus:border-[#70E39B] focus:ring-2 focus:ring-[#70E39B]/15",
  ].join(" ");
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

  function handleCreateWorkoutExercise(data: CreateWorkoutExerciseFormData) {
    createWorkoutExerciseMutation.mutate(toCreateWorkoutExerciseRequest(data));
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#29302C] bg-[#171A18] text-[#F4F7F5] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="border-b border-[#29302C] px-5 py-6 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
          Montagem do treino
        </p>

        <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-white">
          Adicionar exercício
        </h2>

        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#91A097]">
          Defina ordem, séries, repetições, carga, descanso e observações.
        </p>
      </div>

      <div className="px-5 py-6 sm:px-7">
        {createWorkoutExerciseMutation.isSuccess && (
          <div className="mb-5 rounded-[14px] border border-[#2D6945] bg-[#173323] px-4 py-3 text-[13px] font-medium text-[#70E39B]">
            Exercício adicionado ao treino com sucesso.
          </div>
        )}

        {createWorkoutExerciseMutation.isError && (
          <div
            role="alert"
            className="mb-5 rounded-[14px] border border-[#6A3434] bg-[#2B1919] px-4 py-3"
          >
            <p className="text-[13px] font-semibold text-[#FF8A8A]">
              Erro ao adicionar exercício.
            </p>

            <p className="mt-1 text-[13px] text-[#FFB0B0]">
              {getCreateWorkoutExerciseErrorMessage()}
            </p>
          </div>
        )}

        {isExercisesError && (
          <div
            role="alert"
            className="mb-5 rounded-[14px] border border-[#6A3434] bg-[#2B1919] px-4 py-3"
          >
            <p className="text-[13px] font-semibold text-[#FF8A8A]">
              Não foi possível carregar os exercícios.
            </p>

            <p className="mt-1 text-[13px] text-[#FFB0B0]">
              Verifique se a API está rodando e se existem exercícios
              cadastrados.
            </p>
          </div>
        )}

        <form
          className="grid gap-x-4 gap-y-5 lg:grid-cols-12"
          onSubmit={handleSubmit(handleCreateWorkoutExercise)}
          noValidate
        >
          <div className="lg:col-span-6">
            <label
              htmlFor="workout-exercise-select"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Exercício
            </label>

            <select
              id="workout-exercise-select"
              aria-invalid={errors.exerciseId ? true : undefined}
              aria-describedby={
                errors.exerciseId ? "workout-exercise-error" : undefined
              }
              className={getFieldClassName(Boolean(errors.exerciseId))}
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
              <p
                id="workout-exercise-error"
                className="mt-2 text-[12px] font-medium text-[#FF7A7A]"
              >
                {errors.exerciseId.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="workout-exercise-order"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Ordem
            </label>
            <input
              id="workout-exercise-order"
              type="number"
              min={1}
              placeholder="Ex.: 1"
              className={getFieldClassName(Boolean(errors.exerciseOrder))}
              {...register("exerciseOrder")}
            />
            {errors.exerciseOrder?.message && (
              <p className="mt-2 text-[12px] font-medium text-[#FF7A7A]">
                {errors.exerciseOrder.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="workout-exercise-sets"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Séries
            </label>
            <input
              id="workout-exercise-sets"
              type="number"
              min={1}
              placeholder="Ex.: 3"
              className={getFieldClassName(Boolean(errors.sets))}
              {...register("sets")}
            />
            {errors.sets?.message && (
              <p className="mt-2 text-[12px] font-medium text-[#FF7A7A]">
                {errors.sets.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="workout-exercise-reps"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Repetições
            </label>
            <input
              id="workout-exercise-reps"
              placeholder="Ex.: 8–12"
              className={getFieldClassName(Boolean(errors.reps))}
              {...register("reps")}
            />
            {errors.reps?.message && (
              <p className="mt-2 text-[12px] font-medium text-[#FF7A7A]">
                {errors.reps.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-6">
            <label
              htmlFor="workout-exercise-load"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Carga recomendada
            </label>
            <input
              id="workout-exercise-load"
              type="number"
              min={0}
              step="0.01"
              placeholder="Ex.: 40"
              className={getFieldClassName(Boolean(errors.recommendedLoad))}
              {...register("recommendedLoad")}
            />
            {errors.recommendedLoad?.message && (
              <p className="mt-2 text-[12px] font-medium text-[#FF7A7A]">
                {errors.recommendedLoad.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="workout-exercise-rest"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Descanso em segundos
            </label>
            <input
              id="workout-exercise-rest"
              type="number"
              min={0}
              placeholder="Ex.: 90"
              className={getFieldClassName(Boolean(errors.restTimeSeconds))}
              {...register("restTimeSeconds")}
            />
            {errors.restTimeSeconds?.message && (
              <p className="mt-2 text-[12px] font-medium text-[#FF7A7A]">
                {errors.restTimeSeconds.message}
              </p>
            )}
          </div>

          <div className="lg:col-span-4">
            <label
              htmlFor="workout-exercise-notes"
              className="mb-2 block text-[12px] font-semibold text-[#DDE3DF]"
            >
              Observações
            </label>

            <textarea
              id="workout-exercise-notes"
              aria-invalid={errors.notes ? true : undefined}
              aria-describedby={
                errors.notes ? "workout-exercise-notes-error" : undefined
              }
              className={getTextAreaClassName(Boolean(errors.notes))}
              placeholder="Orientação específica para este treino."
              {...register("notes")}
            />

            {errors.notes?.message && (
              <p
                id="workout-exercise-notes-error"
                className="mt-2 text-[12px] font-medium text-[#FF7A7A]"
              >
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex justify-center lg:col-span-12">
            <button
              type="submit"
              disabled={
                createWorkoutExerciseMutation.isPending ||
                isLoadingExercises ||
                isExercisesError
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[13px] bg-[#70E39B] px-6 text-[14px] font-semibold text-[#07100A] transition hover:-translate-y-0.5 hover:bg-[#85EBAB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              {createWorkoutExerciseMutation.isPending
                ? "Adicionando..."
                : "Adicionar ao treino"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
