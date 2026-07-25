import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { isApiError } from "../../../services/apiError";
import {
  updateExercise,
  uploadExerciseImage,
  uploadExerciseVideo,
} from "../services/exerciseService";
import type { Exercise, UpdateExerciseRequest } from "../types/exercise";

const editExerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),

  muscleGroup: z
    .string()
    .trim()
    .min(2, "O grupo muscular deve ter pelo menos 2 caracteres.")
    .max(80, "O grupo muscular deve ter no máximo 80 caracteres."),

  equipmentName: z
    .string()
    .trim()
    .min(2, "O equipamento deve ter pelo menos 2 caracteres.")
    .max(120, "O equipamento deve ter no máximo 120 caracteres."),

  description: z
    .string()
    .trim()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
});

type EditExerciseFormData = z.infer<typeof editExerciseSchema>;

type EditExerciseFormProps = {
  exercise: Exercise;
  onCancel: () => void;
  onSuccess: () => void;
};

function normalizeOptionalValue(value?: string) {
  if (!value || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

function toUpdateExerciseRequest(
  data: EditExerciseFormData,
  exercise: Exercise,
): UpdateExerciseRequest {
  return {
    exerciseName: data.exerciseName.trim(),
    muscleGroup: data.muscleGroup.trim(),
    equipmentName: data.equipmentName.trim(),
    description: normalizeOptionalValue(data.description),
    imageUrl: exercise.imageUrl ?? undefined,
    videoUrl: exercise.videoUrl ?? undefined,
  };
}

function getUploadErrorMessage(error: unknown) {
  if (isApiError(error) && error.status === 400) {
    return "Arquivo inválido. Verifique o tipo e o tamanho do arquivo.";
  }

  if (isApiError(error) && error.status === 403) {
    return "Você não possui permissão para enviar mídia para este exercício.";
  }

  return "Não foi possível enviar a mídia. Tente novamente.";
}

export function EditExerciseForm({
  exercise,
  onCancel,
  onSuccess,
}: EditExerciseFormProps) {
  const queryClient = useQueryClient();

  const [currentExercise, setCurrentExercise] = useState<Exercise>(exercise);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [mediaSuccessMessage, setMediaSuccessMessage] = useState<string | null>(
    null,
  );

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditExerciseFormData>({
    resolver: zodResolver(editExerciseSchema),
    defaultValues: {
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      equipmentName: exercise.equipmentName,
      description: exercise.description ?? "",
    },
  });

  useEffect(() => {
    setCurrentExercise(exercise);
    setImageFile(null);
    setVideoFile(null);
    setMediaSuccessMessage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    reset({
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      equipmentName: exercise.equipmentName,
      description: exercise.description ?? "",
    });
  }, [exercise, reset]);

  const updateExerciseMutation = useMutation({
    mutationFn: (data: UpdateExerciseRequest) =>
      updateExercise(currentExercise.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess();
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ exerciseId, file }: { exerciseId: number; file: File }) =>
      uploadExerciseImage(exerciseId, file),
    onSuccess: async (updatedExercise) => {
      setCurrentExercise(updatedExercise);
      handleRemoveSelectedImage();
      setMediaSuccessMessage("Imagem atualizada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: ({ exerciseId, file }: { exerciseId: number; file: File }) =>
      uploadExerciseVideo(exerciseId, file),
    onSuccess: async (updatedExercise) => {
      setCurrentExercise(updatedExercise);
      handleRemoveSelectedVideo();
      setMediaSuccessMessage("Vídeo atualizado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const updateErrorMessage =
    isApiError(updateExerciseMutation.error) &&
    updateExerciseMutation.error.status === 403
      ? "Você não possui permissão para editar exercícios."
      : "Não foi possível atualizar o exercício. Tente novamente.";

  function handleRemoveSelectedImage() {
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function handleRemoveSelectedVideo() {
    setVideoFile(null);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function handleUpdateExercise(data: EditExerciseFormData) {
    updateExerciseMutation.mutate(
      toUpdateExerciseRequest(data, currentExercise),
    );
  }

  function handleUploadImage() {
    if (!imageFile) {
      return;
    }

    setMediaSuccessMessage(null);

    uploadImageMutation.mutate({
      exerciseId: currentExercise.id,
      file: imageFile,
    });
  }

  function handleUploadVideo() {
    if (!videoFile) {
      return;
    }

    setMediaSuccessMessage(null);

    uploadVideoMutation.mutate({
      exerciseId: currentExercise.id,
      file: videoFile,
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
      <div className="border-b border-[#E4DFD6] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Biblioteca de exercícios
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
          Editar exercício
        </h2>

        <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
          Atualize os dados do exercício selecionado e substitua a mídia
          demonstrativa quando necessário.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {updateExerciseMutation.isError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Erro ao atualizar exercício.
            </p>

            <p className="mt-1 text-sm text-red-600">{updateErrorMessage}</p>
          </div>
        )}

        {(uploadImageMutation.isError || uploadVideoMutation.isError) && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Erro ao enviar mídia.
            </p>

            <p className="mt-1 text-sm text-red-600">
              {getUploadErrorMessage(
                uploadImageMutation.error ?? uploadVideoMutation.error,
              )}
            </p>
          </div>
        )}

        {mediaSuccessMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              {mediaSuccessMessage}
            </p>
          </div>
        )}

        <form
          className="grid gap-4 lg:grid-cols-12"
          onSubmit={handleSubmit(handleUpdateExercise)}
        >
          <div className="lg:col-span-6">
            <Input
              label="Nome do exercício"
              placeholder="Ex: Supino reto"
              error={errors.exerciseName?.message}
              {...register("exerciseName")}
            />
          </div>

          <div className="lg:col-span-3">
            <Input
              label="Grupo muscular"
              placeholder="Ex: Peito"
              error={errors.muscleGroup?.message}
              {...register("muscleGroup")}
            />
          </div>

          <div className="lg:col-span-3">
            <Input
              label="Equipamento"
              placeholder="Ex: Barra"
              error={errors.equipmentName?.message}
              {...register("equipmentName")}
            />
          </div>

          <div className="lg:col-span-8">
            <label
              htmlFor="edit-description"
              className="mb-2 block text-sm font-medium text-[#1F1F1F]"
            >
              Descrição
            </label>

            <textarea
              id="edit-description"
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={
                errors.description ? "edit-description-error" : undefined
              }
              className="min-h-28 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              placeholder="Descreva brevemente a execução do exercício"
              {...register("description")}
            />

            {errors.description?.message && (
              <p
                id="edit-description-error"
                className="mt-2 text-sm text-red-600"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:items-end lg:justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={updateExerciseMutation.isPending}
            >
              {updateExerciseMutation.isPending
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>

            <button
              type="button"
              onClick={onCancel}
              disabled={
                updateExerciseMutation.isPending ||
                uploadImageMutation.isPending ||
                uploadVideoMutation.isPending
              }
              className="w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-5 py-3 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="grid gap-5 border-t border-[#E4DFD6] pt-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
            <p className="text-sm font-semibold text-[#1F1F1F]">
              Imagem do exercício
            </p>

            <p className="mt-1 text-sm text-[#6F6A62]">
              Envie uma nova imagem para substituir a atual.
            </p>

            {currentExercise.imageUrl ? (
              <img
                src={currentExercise.imageUrl}
                alt={`Imagem do exercício ${currentExercise.exerciseName}`}
                className="mt-4 max-h-56 w-full rounded-2xl object-cover"
              />
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FFFEFB] p-4 text-sm text-[#6F6A62]">
                Nenhuma imagem enviada até o momento.
              </p>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              className="mt-4 block w-full text-sm text-[#6F6A62] file:mr-4 file:rounded-full file:border-0 file:bg-[#2F4F3E] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            {imageFile && (
              <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6F6A62]">
                  Arquivo selecionado:{" "}
                  <span className="font-semibold text-[#1F1F1F]">
                    {imageFile.name}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  disabled={uploadImageMutation.isPending}
                  className="text-left text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-right"
                >
                  Remover arquivo
                </button>
              </div>
            )}

            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!imageFile || uploadImageMutation.isPending}
              onClick={handleUploadImage}
            >
              {uploadImageMutation.isPending
                ? "Enviando imagem..."
                : "Substituir imagem"}
            </Button>
          </div>

          <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
            <p className="text-sm font-semibold text-[#1F1F1F]">
              Vídeo do exercício
            </p>

            <p className="mt-1 text-sm text-[#6F6A62]">
              Envie um novo vídeo para substituir o atual.
            </p>

            {currentExercise.videoUrl ? (
              <a
                href={currentExercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-sm font-semibold text-[#2F4F3E] hover:underline"
              >
                Ver vídeo enviado
              </a>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FFFEFB] p-4 text-sm text-[#6F6A62]">
                Nenhum vídeo enviado até o momento.
              </p>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(event) =>
                setVideoFile(event.target.files?.[0] ?? null)
              }
              className="mt-4 block w-full text-sm text-[#6F6A62] file:mr-4 file:rounded-full file:border-0 file:bg-[#2F4F3E] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            {videoFile && (
              <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6F6A62]">
                  Arquivo selecionado:{" "}
                  <span className="font-semibold text-[#1F1F1F]">
                    {videoFile.name}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleRemoveSelectedVideo}
                  disabled={uploadVideoMutation.isPending}
                  className="text-left text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-right"
                >
                  Remover arquivo
                </button>
              </div>
            )}

            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!videoFile || uploadVideoMutation.isPending}
              onClick={handleUploadVideo}
            >
              {uploadVideoMutation.isPending
                ? "Enviando vídeo..."
                : "Substituir vídeo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
