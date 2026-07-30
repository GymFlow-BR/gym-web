import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { createWorkout } from "../services/workoutService";
import type { Workout } from "../types/workout";

const createWorkoutSchema = z.object({
  workoutName: z
    .string()
    .trim()
    .min(1, "O nome do treino é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
});

type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>;

type CreateWorkoutFormProps = {
  onCancel: () => void;
  onSuccess?: (workout: Workout) => void;
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
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
      aria-hidden="true"
    >
      <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" />
      <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
    </svg>
  );
}

export function CreateWorkoutForm({
  onCancel,
  onSuccess,
}: CreateWorkoutFormProps) {
  const queryClient = useQueryClient();
  const { data: authenticatedUser } = useAuthenticatedUser();
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
  } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      workoutName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateWorkoutFormData) => {
      if (!authenticatedUser) {
        throw new Error("Usuário autenticado não disponível.");
      }

      return createWorkout({
        teacherId: authenticatedUser.userId,
        workoutName: data.workoutName.trim(),
      });
    },

    onSuccess: async (workout) => {
      await queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });

      onSuccess?.(workout);
    },
  });

  const handleCreateWorkout = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <form
        onSubmit={handleCreateWorkout}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workout-title"
        className="relative w-full max-w-xl rounded-[24px] border border-[#303632] bg-[#171A18] p-7 text-[#F4F7F5] shadow-2xl shadow-black/40 sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#303632] text-[#8C9690] transition hover:border-[#49514C] hover:bg-[#202522] hover:text-white"
          aria-label="Fechar formulário"
        >
          <CloseIcon />
        </button>

        <header className="pr-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8D9791]">
            Treino modelo
          </p>

          <h2
            id="create-workout-title"
            className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#F4F7F5]"
          >
            Criar novo treino
          </h2>

          <p className="mt-3 text-[14px] leading-6 text-[#8D9791]">
            Comece pelo nome e monte a sequência na próxima etapa.
          </p>
        </header>

        <div className="mt-8">
          <label
            htmlFor="workoutName"
            className="mb-2 block text-[12px] font-medium text-[#C9D0CC]"
          >
            Nome do treino
          </label>

          <input
            id="workoutName"
            type="text"
            placeholder="Ex.: Inferiores B"
            {...register("workoutName")}
            ref={(element) => {
              register("workoutName").ref(element);
              nameInputRef.current = element;
            }}
            className={[
              "h-14 w-full rounded-[14px] border bg-[#1D211F] px-4 text-[15px] text-[#F4F7F5] outline-none transition placeholder:text-[#727B76]",
              errors.workoutName
                ? "border-[#D66565] focus:border-[#EF7676] focus:ring-2 focus:ring-[#EF7676]/15"
                : "border-[#343A36] focus:border-[#69DF98] focus:ring-2 focus:ring-[#69DF98]/15",
            ].join(" ")}
          />

          {errors.workoutName?.message && (
            <p className="mt-2 text-[13px] text-[#FF7B7B]">
              {errors.workoutName.message}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-[14px] border border-[#315540] bg-[#20382A] px-4 py-4">
          <span className="mt-0.5 text-[#69DF98]">
            <SparkIcon />
          </span>

          <div>
            <p className="text-[13px] font-semibold text-[#69DF98]">
              Treino modelo reutilizável
            </p>

            <p className="mt-1 text-[12px] leading-5 text-[#91A099]">
              Depois de salvar, você poderá adicionar, ordenar e remover
              exercícios.
            </p>
          </div>
        </div>

        {mutation.isError && (
          <div
            role="alert"
            className="mt-4 rounded-[12px] border border-[#713F3F] bg-[#2B1C1C] px-4 py-3 text-[13px] text-[#FF9292]"
          >
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Não foi possível criar o treino. Tente novamente."}
          </div>
        )}

        <footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-[13px] border border-[#3A403C] px-6 text-[14px] font-semibold text-[#EEF2EF] transition hover:border-[#555E58] hover:bg-[#202522]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={mutation.isPending || !authenticatedUser}
            className="h-12 rounded-[13px] bg-[#69DF98] px-6 text-[14px] font-semibold text-[#0B1710] transition hover:bg-[#7BEAAB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Criando..." : "Criar e continuar"}
          </button>
        </footer>
      </form>
    </div>
  );
}
