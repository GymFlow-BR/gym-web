import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
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

function toCreateWorkoutRequest(
  data: CreateWorkoutFormData,
  teacherId: number,
): CreateWorkoutRequest {
  return {
    teacherId,
    workoutName: data.workoutName.trim(),
  }
}

export function CreateWorkoutForm() {
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
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Novo treino
        </h2>

        <p className="mt-1 text-sm text-[#6F6A62]">
          Cadastre um treino modelo para depois associar exercícios e atribuir
          aos alunos.
        </p>
      </div>

      {createWorkoutMutation.isSuccess && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            Treino cadastrado com sucesso.
          </p>
        </div>
      )}

      {createWorkoutMutation.isError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erro ao cadastrar treino.
          </p>

          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form className="mt-6" onSubmit={handleSubmit(handleCreateWorkout)}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Input
            label="Nome do treino"
            placeholder="Ex: Treino A - Peito e Tríceps"
            error={errors.workoutName?.message}
            {...register('workoutName')}
          />

          <Button
            type="submit"
            disabled={createWorkoutMutation.isPending || !user}
          >
            {createWorkoutMutation.isPending
              ? 'Cadastrando...'
              : 'Cadastrar treino'}
          </Button>
        </div>
      </form>
    </Card>
  )
}