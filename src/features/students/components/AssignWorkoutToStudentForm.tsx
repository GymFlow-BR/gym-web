import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type {
  StudentWorkout,
  WeekDay,
} from "../../student-workout/types/studentWorkout";
import type { Workout } from "../../workouts/types/workout";

const weekDayOptions: { value: WeekDay; label: string; shortLabel: string }[] =
  [
    { value: "MONDAY", label: "Segunda-feira", shortLabel: "SEG" },
    { value: "TUESDAY", label: "Terça-feira", shortLabel: "TER" },
    { value: "WEDNESDAY", label: "Quarta-feira", shortLabel: "QUA" },
    { value: "THURSDAY", label: "Quinta-feira", shortLabel: "QUI" },
    { value: "FRIDAY", label: "Sexta-feira", shortLabel: "SEX" },
    { value: "SATURDAY", label: "Sábado", shortLabel: "SÁB" },
    { value: "SUNDAY", label: "Domingo", shortLabel: "DOM" },
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

function getWeekDayLabel(weekDay: WeekDay) {
  return (
    weekDayOptions.find((option) => option.value === weekDay)?.label ?? weekDay
  );
}

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

  const activeAssignedWorkouts = useMemo(
    () => assignedWorkouts.filter((workout) => workout.status === "ACTIVE"),
    [assignedWorkouts],
  );

  const occupiedWeekDays = useMemo(() => {
    return new Map<WeekDay, StudentWorkout>(
      activeAssignedWorkouts.map((workout) => [workout.weekDay, workout]),
    );
  }, [activeAssignedWorkouts]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workoutId: 0,
      weekDay: "MONDAY",
    },
  });

  const selectedWeekDay = watch("weekDay");

  const workoutAssignedToSelectedDay = occupiedWeekDays.get(selectedWeekDay);

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

    const alreadyHasActiveWorkoutForWeekDay = assignedWorkouts.find(
      (workout) =>
        workout.weekDay === data.weekDay && workout.status === "ACTIVE",
    );

    if (alreadyHasActiveWorkoutForWeekDay) {
      setLocalErrorMessage(
        `${getWeekDayLabel(data.weekDay)} já possui o treino ativo "${
          alreadyHasActiveWorkoutForWeekDay.workoutName
        }". Inative esse treino antes de atribuir outro para o mesmo dia.`,
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
          className="rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3 text-xs leading-5 text-[#ff8c87]"
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
              {workout.workoutId === currentWorkoutId ? " (hoje)" : ""}
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
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#d7dcd9]">Dia da semana</p>
            <p className="mt-1 text-xs leading-5 text-[#89948e]">
              Escolha em qual dia esse treino deve aparecer para o aluno.
            </p>
          </div>

          <span className="inline-flex min-h-7 shrink-0 items-center rounded-full border border-[#303733] px-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#89948e]">
            {activeAssignedWorkouts.length}/7 dias
          </span>
        </div>

        <Controller
          name="weekDay"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {weekDayOptions.map((weekDay) => {
                const assignedWorkout = occupiedWeekDays.get(weekDay.value);
                const isSelected = field.value === weekDay.value;
                const isOccupied = Boolean(assignedWorkout);

                return (
                  <button
                    key={weekDay.value}
                    type="button"
                    disabled={isLoading || mutation.isPending}
                    onClick={() => field.onChange(weekDay.value)}
                    className={[
                      "min-h-[74px] rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected
                        ? "border-[#70e39b] bg-[#20382a] ring-2 ring-[#70e39b]/10"
                        : isOccupied
                          ? "border-[#3d4a41] bg-[#1a211c] hover:border-[#526057]"
                          : "border-[#343b37] bg-[#1d211f] hover:border-[#4a554e]",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={[
                          "text-[10px] font-bold uppercase tracking-[0.1em]",
                          isSelected ? "text-[#70e39b]" : "text-[#8f9993]",
                        ].join(" ")}
                      >
                        {weekDay.shortLabel}
                      </span>

                      {isSelected && (
                        <CheckCircle2
                          aria-hidden="true"
                          className="h-4 w-4 text-[#70e39b]"
                        />
                      )}
                    </span>

                    <span className="mt-2 block text-xs font-semibold text-[#f5f7f5]">
                      {weekDay.label}
                    </span>

                    <span
                      className={[
                        "mt-1 block truncate text-[11px] leading-4",
                        isOccupied ? "text-[#f2c97d]" : "text-[#7f8a84]",
                      ].join(" ")}
                    >
                      {assignedWorkout
                        ? assignedWorkout.workoutName
                        : "Dia livre"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />

        {errors.weekDay && (
          <p className="mt-2 text-xs text-[#ff7f79]">
            {errors.weekDay.message}
          </p>
        )}

        {workoutAssignedToSelectedDay && (
          <div className="mt-3 flex gap-3 rounded-xl border border-[#453b25] bg-[#211d14] px-4 py-3">
            <CalendarDays
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#f2c97d]"
            />

            <p className="text-xs leading-5 text-[#b9a57d]">
              {getWeekDayLabel(selectedWeekDay)} já possui o treino{" "}
              <strong className="font-semibold text-[#f2c97d]">
                {workoutAssignedToSelectedDay.workoutName}
              </strong>
              . Para trocar, inative a atribuição atual antes de salvar outra.
            </p>
          </div>
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
