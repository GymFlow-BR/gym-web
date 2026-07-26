import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Upload, Video, X } from "lucide-react";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  createExercise,
  uploadExerciseImage,
  uploadExerciseVideo,
} from "../services/exerciseService";
import type { CreateExerciseRequest, Exercise } from "../types/exercise";

const schema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(1, "O nome do exercício é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100),
  muscleGroup: z
    .string()
    .trim()
    .min(1, "O grupo muscular é obrigatório.")
    .min(2, "O grupo muscular deve ter pelo menos 2 caracteres.")
    .max(80),
  equipmentName: z
    .string()
    .trim()
    .min(1, "O equipamento é obrigatório.")
    .min(2, "O equipamento deve ter pelo menos 2 caracteres.")
    .max(80),
  description: z
    .string()
    .trim()
    .max(500, "A orientação deve ter no máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;
type Props = { onCancel: () => void; onSuccess: () => void };

const fieldClass =
  "min-h-13 w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition placeholder:text-[#747d77] focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:opacity-60";

function uploadError(error: unknown) {
  if (isApiError(error) && error.status === 400)
    return "Arquivo inválido. Verifique o tipo e o tamanho.";
  if (isApiError(error) && error.status === 403)
    return "Você não possui permissão para enviar esta mídia.";
  return "O exercício foi criado, mas não foi possível enviar uma das mídias. Tente novamente.";
}

export function CreateExerciseForm({ onCancel, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { data: user } = useAuthenticatedUser();
  const [createdExercise, setCreatedExercise] = useState<Exercise | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      exerciseName: "",
      muscleGroup: "",
      equipmentName: "",
      description: "",
    },
  });

  const createMutation = useMutation({ mutationFn: createExercise });
  const imageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadExerciseImage(id, file),
  });
  const videoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadExerciseVideo(id, file),
  });

  const isPending =
    createMutation.isPending ||
    imageMutation.isPending ||
    videoMutation.isPending;
  const mediaError = imageMutation.error ?? videoMutation.error;

  async function submit(data: FormData) {
    if (!user) return;

    try {
      let exercise = createdExercise;

      if (!exercise) {
        const payload: CreateExerciseRequest = {
          organizationId: user.organizationId,
          exerciseName: data.exerciseName.trim(),
          muscleGroup: data.muscleGroup.trim(),
          equipmentName: data.equipmentName.trim(),
          ...(data.description?.trim()
            ? { description: data.description.trim() }
            : {}),
        };
        exercise = await createMutation.mutateAsync(payload);
        setCreatedExercise(exercise);
      }

      if (imageFile) {
        exercise = await imageMutation.mutateAsync({
          id: exercise.id,
          file: imageFile,
        });
        setCreatedExercise(exercise);
        setImageFile(null);
      }

      if (videoFile) {
        exercise = await videoMutation.mutateAsync({
          id: exercise.id,
          file: videoFile,
        });
        setCreatedExercise(exercise);
        setVideoFile(null);
      }

      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess();
    } catch {
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    }
  }

  const createError =
    isApiError(createMutation.error) && createMutation.error.status === 403
      ? "Você não possui permissão para cadastrar exercícios."
      : "Não foi possível cadastrar o exercício. Tente novamente.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-exercise-title"
        className="my-auto w-full max-w-4xl rounded-[22px] border border-[#343b37] bg-[#171a18] p-6 text-[#f5f7f5] shadow-2xl shadow-black/60 sm:p-8"
      >
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#929d96]">
              Biblioteca de exercícios
            </p>
            <h2
              id="create-exercise-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.03em]"
            >
              Novo exercício
            </h2>
            <p className="mt-3 text-sm text-[#939e97]">
              Cadastre os dados básicos e adicione mídias demonstrativas.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            aria-label="Fechar"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#343b37] text-[#909a93] transition hover:bg-[#232825] hover:text-white disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        {(createMutation.isError || mediaError) && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#6d3838] bg-[#281818] p-4 text-sm text-[#ff9292]"
          >
            {mediaError ? uploadError(mediaError) : createError}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
          <div className="grid gap-4 lg:grid-cols-12">
            <Field
              label="Nome do exercício"
              error={errors.exerciseName?.message}
              className="lg:col-span-5"
            >
              <input
                disabled={Boolean(createdExercise)}
                className={fieldClass}
                placeholder="Ex.: Elevação lateral"
                {...register("exerciseName")}
              />
            </Field>
            <Field
              label="Grupo muscular"
              error={errors.muscleGroup?.message}
              className="lg:col-span-3"
            >
              <input
                disabled={Boolean(createdExercise)}
                className={fieldClass}
                placeholder="Ex.: Ombros"
                {...register("muscleGroup")}
              />
            </Field>
            <Field
              label="Equipamento"
              error={errors.equipmentName?.message}
              className="lg:col-span-4"
            >
              <input
                disabled={Boolean(createdExercise)}
                className={fieldClass}
                placeholder="Ex.: Halteres"
                {...register("equipmentName")}
              />
            </Field>
          </div>

          <Field label="Orientação" error={errors.description?.message}>
            <textarea
              disabled={Boolean(createdExercise)}
              className={`${fieldClass} min-h-24 py-4`}
              placeholder="Descreva brevemente a execução do exercício."
              {...register("description")}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <UploadField
              title="Imagem do exercício"
              helper="JPG ou PNG, até 10 MB."
              action="Adicionar imagem"
              file={imageFile}
              accept="image/*"
              icon={<ImageIcon size={20} />}
              inputRef={imageRef}
              onChange={setImageFile}
              onRemove={() => {
                setImageFile(null);
                if (imageRef.current) imageRef.current.value = "";
              }}
            />
            <UploadField
              title="Vídeo do exercício"
              helper="MP4 ou MOV, até 100 MB."
              action="Adicionar vídeo"
              file={videoFile}
              accept="video/*"
              icon={<Video size={20} />}
              inputRef={videoRef}
              onChange={setVideoFile}
              onRemove={() => {
                setVideoFile(null);
                if (videoRef.current) videoRef.current.value = "";
              }}
            />
          </div>

          <footer className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="min-h-12 rounded-xl border border-[#3a423d] px-5 text-sm font-semibold transition hover:bg-[#222724] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !user}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-6 text-sm font-semibold text-[#07110b] transition hover:bg-[#83e9a8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusIcon />
              {isPending
                ? "Salvando..."
                : createdExercise
                  ? "Tentar enviar mídia"
                  : "Criar exercício"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-medium text-[#d5dad6]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 block text-sm text-[#ff8585]">{error}</span>
      )}
    </label>
  );
}

function UploadField({
  title,
  helper,
  action,
  file,
  accept,
  icon,
  inputRef,
  onChange,
  onRemove,
}: {
  title: string;
  helper: string;
  action: string;
  file: File | null;
  accept: string;
  icon: ReactNode;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#303733] bg-[#191d1b] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-[#89938d]">{helper}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#376146] bg-[#1b251f] p-4 transition hover:border-[#70e39b] hover:bg-[#1e2c24]"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#244333] text-[#70e39b]">
          {file ? icon : <Upload size={21} />}
        </span>
        <span className="mt-3 max-w-full truncate text-sm font-semibold">
          {file?.name ?? action}
        </span>
        <span className="mt-1 text-xs text-[#859088]">
          {file ? "Clique para substituir" : helper.split(",")[0]}
        </span>
      </button>
      {file && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 text-xs font-semibold text-[#ff8585] hover:text-[#ffaaaa]"
        >
          Remover arquivo
        </button>
      )}
    </div>
  );
}

function PlusIcon() {
  return <span className="text-xl font-light leading-none">+</span>;
}
