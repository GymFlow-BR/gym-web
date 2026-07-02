import { useAuthenticatedUser } from '../../auth/hooks/useAuthenticatedUser'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { isApiError } from '../../../services/apiError'
import { createExercise } from '../services/exerciseService'
import type { CreateExerciseRequest } from '../types/exercise'

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

const createExerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  muscleGroup: z
    .string()
    .trim()
    .min(2, 'O grupo muscular deve ter pelo menos 2 caracteres.')
    .max(80, 'O grupo muscular deve ter no máximo 80 caracteres.'),
  equipmentName: z
    .string()
    .trim()
    .min(2, 'O equipamento deve ter pelo menos 2 caracteres.')
    .max(80, 'O equipamento deve ter no máximo 80 caracteres.'),
  description: z
    .string()
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional()
    .or(z.literal('')),
  imageUrl: optionalUrlSchema,
  videoUrl: optionalUrlSchema,
})

type CreateExerciseFormData = z.infer<typeof createExerciseSchema>

function normalizeOptionalValue(value?: string) {
  if (!value || value.trim() === '') {
    return null
  }

  return value.trim()
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
  }

  const description = normalizeOptionalValue(data.description)
  const imageUrl = normalizeOptionalValue(data.imageUrl)
  const videoUrl = normalizeOptionalValue(data.videoUrl)

  if (description) {
    payload.description = description
  }

  if (imageUrl) {
    payload.imageUrl = imageUrl
  }

  if (videoUrl) {
    payload.videoUrl = videoUrl
  }

  return payload
}

export function CreateExerciseForm() {
  const queryClient = useQueryClient()
  const { data: user } = useAuthenticatedUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExerciseFormData>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      exerciseName: '',
      muscleGroup: '',
      equipmentName: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
    },
  })

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exercises'] })
      reset()
    },
  })

  const errorMessage =
    isApiError(createExerciseMutation.error) &&
    createExerciseMutation.error.status === 403
      ? 'Você não possui permissão para cadastrar exercícios.'
      : 'Não foi possível cadastrar o exercício. Tente novamente.'


  function handleCreateExercise(data: CreateExerciseFormData) {
  if (!user) {
    return
  }

  createExerciseMutation.mutate(
    toCreateExerciseRequest(data, user.organizationId),
  )
}

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Novo exercício
        </h2>

        <p className="mt-1 text-sm text-[#6F6A62]">
          Cadastre um exercício para usar na criação de treinos.
        </p>
      </div>

      {createExerciseMutation.isSuccess && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            Exercício cadastrado com sucesso.
          </p>
        </div>
      )}

      {createExerciseMutation.isError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erro ao cadastrar exercício.
          </p>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form
        className="mt-6 grid gap-4 lg:grid-cols-2"
        onSubmit={handleSubmit(handleCreateExercise)}
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

        <div className="lg:col-span-2">
          <Button
            type="submit"
            disabled={createExerciseMutation.isPending || !user}
          >
            {createExerciseMutation.isPending
               ? 'Cadastrando...'
               : 'Cadastrar exercício'}
          </Button>
        </div>
      </form>
    </Card>
  )
}