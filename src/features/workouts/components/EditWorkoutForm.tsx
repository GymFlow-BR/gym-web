import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateWorkout } from "../services/workoutService";
import type { Workout } from "../types/workout";

const editWorkoutSchema = z.object({
  workoutName: z
    .string()
    .trim()
    .min(1, "O nome do treino é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});

type EditWorkoutFormData = z.infer<typeof editWorkoutSchema>;

type EditWorkoutFormProps = {
  workout: Workout;
  onCancel: () => void;
  onSuccess?: () => void;
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" />
      <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
    </svg>
  );
}

export function EditWorkoutForm({
  workout,
  onCancel,
  onSuccess,
}: EditWorkoutFormProps) {
  const queryClient = useQueryClient();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditWorkoutFormData>({
    resolver: zodResolver(editWorkoutSchema),
    defaultValues: {
      workoutName: workout.workoutName,
      status: workout.status,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: EditWorkoutFormData) =>
      updateWorkout(workout.workoutId, {
        workoutName: data.workoutName.trim(),
        status: data.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      await queryClient.invalidateQueries({
        queryKey: ["workout", workout.workoutId],
      });
      onSuccess?.();
    },
  });

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-workout-title"
        className="relative w-full max-w-xl rounded-3xl border border-[#39413C] bg-[#171A18] p-7 text-white shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border border-[#343B37] text-[#91A097] transition hover:border-[#70E39B]/50 hover:text-white"
        >
          <CloseIcon />
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
          Treino modelo
        </p>
        <h2
          id="edit-workout-title"
          className="mt-4 pr-14 text-3xl font-semibold tracking-[-0.04em]"
        >
          Editar treino
        </h2>
        <p className="mt-3 text-sm text-[#91A097]">
          Atualize o nome ou o status do treino.
        </p>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="mt-9 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="edit-workout-name" className="text-sm font-medium">
              Nome do treino
            </label>
            <input
              id="edit-workout-name"
              {...register("workoutName")}
              ref={(element) => {
                register("workoutName").ref(element);
                nameInputRef.current = element;
              }}
              className={`mt-2 h-14 w-full rounded-xl border bg-[#1D211F] px-4 text-sm text-white outline-none transition ${
                errors.workoutName
                  ? "border-[#A64F4F] focus:border-[#FF7A7A]"
                  : "border-[#343B37] focus:border-[#70E39B]"
              }`}
            />
            {errors.workoutName && (
              <p className="mt-2 text-sm text-[#FF7A7A]">
                {errors.workoutName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-workout-status"
              className="text-sm font-medium"
            >
              Status
            </label>
            <select
              id="edit-workout-status"
              {...register("status")}
              className="mt-2 h-14 w-full rounded-xl border border-[#343B37] bg-[#1D211F] px-4 text-sm text-white outline-none transition focus:border-[#70E39B]"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          <div className="flex gap-3 rounded-xl border border-[#31553F] bg-[#1D3B2A] p-4">
            <span className="mt-0.5 text-[#70E39B]">
              <SparkIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#70E39B]">
                Treino modelo reutilizável
              </p>
              <p className="mt-1 text-xs leading-5 text-[#91A097]">
                As alterações serão refletidas nas próximas atribuições.
              </p>
            </div>
          </div>

          {mutation.isError && (
            <p role="alert" className="text-sm text-[#FF7A7A]">
              Não foi possível atualizar o treino. Tente novamente.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 rounded-xl border border-[#39413C] px-5 text-sm font-semibold transition hover:bg-[#232825]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-12 rounded-xl bg-[#70E39B] px-6 text-sm font-semibold text-[#07100A] transition hover:bg-[#85EBAB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
