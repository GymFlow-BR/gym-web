import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import { isApiError } from "../../../services/apiError";
import { getStudentCurrentWorkout } from "../../student-workout/services/studentWorkoutService";
import { getStudentsByOrganization } from "../services/studentService";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";

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

export function StudentDetailsPage() {
  const params = useParams();
  const authenticatedUserQuery = useAuthenticatedUser();

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

  const student = studentsQuery.data?.find((item) => item.id === studentId);

  const isLoading = studentsQuery.isLoading || currentWorkoutQuery.isLoading;
  const hasInvalidStudentId = !Number.isFinite(studentId) || studentId <= 0;

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
        description="Visualize os dados do aluno e o treino atual atribuído."
      />

      <div className="mb-6">
        <Link
          to="/admin/students"
          className="text-sm font-semibold text-[#2F4F3E] hover:underline"
        >
          ← Voltar para alunos
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <Card>
          <div className="mb-5 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              Dados básicos
            </p>

            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Informações do aluno
            </h2>

            <p className="text-sm text-[#6F6A62]">
              Dados vinculados à organização atual.
            </p>
          </div>

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

          {student && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Nome
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {student.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Email
                </p>
                <p className="mt-1 text-sm text-[#6F6A62]">{student.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Status
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

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                  Organização
                </p>
                <p className="mt-1 text-sm text-[#6F6A62]">
                  {student.organizationName}
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              Treino atual
            </p>

            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Treino atribuído
            </h2>

            <p className="text-sm text-[#6F6A62]">
              Acompanhe o treino atual que o aluno visualiza na área mobile.
            </p>
          </div>

          {isLoading && (
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
            currentWorkoutQuery.isError &&
            isCurrentWorkoutNotFound(currentWorkoutQuery.error) && (
              <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  Nenhum treino atual
                </p>
                <p className="mt-1 text-sm text-[#6F6A62]">
                  Este aluno ainda não possui um treino atual atribuído.
                </p>
              </div>
            )}

          {!isLoading &&
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

          {!isLoading && currentWorkoutQuery.data && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                      Nome do treino
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#1F1F1F]">
                      {currentWorkoutQuery.data.workoutName}
                    </p>
                    <p className="mt-1 text-sm text-[#6F6A62]">
                      Atribuído em{" "}
                      {formatDate(currentWorkoutQuery.data.assignedAt)}
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {currentWorkoutQuery.data.status === "ACTIVE"
                      ? "ATIVO"
                      : currentWorkoutQuery.data.status}
                  </span>
                </div>
              </div>

              {currentWorkoutQuery.data.exercises.length === 0 ? (
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
                    <span className="hidden text-center md:block">Séries</span>
                    <span className="hidden text-center md:block">Reps</span>
                    <span className="hidden text-center md:block">
                      Descanso
                    </span>
                  </div>

                  <div className="divide-y divide-[#E4DFD6]">
                    {currentWorkoutQuery.data.exercises
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
      </div>
    </>
  );
}
