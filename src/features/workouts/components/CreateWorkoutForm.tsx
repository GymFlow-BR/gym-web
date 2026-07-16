import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { isApiError } from '../../../services/apiError'
import { useAuthenticatedUser } from '../../auth/hooks/useAuthenticatedUser'
import { createWorkout } from '../services/workoutService'
import type { CreateWorkoutRequest } from '../types/workout'

const createWorkoutSchema = z.object({
  workoutName: z
    .string()
    .trim()
    .min(2, 'O nome do treino deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome do treino deve ter no máximo 120 caracteres.'),
})

type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>

type CreateWorkoutFormProps = {
  onCancel: () => void
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function toCreateWorkoutRequest(
  data: CreateWorkoutFormData,
  teacherId: number,
): CreateWorkoutRequest {
  return {
    teacherId,
    workoutName: data.workoutName.trim(),
  }
}

export function CreateWorkoutForm({ onCancel }: CreateWorkoutFormProps) {
  const queryClient = useQueryClient()
  const { data: user } = useAuthenticatedUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      workoutName: '',
    },
  })

  const createWorkoutMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workouts'] })
      reset()
    },
  })

  const errorMessage =
    isApiError(createWorkoutMutation.error) &&
    createWorkoutMutation.error.status === 403
      ? 'Você não possui permissão para cadastrar treinos.'
      : 'Não foi possível cadastrar o treino. Tente novamente.'

  function handleCreateWorkout(data: CreateWorkoutFormData) {
    if (!user) {
      return
    }

    createWorkoutMutation.mutate(toCreateWorkoutRequest(data, user.userId))
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Novo treino
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Cadastre um treino modelo para depois associar exercícios e
            atribuir aos alunos.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {createWorkoutMutation.isSuccess && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            Treino cadastrado com sucesso.
          </p>
        </div>
      )}

      {createWorkoutMutation.isError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erro ao cadastrar treino.
          </p>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form className="mt-6" onSubmit={handleSubmit(handleCreateWorkout)}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="workoutName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nome do treino
            </label>

            <input
              id="workoutName"
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10"
              {...register('workoutName')}
            />

            {errors.workoutName && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.workoutName.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createWorkoutMutation.isPending || !user}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0F3D31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2E25] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createWorkoutMutation.isPending
              ? 'Cadastrando...'
              : 'Cadastrar treino'}
          </button>
        </div>
      </form>
    </div>
  )
}
