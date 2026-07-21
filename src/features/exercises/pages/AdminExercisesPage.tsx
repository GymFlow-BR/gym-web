import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "../../../components/layout/PageHeader";
import { isApiError } from "../../../services/apiError";
import { CreateExerciseForm } from "../components/CreateExerciseForm";
import { EditExerciseForm } from "../components/EditExerciseForm";
import { deactivateExercise, getExercises } from "../services/exerciseService";
import type { Exercise } from "../types/exercise";

export function AdminExercisesPage() {
  const queryClient = useQueryClient();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const {
    data: exercises,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });

  const deactivateExerciseMutation = useMutation<void, Error, number>({
    mutationFn: (exerciseId: number) => deactivateExercise(exerciseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const deactivateErrorMessage =
    isApiError(deactivateExerciseMutation.error) &&
    deactivateExerciseMutation.error.status === 403
      ? "Você não possui permissão para inativar exercícios."
      : "Não foi possível inativar o exercício. Tente novamente.";

  function handleDeactivateExercise(exerciseId: number) {
    deactivateExerciseMutation.mutate(exerciseId);
  }

  function handleEditExercise(exercise: Exercise) {
    setSelectedExercise(exercise);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setSelectedExercise(null);
  }

  function handleUpdateSuccess() {
    setSelectedExercise(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercícios"
        description="Gerencie a biblioteca de exercícios usados na montagem dos treinos."
      />

      {selectedExercise ? (
        <EditExerciseForm
          exercise={selectedExercise}
          onCancel={handleCancelEdit}
          onSuccess={handleUpdateSuccess}
        />
      ) : (
        <CreateExerciseForm />
      )}

      {deactivateExerciseMutation.isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao inativar exercício.
          </p>

          <p className="mt-1 text-sm text-red-600">{deactivateErrorMessage}</p>
        </div>
      )}

      {isLoading && (
        <div
          role="status"
          className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Carregando exercícios cadastrados...
          </p>

          <p className="mt-1 text-sm text-[#6F6A62]">
            Estamos buscando os exercícios disponíveis para montagem dos
            treinos.
          </p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm"
        >
          <p className="font-semibold text-red-700">
            Não foi possível carregar os exercícios.
          </p>

          <p className="mt-2 text-sm text-red-600">
            Verifique se a API está rodando e se o usuário possui permissão para
            acessar este recurso.
          </p>

          <p className="mt-3 text-xs text-red-500">
            {error instanceof Error
              ? error.message
              : "Erro inesperado ao comunicar com a API."}
          </p>
        </div>
      )}

      {!isLoading && !isError && exercises?.length === 0 && (
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
            Biblioteca de exercícios
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
            Nenhum exercício cadastrado
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-[#6F6A62]">
            Cadastre o primeiro exercício para começar a montar treinos modelo
            para seus alunos.
          </p>
        </div>
      )}

      {!isLoading && !isError && exercises && exercises.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
          <div className="border-b border-[#E4DFD6] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1F1F1F]">
                  Exercícios cadastrados
                </h2>

                <p className="mt-1 text-sm text-[#6F6A62]">
                  Mostrando {exercises.length} exercício
                  {exercises.length === 1 ? "" : "s"} cadastrado
                  {exercises.length === 1 ? "" : "s"}.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
                Biblioteca ativa
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#EDEAE3]">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] lg:grid-cols-[1fr_160px_160px_auto] lg:items-center"
              >
                <div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    {exercise.exerciseName}
                  </h3>

                  <p className="mt-1 max-w-3xl text-sm text-[#6F6A62]">
                    {exercise.description || "Sem descrição cadastrada."}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Grupo muscular</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {exercise.muscleGroup}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8A8378]">Equipamento</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {exercise.equipmentName || "Não informado"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <span
                    className={[
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      exercise.active
                        ? "bg-[#2F4F3E]/10 text-[#2F4F3E]"
                        : "bg-[#EDEAE3] text-[#6F6A62]",
                    ].join(" ")}
                  >
                    {exercise.active ? "Ativo" : "Inativo"}
                  </span>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      title="Editar exercício"
                      onClick={() => handleEditExercise(exercise)}
                      disabled={deactivateExerciseMutation.isPending}
                      className="w-fit rounded-full border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-1 text-xs font-semibold text-[#2F4F3E] transition hover:border-[#2F4F3E] hover:bg-[#2F4F3E]/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      title="Inativar exercício"
                      onClick={() => handleDeactivateExercise(exercise.id)}
                      disabled={deactivateExerciseMutation.isPending}
                      className="w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deactivateExerciseMutation.isPending
                        ? "Inativando..."
                        : "Inativar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
