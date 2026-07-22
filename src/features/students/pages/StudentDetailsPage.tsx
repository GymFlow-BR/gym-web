import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  getStudentCurrentWorkout,
  getStudentWorkouts,
} from "../../student-workout/services/studentWorkoutService";
import { getWorkouts } from "../../workouts/services/workoutService";
import { AssignWorkoutToStudentForm } from "../components/AssignWorkoutToStudentForm";
import { EditStudentForm } from "../components/EditStudentForm";
import { getStudentsByOrganization } from "../services/studentService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function isCurrentWorkoutNotFound(error: unknown) {
  return isApiError(error) && error.status === 404;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatStatus(status: string) {
  if (status === "ACTIVE") {
    return "Ativo";
  }

  if (status === "INACTIVE") {
    return "Inativo";
  }

  if (status === "ARCHIVED") {
    return "Arquivado";
  }

  return status;
}

export function StudentDetailsPage() {
  const params = useParams();
  const authenticatedUserQuery = useAuthenticatedUser();

  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentSuccessMessage, setStudentSuccessMessage] = useState<
    string | null
  >(null);

  const [isAssigningWorkout, setIsAssigningWorkout] = useState(false);
  const [workoutSuccessMessage, setWorkoutSuccessMessage] = useState<
    string | null
  >(null);

  const studentId = Number(params.studentId);
  const organizationId = authenticatedUserQuery.data?.organizationId;

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const currentWorkoutQuery = useQuery({
    queryKey: ["student-current-workout", studentId],
    queryFn: () => getStudentCurrentWorkout(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
    retry: false,
  });

  const studentWorkoutsQuery = useQuery({
    queryKey: ["student-workouts", studentId],
    queryFn: () => getStudentWorkouts(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
  });

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
    enabled: isAssigningWorkout,
  });

  const student = studentsQuery.data?.find((item) => item.id === studentId);
  const currentWorkout = currentWorkoutQuery.data;

  const studentWorkoutHistory =
    studentWorkoutsQuery.data
      ?.slice()
      .sort(
        (firstWorkout, secondWorkout) =>
          new Date(secondWorkout.assignedAt).getTime() -
          new Date(firstWorkout.assignedAt).getTime(),
      ) ?? [];

  const activeWorkouts =
    workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? [];

  const isLoading = studentsQuery.isLoading || currentWorkoutQuery.isLoading;
  const hasInvalidStudentId = !Number.isFinite(studentId) || studentId <= 0;

  function handleStartEditingStudent() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsAssigningWorkout(false);
    setIsEditingStudent(true);
  }

  function handleCancelEditingStudent() {
    setStudentSuccessMessage(null);
    setIsEditingStudent(false);
  }

  function handleStartAssigningWorkout() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsEditingStudent(false);
    setIsAssigningWorkout(true);
  }

  function handleCancelAssigningWorkout() {
    setWorkoutSuccessMessage(null);
    setIsAssigningWorkout(false);
  }

  if (hasInvalidStudentId) {
    return (
      <>
        <PageHeader
          title="Aluno não encontrado"
          description="O identificador informado na URL não é válido."
        />

        <Card>
          <Link
            to="/admin/students"
            className="text-sm font-semibold text-[#2F4F3E] hover:underline"
          >
            Voltar para alunos
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={student?.name ?? "Detalhes do aluno"}
        description="Centralize os dados do aluno, acompanhe o treino atual e gerencie informações básicas."
      />

      <div className="mb-6">
        <Link
          to="/admin/students"
          className="text-sm font-semibold text-[#2F4F3E] hover:underline"
        >
          ← Voltar para alunos
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Perfil do aluno
                </p>

                <h2 className="text-lg font-semibold text-[#1F1F1F]">
                  Informações principais
                </h2>

                <p className="text-sm text-[#6F6A62]">
                  Dados básicos vinculados à organização atual.
                </p>
              </div>

              {student && !isEditingStudent && (
                <button
                  type="button"
                  onClick={handleStartEditingStudent}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#2F4F3E] px-4 text-sm font-semibold text-white transition hover:bg-[#243D30]"
                >
                  Editar
                </button>
              )}
            </div>

            {studentSuccessMessage && !isEditingStudent && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-700">
                  {studentSuccessMessage}
                </p>
              </div>
            )}

            {studentsQuery.isLoading && (
              <div
                role="status"
                className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
              >
                <p className="text-sm text-[#6F6A62]">
                  Carregando dados do aluno...
                </p>
              </div>
            )}

            {studentsQuery.isError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-semibold text-red-700">
                  Erro ao carregar aluno.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Não foi possível buscar os dados do aluno.
                </p>
              </div>
            )}

            {!studentsQuery.isLoading && !studentsQuery.isError && !student && (
              <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  Aluno não encontrado
                </p>
                <p className="mt-1 text-sm text-[#6F6A62]">
                  Verifique se o aluno pertence à sua organização.
                </p>
              </div>
            )}

            {student && isEditingStudent && (
              <EditStudentForm
                student={student}
                onCancel={handleCancelEditingStudent}
                onSuccess={() => {
                  setIsEditingStudent(false);
                  setStudentSuccessMessage("Aluno atualizado com sucesso.");
                }}
              />
            )}

            {student && !isEditingStudent && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2F4F3E] text-base font-bold text-white">
                      {getInitials(student.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#1F1F1F]">
                        {student.name}
                      </p>
                      <p className="truncate text-sm text-[#6F6A62]">
                        {student.email}
                      </p>

                      <span
                        className={
                          student.active
                            ? "mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                            : "mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                        }
                      >
                        {student.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                      Nome completo
                    </p>
                    <p className="mt-1 text-sm text-[#1F1F1F]">
                      {student.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                      Email
                    </p>
                    <p className="mt-1 break-words text-sm text-[#1F1F1F]">
                      {student.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                      Organização
                    </p>
                    <p className="mt-1 text-sm text-[#1F1F1F]">
                      {student.organizationName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {student && !isEditingStudent && (
            <Card>
              <div className="mb-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Ações do aluno
                </p>

                <h2 className="text-lg font-semibold text-[#1F1F1F]">
                  Gerenciamento
                </h2>

                <p className="text-sm text-[#6F6A62]">
                  Gerencie dados básicos e vínculo de treino deste aluno.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartEditingStudent}
                className="flex w-full items-center justify-between rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] px-4 py-3 text-left transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
              >
                <span>
                  <span className="block text-sm font-semibold text-[#1F1F1F]">
                    Editar dados básicos
                  </span>
                  <span className="mt-1 block text-sm text-[#6F6A62]">
                    Atualize nome e email do aluno.
                  </span>
                </span>

                <span className="text-sm font-semibold text-[#2F4F3E]">
                  Editar
                </span>
              </button>

              <button
                type="button"
                onClick={handleStartAssigningWorkout}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] px-4 py-3 text-left transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
              >
                <span>
                  <span className="block text-sm font-semibold text-[#1F1F1F]">
                    {currentWorkout ? "Trocar treino" : "Atribuir treino"}
                  </span>
                  <span className="mt-1 block text-sm text-[#6F6A62]">
                    {currentWorkout
                      ? "Substitua o treino ativo por outro treino disponível."
                      : "Vincule um treino ativo a este aluno."}
                  </span>
                </span>

                <span className="text-sm font-semibold text-[#2F4F3E]">
                  {currentWorkout ? "Trocar" : "Atribuir"}
                </span>
              </button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Treino atual
              </p>

              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Treino atribuído
              </h2>

              <p className="text-sm text-[#6F6A62]">
                Acompanhe o treino atual deste aluno.
              </p>
            </div>

            {workoutSuccessMessage && !isAssigningWorkout && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-700">
                  {workoutSuccessMessage}
                </p>
              </div>
            )}

            {isAssigningWorkout && (
              <div className="mb-5 rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-5">
                <div className="mb-5 flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                    {currentWorkout
                      ? "Troca de treino"
                      : "Atribuição de treino"}
                  </p>

                  <h3 className="text-base font-semibold text-[#1F1F1F]">
                    {currentWorkout ? "Trocar treino atual" : "Atribuir treino"}
                  </h3>

                  <p className="text-sm text-[#6F6A62]">
                    Selecione um treino ativo para este aluno.
                  </p>
                </div>

                <AssignWorkoutToStudentForm
                  studentId={studentId}
                  activeWorkouts={activeWorkouts}
                  currentWorkoutId={currentWorkout?.workoutId}
                  isLoading={workoutsQuery.isLoading}
                  onCancel={handleCancelAssigningWorkout}
                  onSuccess={async () => {
                    await currentWorkoutQuery.refetch();
                    await studentWorkoutsQuery.refetch();

                    setIsAssigningWorkout(false);
                    setWorkoutSuccessMessage(
                      currentWorkout
                        ? "Treino atualizado com sucesso."
                        : "Treino atribuído com sucesso.",
                    );
                  }}
                />
              </div>
            )}

            {isLoading && !isAssigningWorkout && (
              <div
                role="status"
                className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
              >
                <p className="text-sm text-[#6F6A62]">
                  Carregando treino atual...
                </p>
              </div>
            )}

            {!isLoading &&
              !isAssigningWorkout &&
              currentWorkoutQuery.isError &&
              isCurrentWorkoutNotFound(currentWorkoutQuery.error) && (
                <div className="rounded-3xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F0E8] text-lg font-bold text-[#2F4F3E]">
                    —
                  </div>

                  <p className="text-sm font-semibold text-[#1F1F1F]">
                    Nenhum treino atual
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#6F6A62]">
                    Este aluno ainda não possui um treino ativo atribuído.
                  </p>

                  <button
                    type="button"
                    onClick={handleStartAssigningWorkout}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-[#D8D2C8] bg-[#FFFEFB] px-4 text-sm font-semibold text-[#2F4F3E] transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
                  >
                    Atribuir treino
                  </button>
                </div>
              )}

            {!isLoading &&
              !isAssigningWorkout &&
              currentWorkoutQuery.isError &&
              !isCurrentWorkoutNotFound(currentWorkoutQuery.error) && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="text-sm font-semibold text-red-700">
                    Erro ao carregar treino.
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    Não foi possível carregar o treino atual do aluno. Tente
                    novamente.
                  </p>
                </div>
              )}

            {!isLoading && !isAssigningWorkout && currentWorkout && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                        Nome do treino
                      </p>

                      <p className="mt-1 text-xl font-semibold text-[#1F1F1F]">
                        {currentWorkout.workoutName}
                      </p>

                      <p className="mt-2 text-sm text-[#6F6A62]">
                        Atribuído em {formatDate(currentWorkout.assignedAt)}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {formatStatus(currentWorkout.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                        Exercícios
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                        {currentWorkout.exercises.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                        {formatStatus(currentWorkout.status)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                        Atribuição
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                        {formatDate(currentWorkout.assignedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {currentWorkout.exercises.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      Treino sem exercícios
                    </p>
                    <p className="mt-1 text-sm text-[#6F6A62]">
                      Este treino ainda não possui exercícios vinculados.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#E4DFD6]">
                    <div className="grid bg-[#FAF9F6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8A8378] md:grid-cols-[64px_minmax(220px,1fr)_120px_120px_120px] md:gap-x-6">
                      <span className="text-center">Ordem</span>
                      <span>Exercício</span>
                      <span className="hidden text-center md:block">
                        Séries
                      </span>
                      <span className="hidden text-center md:block">Reps</span>
                      <span className="hidden text-center md:block">
                        Descanso
                      </span>
                    </div>

                    <div className="divide-y divide-[#E4DFD6]">
                      {currentWorkout.exercises
                        .slice()
                        .sort(
                          (firstExercise, secondExercise) =>
                            firstExercise.exerciseOrder -
                            secondExercise.exerciseOrder,
                        )
                        .map((exercise) => (
                          <div
                            key={exercise.workoutExerciseId}
                            className="grid gap-3 px-4 py-4 md:grid-cols-[64px_minmax(220px,1fr)_120px_120px_120px] md:items-center md:gap-x-6"
                          >
                            <div className="flex justify-center">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2F4F3E] text-sm font-semibold text-white">
                                {exercise.exerciseOrder}
                              </span>
                            </div>

                            <div>
                              <p className="font-medium text-[#1F1F1F]">
                                {exercise.exerciseName}
                              </p>

                              <p className="mt-1 text-sm text-[#6F6A62]">
                                {exercise.muscleGroup ??
                                  "Grupo muscular não informado"}
                                {exercise.equipmentName
                                  ? ` • ${exercise.equipmentName}`
                                  : ""}
                              </p>

                              {exercise.notes && (
                                <p className="mt-2 text-sm text-[#8A8378]">
                                  {exercise.notes}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2 text-xs md:hidden">
                                <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                                  {exercise.sets} séries
                                </span>
                                <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                                  {exercise.reps} reps
                                </span>
                                <span className="rounded-full bg-[#FAF9F6] px-3 py-1 font-semibold text-[#6F6A62]">
                                  {exercise.restTimeSeconds
                                    ? `${exercise.restTimeSeconds}s`
                                    : "Sem descanso"}
                                </span>
                              </div>
                            </div>

                            <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                              {exercise.sets}
                            </div>

                            <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                              {exercise.reps}
                            </div>

                            <div className="hidden items-center justify-center text-sm text-[#6F6A62] md:flex">
                              {exercise.restTimeSeconds
                                ? `${exercise.restTimeSeconds}s`
                                : "-"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Treinos
              </p>

              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Treinos atribuídos
              </h2>

              <p className="text-sm text-[#6F6A62]">
                Veja os treinos que já foram vinculados a este aluno.
              </p>
            </div>

            {studentWorkoutsQuery.isLoading && (
              <div
                role="status"
                className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
              >
                <p className="text-sm text-[#6F6A62]">
                  Carregando treinos atribuídos...
                </p>
              </div>
            )}

            {studentWorkoutsQuery.isError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-semibold text-red-700">
                  Erro ao carregar treinos atribuídos.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Não foi possível buscar os treinos vinculados a este aluno.
                </p>
              </div>
            )}

            {!studentWorkoutsQuery.isLoading &&
              !studentWorkoutsQuery.isError &&
              studentWorkoutHistory.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
                  <p className="text-sm font-semibold text-[#1F1F1F]">
                    Nenhum treino vinculado
                  </p>
                  <p className="mt-1 text-sm text-[#6F6A62]">
                    Este aluno ainda não recebeu nenhum treino.
                  </p>
                </div>
              )}

            {!studentWorkoutsQuery.isLoading &&
              !studentWorkoutsQuery.isError &&
              studentWorkoutHistory.length > 0 && (
                <div className="space-y-3">
                  {studentWorkoutHistory.map((studentWorkout) => {
                    const isActive = studentWorkout.status === "ACTIVE";

                    return (
                      <div
                        key={studentWorkout.studentWorkoutId}
                        className={
                          isActive
                            ? "rounded-2xl border border-green-200 bg-green-50 p-4"
                            : "rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
                        }
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p
                              className={
                                isActive
                                  ? "text-sm font-semibold text-green-800"
                                  : "text-sm font-semibold text-[#1F1F1F]"
                              }
                            >
                              {studentWorkout.workoutName}
                            </p>

                            <p
                              className={
                                isActive
                                  ? "mt-1 text-sm text-green-700"
                                  : "mt-1 text-sm text-[#6F6A62]"
                              }
                            >
                              Atribuído em{" "}
                              {formatDate(studentWorkout.assignedAt)}
                            </p>
                          </div>

                          <span
                            className={
                              isActive
                                ? "inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700"
                                : "inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                            }
                          >
                            {formatStatus(studentWorkout.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </Card>
        </div>
      </div>
    </>
  );
}
