import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { createStudentWorkout } from "../../student-workout/services/studentWorkoutService";
import { getWorkouts } from "../../workouts/services/workoutService";
import {
  createStudent,
  getStudentsByOrganization,
} from "../services/studentService";

const createStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do aluno é obrigatório.")
    .min(2, "O nome do aluno deve ter pelo menos 2 caracteres.")
    .max(120, "O nome do aluno deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O email do aluno é obrigatório.")
    .email("Informe um email válido.")
    .max(160, "O email deve ter no máximo 160 caracteres."),
  password: z
    .string()
    .min(1, "A senha inicial é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

const assignWorkoutSchema = z.object({
  studentId: z.number().min(1, "Selecione um aluno."),
  workoutId: z.number().min(1, "Selecione um treino."),
});

type CreateStudentFormData = z.infer<typeof createStudentSchema>;
type AssignWorkoutFormData = z.infer<typeof assignWorkoutSchema>;

export function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const authenticatedUserQuery = useAuthenticatedUser();

  const organizationId = authenticatedUserQuery.data?.organizationId;

  const {
    register: registerCreateStudent,
    handleSubmit: handleSubmitCreateStudent,
    reset: resetCreateStudent,
    formState: { errors: createStudentErrors },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const {
    register: registerAssignWorkout,
    handleSubmit: handleSubmitAssignWorkout,
    reset: resetAssignWorkout,
    formState: { errors: assignWorkoutErrors },
  } = useForm<AssignWorkoutFormData>({
    resolver: zodResolver(assignWorkoutSchema),
    defaultValues: {
      studentId: 0,
      workoutId: 0,
    },
  });

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const activeWorkouts = useMemo(() => {
    return (
      workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? []
    );
  }, [workoutsQuery.data]);

  const createStudentMutation = useMutation({
    mutationFn: (data: CreateStudentFormData) =>
      createStudent({
        organizationId: Number(organizationId),
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "STUDENT",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      resetCreateStudent({
        name: "",
        email: "",
        password: "",
      });
    },
  });

  const assignWorkoutMutation = useMutation({
    mutationFn: (data: AssignWorkoutFormData) =>
      createStudentWorkout(data.studentId, {
        workoutId: data.workoutId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["student-workouts"] });
      await queryClient.invalidateQueries({
        queryKey: ["student-current-workout"],
      });

      resetAssignWorkout({
        studentId: 0,
        workoutId: 0,
      });
    },
  });

  const isLoading =
    authenticatedUserQuery.isLoading ||
    studentsQuery.isLoading ||
    workoutsQuery.isLoading;

  const hasLoadError =
    authenticatedUserQuery.isError ||
    studentsQuery.isError ||
    workoutsQuery.isError;

  const students = studentsQuery.data ?? [];

  const hasStudents = students.length > 0;
  const hasActiveWorkouts = activeWorkouts.length > 0;

  function handleCreateStudent(data: CreateStudentFormData) {
    if (!organizationId) {
      return;
    }

    createStudentMutation.mutate(data);
  }

  function handleAssignWorkout(data: AssignWorkoutFormData) {
    assignWorkoutMutation.mutate(data);
  }

  function getCreateStudentErrorMessage() {
    if (!createStudentMutation.error) {
      return null;
    }

    if (isApiError(createStudentMutation.error)) {
      if (createStudentMutation.error.status === 403) {
        return "Você não possui permissão para cadastrar alunos.";
      }

      if (createStudentMutation.error.status === 409) {
        return "Já existe um usuário cadastrado com este email.";
      }

      if (createStudentMutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível cadastrar o aluno. Tente novamente.";
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
        return "Este treino já está atribuído para o aluno selecionado.";
      }

      if (assignWorkoutMutation.error.status === 400) {
        return "Revise os dados selecionados e tente novamente.";
      }
    }

    return "Não foi possível atribuir o treino. Tente novamente.";
  }

  return (
    <>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos vinculados à sua academia ou assessoria."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Novo aluno
              </p>

              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Cadastrar aluno
              </h2>

              <p className="text-sm text-[#6F6A62]">
                Crie um acesso inicial para o aluno da sua organização.
              </p>
            </div>

            {createStudentMutation.isSuccess && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-700">
                  Aluno cadastrado com sucesso.
                </p>
                <p className="mt-1 text-sm text-green-600">
                  O aluno já aparece na lista e pode receber um treino.
                </p>
              </div>
            )}

            {createStudentMutation.isError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Erro ao cadastrar aluno.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {getCreateStudentErrorMessage()}
                </p>
              </div>
            )}

            <form
              className="grid gap-4 lg:grid-cols-[1fr_1fr_180px] lg:items-start"
              onSubmit={handleSubmitCreateStudent(handleCreateStudent)}
            >
              <div>
                <label
                  htmlFor="studentName"
                  className="mb-2 block text-sm font-medium text-[#1F1F1F]"
                >
                  Nome
                </label>

                <input
                  id="studentName"
                  placeholder="Ex: Maria Silva"
                  autoComplete="off"
                  className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
                  disabled={createStudentMutation.isPending}
                  {...registerCreateStudent("name")}
                />

                {createStudentErrors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {createStudentErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="studentEmail"
                  className="mb-2 block text-sm font-medium text-[#1F1F1F]"
                >
                  Email
                </label>

                <input
                  id="studentEmail"
                  type="email"
                  placeholder="aluno@email.com"
                  autoComplete="off"
                  className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
                  disabled={createStudentMutation.isPending}
                  {...registerCreateStudent("email")}
                />

                {createStudentErrors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {createStudentErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="studentPassword"
                  className="mb-2 block text-sm font-medium text-[#1F1F1F]"
                >
                  Senha inicial
                </label>

                <input
                  id="studentPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mín. 6 caracteres"
                  className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
                  disabled={createStudentMutation.isPending}
                  {...registerCreateStudent("password")}
                />

                {createStudentErrors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {createStudentErrors.password.message}
                  </p>
                )}
              </div>

              <div className="lg:col-span-3">
                <button
                  type="submit"
                  disabled={!organizationId || createStudentMutation.isPending}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {createStudentMutation.isPending
                    ? "Cadastrando..."
                    : "Cadastrar aluno"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Alunos cadastrados
              </p>

              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Lista de alunos
              </h2>

              <p className="text-sm text-[#6F6A62]">
                Visualize os alunos disponíveis para receber um treino.
              </p>
            </div>

            {isLoading && (
              <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
                <p className="text-sm text-[#6F6A62]">Carregando alunos...</p>
              </div>
            )}

            {hasLoadError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Erro ao carregar alunos.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Não foi possível buscar os dados necessários. Tente novamente.
                </p>
              </div>
            )}

            {!isLoading && !hasLoadError && !hasStudents && (
              <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  Nenhum aluno encontrado
                </p>
                <p className="mt-1 text-sm text-[#6F6A62]">
                  Quando houver alunos cadastrados, eles aparecerão nesta lista.
                </p>
              </div>
            )}

            {!isLoading && !hasLoadError && hasStudents && (
              <div className="overflow-hidden rounded-2xl border border-[#E4DFD6]">
                <div className="grid bg-[#FAF9F6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8A8378] sm:grid-cols-[1fr_180px]">
                  <span>Aluno</span>
                  <span className="hidden sm:block">Status</span>
                </div>

                <div className="divide-y divide-[#E4DFD6]">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_180px] sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-[#1F1F1F]">
                          {student.name}
                        </p>
                        <p className="mt-1 text-sm text-[#6F6A62]">
                          {student.email}
                        </p>
                      </div>

                      <div>
                        <span
                          className={
                            student.active
                              ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                          }
                        >
                          {student.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="mb-5 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              Atribuição
            </p>

            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Atribuir treino
            </h2>

            <p className="text-sm text-[#6F6A62]">
              Selecione um aluno e um treino modelo ativo.
            </p>
          </div>

          {assignWorkoutMutation.isSuccess && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">
                Treino atribuído com sucesso.
              </p>
              <p className="mt-1 text-sm text-green-600">
                O aluno já pode visualizar o treino atual.
              </p>
            </div>
          )}

          {assignWorkoutMutation.isError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Erro ao atribuir treino.
              </p>
              <p className="mt-1 text-sm text-red-600">
                {getAssignErrorMessage()}
              </p>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={handleSubmitAssignWorkout(handleAssignWorkout)}
          >
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
                {...registerAssignWorkout("studentId", { valueAsNumber: true })}
              >
                <option value={0}>Selecione um aluno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>

              {assignWorkoutErrors.studentId && (
                <p className="mt-2 text-sm text-red-600">
                  {assignWorkoutErrors.studentId.message}
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
                  isLoading ||
                  !hasActiveWorkouts ||
                  assignWorkoutMutation.isPending
                }
                {...registerAssignWorkout("workoutId", { valueAsNumber: true })}
              >
                <option value={0}>Selecione um treino</option>
                {activeWorkouts.map((workout) => (
                  <option key={workout.workoutId} value={workout.workoutId}>
                    {workout.workoutName}
                  </option>
                ))}
              </select>

              {assignWorkoutErrors.workoutId && (
                <p className="mt-2 text-sm text-red-600">
                  {assignWorkoutErrors.workoutId.message}
                </p>
              )}

              {!isLoading && !hasActiveWorkouts && (
                <p className="mt-2 text-sm text-[#6F6A62]">
                  Nenhum treino ativo disponível para atribuição.
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
      </div>
    </>
  );
}
