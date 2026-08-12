import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card } from "../../../components/ui/Card";
import { isApiError } from "../../../services/apiError";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import type { WeekDay } from "../../student-workout/types/studentWorkout";
import type { Workout } from "../../workouts/types/workout";
import type { Student } from "../types/student";

const weekDayOptions: { value: WeekDay; label: string }[] = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const assignWorkoutSchema = z.object({
  studentId: z.number().min(1, "Selecione um aluno."),
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

type AssignWorkoutFormData = z.infer<typeof assignWorkoutSchema>;

type AssignWorkoutFormProps = {
  students: Student[];
  activeWorkouts: Workout[];
  isLoading: boolean;
};

export function AssignWorkoutForm({
  students,
  activeWorkouts,
  isLoading,
}: AssignWorkoutFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignWorkoutFormData>({
    resolver: zodResolver(assignWorkoutSchema),
    defaultValues: {
      studentId: 0,
      workoutId: 0,
      weekDay: "MONDAY",
    },
  });

  const assignWorkoutMutation = useMutation({
    mutationFn: (data: AssignWorkoutFormData) =>
      createStudentWorkout(data.studentId, {
        workoutId: data.workoutId,
        weekDay: data.weekDay,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["student-workouts"] });
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout"],
      });

      reset({
        studentId: 0,
        workoutId: 0,
        weekDay: "MONDAY",
      });
    },
  });

  const hasStudents = students.length > 0;
  const hasActiveWorkouts = activeWorkouts.length > 0;

  function handleAssignWorkout(data: AssignWorkoutFormData) {
    assignWorkoutMutation.mutate(data);
  }

  function getAssignErrorMessage() {
    if (!assignWorkoutMutation.error) {
      return null;
    }

    if (isApiError(assignWorkoutMutation.error)) {
      if (assignWorkoutMutation.error.status === 403) {
        return "Você não possui permissão para atribuir treinos.";
      }

      if (assignWorkoutMutation.error.status === 404) {
        return "Aluno ou treino não encontrado.";
      }

      if (assignWorkoutMutation.error.status === 409) {
        return "Este aluno já possui um treino ativo neste dia da semana.";
      }

      if (assignWorkoutMutation.error.status === 400) {
        return "Revise os dados selecionados e tente novamente.";
      }
    }

    return "Não foi possível atribuir o treino. Tente novamente.";
  }

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Atribuição
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Atribuir treino
        </h2>

        <p className="text-sm text-[#6F6A62]">
          Selecione um aluno, um treino modelo ativo e o dia da semana.
        </p>
      </div>

      {assignWorkoutMutation.isSuccess && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            Treino atribuído com sucesso.
          </p>
          <p className="mt-1 text-sm text-green-600">
            O aluno já pode visualizar o treino no dia selecionado.
          </p>
        </div>
      )}

      {assignWorkoutMutation.isError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao atribuir treino.
          </p>
          <p className="mt-1 text-sm text-red-600">{getAssignErrorMessage()}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(handleAssignWorkout)}>
        <div>
          <label
            htmlFor="studentId"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Aluno
          </label>

          <select
            id="studentId"
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
            disabled={
              isLoading || !hasStudents || assignWorkoutMutation.isPending
            }
            {...register("studentId", { valueAsNumber: true })}
          >
            <option value={0}>Selecione um aluno</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>

          {errors.studentId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.studentId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="workoutId"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Treino
          </label>

          <select
            id="workoutId"
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
            disabled={
              isLoading || !hasActiveWorkouts || assignWorkoutMutation.isPending
            }
            {...register("workoutId", { valueAsNumber: true })}
          >
            <option value={0}>Selecione um treino</option>
            {activeWorkouts.map((workout) => (
              <option key={workout.workoutId} value={workout.workoutId}>
                {workout.workoutName}
              </option>
            ))}
          </select>

          {errors.workoutId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.workoutId.message}
            </p>
          )}

          {!isLoading && !hasActiveWorkouts && (
            <p className="mt-2 text-sm text-[#6F6A62]">
              Nenhum treino ativo disponível para atribuição.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="weekDay"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Dia da semana
          </label>

          <select
            id="weekDay"
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
            disabled={isLoading || assignWorkoutMutation.isPending}
            {...register("weekDay")}
          >
            {weekDayOptions.map((weekDay) => (
              <option key={weekDay.value} value={weekDay.value}>
                {weekDay.label}
              </option>
            ))}
          </select>

          {errors.weekDay && (
            <p className="mt-2 text-sm text-red-600">
              {errors.weekDay.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            !hasStudents ||
            !hasActiveWorkouts ||
            assignWorkoutMutation.isPending
          }
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assignWorkoutMutation.isPending
            ? "Atribuindo..."
            : "Atribuir treino"}
        </button>
      </form>
    </Card>
  );
}
