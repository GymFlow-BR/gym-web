import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type {
  StudentWorkout,
  WeekDay,
} from "../../student-workout/types/studentWorkout";
import type { Workout } from "../../workouts/types/workout";

const weekDayOptions: { value: WeekDay; label: string }[] = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const schema = z.object({
  workoutId: z.number().min(1, "Selecione um treino."),
  weekDay: z.enum(
    [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
    {
      message: "Selecione o dia da semana.",
    },
  ),
});

type FormData = z.infer<typeof schema>;

type AssignWorkoutToStudentFormProps = {
  studentId: number;
  activeWorkouts: Workout[];
  assignedWorkouts: StudentWorkout[];
  currentWorkoutId?: number;
  isLoading: boolean;
  onCancel: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignWorkoutToStudentForm({
  studentId,
  activeWorkouts,
  assignedWorkouts,
  currentWorkoutId,
  isLoading,
  onCancel,
  onSuccess,
}: AssignWorkoutToStudentFormProps) {
  const queryClient = useQueryClient();

  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workoutId: 0,
      weekDay: "MONDAY",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createStudentWorkout(studentId, {
        workoutId: data.workoutId,
        weekDay: data.weekDay,
      }),
    onSuccess: async () => {
      setLocalErrorMessage(null);

      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout", studentId],
      });
      await queryClient.invalidateQueries({ queryKey: ["student-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await onSuccess();
    },
  });

  function handleAssignWorkout(data: FormData) {
    setLocalErrorMessage(null);

    const alreadyAssignedWorkout = assignedWorkouts.find(
      (workout) => workout.workoutId === data.workoutId,
    );

    if (alreadyAssignedWorkout) {
      setLocalErrorMessage(
        "Este aluno já possui esse treino atribuído em outro dia da semana.",
      );
      return;
    }

    const alreadyHasActiveWorkoutForWeekDay = assignedWorkouts.some(
      (workout) =>
        workout.weekDay === data.weekDay && workout.status === "ACTIVE",
    );

    if (alreadyHasActiveWorkoutForWeekDay) {
      setLocalErrorMessage(
        "Este aluno já possui um treino ativo neste dia da semana.",
      );
      return;
    }

    mutation.mutate(data);
  }

  function getErrorMessage() {
    if (isApiError(mutation.error)) {
      if (mutation.error.status === 403) {
        return "Você não possui permissão para atribuir treinos.";
      }

      if (mutation.error.status === 404) {
        return "Aluno ou treino não encontrado.";
      }

      if (mutation.error.status === 409) {
        return "Este aluno já possui um treino ativo neste dia da semana.";
      }

      if (mutation.error.status === 400) {
        return "Revise o treino e o dia da semana selecionados.";
      }
    }

    return "Não foi possível atribuir o treino. Tente novamente.";
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleAssignWorkout)}>
      {(localErrorMessage || mutation.isError) && (
        <p
          role="alert"
          className="rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3 text-xs text-[#ff8c87]"
        >
          {localErrorMessage ?? getErrorMessage()}
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

      <div>
        <label
          htmlFor="weekDay"
          className="mb-2 block text-xs font-medium text-[#d7dcd9]"
        >
          Dia da semana
        </label>

        <select
          id="weekDay"
          disabled={isLoading || mutation.isPending}
          className="h-12 w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("weekDay")}
        >
          {weekDayOptions.map((weekDay) => (
            <option key={weekDay.value} value={weekDay.value}>
              {weekDay.label}
            </option>
          ))}
        </select>

        {errors.weekDay && (
          <p className="mt-2 text-xs text-[#ff7f79]">
            {errors.weekDay.message}
          </p>
        )}

        <p className="mt-2 text-xs leading-5 text-[#89948e]">
          O aluno pode ter apenas um treino ativo por dia da semana.
        </p>
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
