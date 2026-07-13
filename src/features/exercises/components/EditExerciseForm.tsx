import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { isApiError } from '../../../services/apiError'
import { updateExercise } from '../services/exerciseService'
import type { Exercise, UpdateExerciseRequest } from '../types/exercise'

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, 'A URL deve ter no máximo 500 caracteres.')
  .optional()
  .or(z.literal(''))
  .refine((value) => {
    if (!value) {
      return true
    }

    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }, 'Informe uma URL válida.')

const editExerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  muscleGroup: z
    .string()
    .trim()
    .min(2, 'O grupo muscular deve ter pelo menos 2 caracteres.')
    .max(80, 'O grupo muscular deve ter no máximo 80 caracteres.'),
  equipmentName: z
    .string()
    .trim()
    .min(2, 'O equipamento deve ter pelo menos 2 caracteres.')
    .max(120, 'O equipamento deve ter no máximo 120 caracteres.'),
  description: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .optional()
    .or(z.literal('')),
  imageUrl: optionalUrlSchema,
  videoUrl: optionalUrlSchema,
})

type EditExerciseFormData = z.infer<typeof editExerciseSchema>

type EditExerciseFormProps = {
  exercise: Exercise
  onCancel: () => void
  onSuccess: () => void
}

function normalizeOptionalValue(value?: string) {
  if (!value || value.trim() === '') {
    return undefined
  }

  return value.trim()
}

function toUpdateExerciseRequest(
  data: EditExerciseFormData,
): UpdateExerciseRequest {
  return {
    exerciseName: data.exerciseName.trim(),
    muscleGroup: data.muscleGroup.trim(),
    equipmentName: data.equipmentName.trim(),
    description: normalizeOptionalValue(data.description),
    imageUrl: normalizeOptionalValue(data.imageUrl),
    videoUrl: normalizeOptionalValue(data.videoUrl),
  }
}

export function EditExerciseForm({
  exercise,
  onCancel,
  onSuccess,
}: EditExerciseFormProps) {
  const queryClient = useQueryClient()

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
      description: exercise.description ?? '',
      imageUrl: exercise.imageUrl ?? '',
      videoUrl: exercise.videoUrl ?? '',
    },
  })

  useEffect(() => {
    reset({
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      equipmentName: exercise.equipmentName,
      description: exercise.description ?? '',
      imageUrl: exercise.imageUrl ?? '',
      videoUrl: exercise.videoUrl ?? '',
    })
  }, [exercise, reset])

  const updateExerciseMutation = useMutation({
    mutationFn: (data: UpdateExerciseRequest) =>
      updateExercise(exercise.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exercises'] })
      onSuccess()
    },
  })

  const errorMessage =
    isApiError(updateExerciseMutation.error) &&
    updateExerciseMutation.error.status === 403
      ? 'Você não possui permissão para editar exercícios.'
      : 'Não foi possível atualizar o exercício. Tente novamente.'

  function handleUpdateExercise(data: EditExerciseFormData) {
    updateExerciseMutation.mutate(toUpdateExerciseRequest(data))
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Editar exercício
        </h2>

        <p className="mt-1 text-sm text-[#6F6A62]">
          Atualize as informações do exercício selecionado.
        </p>
      </div>

      {updateExerciseMutation.isError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erro ao atualizar exercício.
          </p>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form
        className="mt-6 grid gap-4 lg:grid-cols-2"
        onSubmit={handleSubmit(handleUpdateExercise)}
      >
        <Input
          label="Nome do exercício"
          placeholder="Ex: Supino reto"
          error={errors.exerciseName?.message}
          {...register('exerciseName')}
        />

        <Input
          label="Grupo muscular"
          placeholder="Ex: Peito"
          error={errors.muscleGroup?.message}
          {...register('muscleGroup')}
        />

        <Input
          label="Equipamento"
          placeholder="Ex: Barra"
          error={errors.equipmentName?.message}
          {...register('equipmentName')}
        />

        <Input
          label="URL da imagem"
          placeholder="https://exemplo.com/imagem.jpg"
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />

        <Input
          label="URL do vídeo"
          placeholder="https://exemplo.com/video.mp4"
          error={errors.videoUrl?.message}
          {...register('videoUrl')}
        />

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
            Descrição
          </label>

          <textarea
            className="min-h-28 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10"
            placeholder="Descreva brevemente a execução do exercício"
            {...register('description')}
          />

          {errors.description?.message && (
            <p className="mt-2 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
          <Button type="submit" disabled={updateExerciseMutation.isPending}>
            {updateExerciseMutation.isPending
              ? 'Salvando...'
              : 'Salvar alterações'}
          </Button>

          <button
            type="button"
            onClick={onCancel}
            disabled={updateExerciseMutation.isPending}
            className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-5 py-3 text-sm font-semibold text-[#6F6A62] transition hover:border-[#2F4F3E] hover:text-[#2F4F3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  )
}