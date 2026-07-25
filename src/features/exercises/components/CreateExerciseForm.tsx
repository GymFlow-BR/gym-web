import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  createExercise,
  uploadExerciseImage,
  uploadExerciseVideo,
} from "../services/exerciseService";
import type { CreateExerciseRequest, Exercise } from "../types/exercise";

const createExerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),

  muscleGroup: z
    .string()
    .trim()
    .min(2, "O grupo muscular deve ter pelo menos 2 caracteres.")
    .max(80, "O grupo muscular deve ter no máximo 80 caracteres."),

  equipmentName: z
    .string()
    .trim()
    .min(2, "O equipamento deve ter pelo menos 2 caracteres.")
    .max(80, "O equipamento deve ter no máximo 80 caracteres."),

  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

type CreateExerciseFormData = z.infer<typeof createExerciseSchema>;

function normalizeOptionalValue(value?: string) {
  if (!value || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function toCreateExerciseRequest(
  data: CreateExerciseFormData,
  organizationId: number,
): CreateExerciseRequest {
  const payload: CreateExerciseRequest = {
    organizationId,
    exerciseName: data.exerciseName.trim(),
    muscleGroup: data.muscleGroup.trim(),
    equipmentName: data.equipmentName.trim(),
  };

  const description = normalizeOptionalValue(data.description);

  if (description) {
    payload.description = description;
  }

  return payload;
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

export function CreateExerciseForm() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthenticatedUser();

  const [createdExercise, setCreatedExercise] = useState<Exercise | null>(null);
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
  } = useForm<CreateExerciseFormData>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      exerciseName: "",
      muscleGroup: "",
      equipmentName: "",
      description: "",
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: async (exercise) => {
      setCreatedExercise(exercise);
      setMediaSuccessMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ exerciseId, file }: { exerciseId: number; file: File }) =>
      uploadExerciseImage(exerciseId, file),
    onSuccess: async (exercise) => {
      setCreatedExercise(exercise);
      clearSelectedImageFile();
      setMediaSuccessMessage("Imagem enviada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: ({ exerciseId, file }: { exerciseId: number; file: File }) =>
      uploadExerciseVideo(exerciseId, file),
    onSuccess: async (exercise) => {
      setCreatedExercise(exercise);
      clearSelectedVideoFile();
      setMediaSuccessMessage("Vídeo enviado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const createErrorMessage =
    isApiError(createExerciseMutation.error) &&
    createExerciseMutation.error.status === 403
      ? "Você não possui permissão para cadastrar exercícios."
      : "Não foi possível cadastrar o exercício. Tente novamente.";

  function clearSelectedImageFile() {
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function clearSelectedVideoFile() {
    setVideoFile(null);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function handleRemoveSelectedImage() {
    uploadImageMutation.reset();
    setMediaSuccessMessage(null);
    clearSelectedImageFile();
  }

  function handleRemoveSelectedVideo() {
    uploadVideoMutation.reset();
    setMediaSuccessMessage(null);
    clearSelectedVideoFile();
  }

  function handleCreateExercise(data: CreateExerciseFormData) {
    if (!user) {
      return;
    }

    createExerciseMutation.mutate(
      toCreateExerciseRequest(data, user.organizationId),
    );
  }

  function handleUploadImage() {
    if (!createdExercise || !imageFile) {
      return;
    }

    setMediaSuccessMessage(null);
    uploadImageMutation.reset();
    uploadVideoMutation.reset();

    uploadImageMutation.mutate({
      exerciseId: createdExercise.id,
      file: imageFile,
    });
  }

  function handleUploadVideo() {
    if (!createdExercise || !videoFile) {
      return;
    }

    setMediaSuccessMessage(null);
    uploadImageMutation.reset();
    uploadVideoMutation.reset();

    uploadVideoMutation.mutate({
      exerciseId: createdExercise.id,
      file: videoFile,
    });
  }

  function handleFinishCreateFlow() {
    setCreatedExercise(null);
    setMediaSuccessMessage(null);
    clearSelectedImageFile();
    clearSelectedVideoFile();
    createExerciseMutation.reset();
    uploadImageMutation.reset();
    uploadVideoMutation.reset();
    reset();
  }

  if (createdExercise) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
        <div className="border-b border-[#E4DFD6] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
            Biblioteca de exercícios
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
            Adicionar mídia demonstrativa
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
            O exercício foi criado. Agora você pode enviar uma imagem e um vídeo
            demonstrativo, ou pular esta etapa e adicionar mídia depois.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">
              Exercício criado com sucesso.
            </p>
            <p className="mt-1 text-sm text-green-700">
              {createdExercise.exerciseName}
            </p>
          </div>

          {mediaSuccessMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                {mediaSuccessMessage}
              </p>
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

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Imagem do exercício
              </p>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Use uma imagem demonstrativa da execução ou posição inicial.
              </p>

              {createdExercise.imageUrl && (
                <img
                  src={createdExercise.imageUrl}
                  alt={`Imagem do exercício ${createdExercise.exerciseName}`}
                  className="mt-4 max-h-56 w-full rounded-2xl object-cover"
                />
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  uploadImageMutation.reset();
                  setMediaSuccessMessage(null);
                  setImageFile(event.target.files?.[0] ?? null);
                }}
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
                  : "Enviar imagem"}
              </Button>
            </div>

            <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Vídeo do exercício
              </p>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Envie um vídeo curto demonstrando a execução correta.
              </p>

              {createdExercise.videoUrl && (
                <a
                  href={createdExercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-sm font-semibold text-[#2F4F3E] hover:underline"
                >
                  Ver vídeo enviado
                </a>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(event) => {
                  uploadVideoMutation.reset();
                  setMediaSuccessMessage(null);
                  setVideoFile(event.target.files?.[0] ?? null);
                }}
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
                  : "Enviar vídeo"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleFinishCreateFlow}
              disabled={
                uploadImageMutation.isPending || uploadVideoMutation.isPending
              }
              className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-5 py-3 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Pular por enquanto
            </button>

            <Button
              type="button"
              onClick={handleFinishCreateFlow}
              disabled={
                uploadImageMutation.isPending || uploadVideoMutation.isPending
              }
            >
              Finalizar cadastro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
      <div className="border-b border-[#E4DFD6] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Biblioteca de exercícios
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[#1F1F1F]">
          Novo exercício
        </h2>

        <p className="mt-1 max-w-2xl text-sm text-[#6F6A62]">
          Cadastre os dados básicos do exercício. Depois você poderá adicionar
          imagem e vídeo demonstrativo.
        </p>
      </div>

      <div className="p-5">
        {createExerciseMutation.isError && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Erro ao cadastrar exercício.
            </p>

            <p className="mt-1 text-sm text-red-600">{createErrorMessage}</p>
          </div>
        )}

        <form
          className="grid gap-4 lg:grid-cols-12"
          onSubmit={handleSubmit(handleCreateExercise)}
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
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[#1F1F1F]"
            >
              Descrição
            </label>

            <textarea
              id="description"
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              className="min-h-28 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
              placeholder="Descreva brevemente a execução do exercício"
              {...register("description")}
            />

            {errors.description?.message && (
              <p id="description-error" className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-end lg:col-span-4 lg:justify-end">
            <Button
              type="submit"
              className="w-full lg:w-auto"
              disabled={createExerciseMutation.isPending || !user}
            >
              {createExerciseMutation.isPending
                ? "Cadastrando..."
                : "Criar exercício"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
