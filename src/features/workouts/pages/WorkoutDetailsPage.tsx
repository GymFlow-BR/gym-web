import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'

import { PageHeader } from '../../../components/layout/PageHeader'
import { Card } from '../../../components/ui/Card'
import {
  getWorkoutById,
  getWorkoutExercises,
} from '../services/workoutService'

function formatWorkoutStatus(status: string) {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ARCHIVED: 'Arquivado',
  }

  return statusMap[status] ?? status
}

function getWorkoutStatusClassName(status: string) {
  if (status === 'ACTIVE') {
    return 'bg-[#2F4F3E]/10 text-[#2F4F3E]'
  }

  if (status === 'ARCHIVED') {
    return 'bg-[#EDEAE3] text-[#6F6A62]'
  }

  return 'bg-yellow-50 text-yellow-700'
}

function formatRestTime(seconds: number | null) {
  if (seconds === null) {
    return 'Não informado'
  }

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}min`
  }

  return `${minutes}min ${remainingSeconds}s`
}

function formatRecommendedLoad(value: number | null) {
  if (value === null) {
    return 'Não informado'
  }

  return `${value} kg`
}

export function WorkoutDetailsPage() {
  const { workoutId } = useParams()

  const parsedWorkoutId = Number(workoutId)
  const isValidWorkoutId = Number.isFinite(parsedWorkoutId)

  const {
    data: workout,
    isLoading: isLoadingWorkout,
    isError: isWorkoutError,
    error: workoutError,
  } = useQuery({
    queryKey: ['workout', parsedWorkoutId],
    queryFn: () => getWorkoutById(parsedWorkoutId),
    enabled: isValidWorkoutId,
  })

  const {
    data: workoutExercises,
    isLoading: isLoadingWorkoutExercises,
    isError: isWorkoutExercisesError,
    error: workoutExercisesError,
  } = useQuery({
    queryKey: ['workout-exercises', parsedWorkoutId],
    queryFn: () => getWorkoutExercises(parsedWorkoutId),
    enabled: isValidWorkoutId,
  })

  const isLoading = isLoadingWorkout || isLoadingWorkoutExercises
  const isError = isWorkoutError || isWorkoutExercisesError
  const error = workoutError || workoutExercisesError

  if (!isValidWorkoutId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treino inválido"
          description="Não foi possível identificar o treino solicitado."
        />

        <Card>
          <Link
            to="/admin/workouts"
            className="text-sm font-semibold text-[#2F4F3E]"
          >
            Voltar para treinos
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/workouts"
          className="text-sm font-semibold text-[#2F4F3E]"
        >
          ← Voltar para treinos
        </Link>
      </div>

      <PageHeader
        title={workout?.workoutName ?? 'Detalhes do treino'}
        description="Visualize os detalhes do treino modelo e os exercícios vinculados."
      />

      {isLoading && (
        <Card>
          <p className="text-sm text-[#6F6A62]">
            Carregando detalhes do treino...
          </p>
        </Card>
      )}

      {isError && (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Não foi possível carregar os detalhes do treino.
            </p>

            <p className="mt-2 text-sm text-red-600">
              Verifique se a API está rodando e se o usuário possui permissão
              para acessar este recurso.
            </p>

            <p className="mt-3 text-xs text-red-500">
              {error instanceof Error
                ? error.message
                : 'Erro inesperado ao comunicar com a API.'}
            </p>
          </div>
        </Card>
      )}

      {!isLoading && !isError && workout && (
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                {workout.workoutName}
              </h2>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Treino modelo criado para reutilização com alunos.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-[#8A8378]">Professor ID</p>
                <p className="mt-1 font-semibold text-[#1F1F1F]">
                  {workout.teacherId}
                </p>
              </div>

              <span
                className={[
                  'h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold',
                  getWorkoutStatusClassName(workout.status),
                ].join(' ')}
              >
                {formatWorkoutStatus(workout.status)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {!isLoading &&
        !isError &&
        workoutExercises &&
        workoutExercises.length === 0 && (
          <Card>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Nenhum exercício vinculado
              </h2>

              <p className="mt-2 text-sm text-[#6F6A62]">
                Quando exercícios forem adicionados a este treino, eles
                aparecerão nesta lista.
              </p>
            </div>
          </Card>
        )}

      {!isLoading &&
        !isError &&
        workoutExercises &&
        workoutExercises.length > 0 && (
          <Card className="p-0">
            <div className="border-b border-[#E4DFD6] p-5">
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Exercícios do treino
              </h2>

              <p className="mt-1 text-sm text-[#6F6A62]">
                Mostrando {workoutExercises.length} exercício
                {workoutExercises.length === 1 ? '' : 's'} vinculado
                {workoutExercises.length === 1 ? '' : 's'}.
              </p>
            </div>

            <div className="divide-y divide-[#EDEAE3]">
              {[...workoutExercises]
                .sort((first, second) => first.exerciseOrder - second.exerciseOrder)
                .map((workoutExercise) => (
                  <div
                    key={workoutExercise.id}
                    className="grid gap-4 p-5 transition hover:bg-[#FAF9F6] lg:grid-cols-[auto_1fr_auto_auto_auto] lg:items-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F4F3E]/10 text-sm font-bold text-[#2F4F3E]">
                      {workoutExercise.exerciseOrder}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1F1F1F]">
                        {workoutExercise.exerciseName}
                      </h3>

                      <p className="mt-1 text-sm text-[#6F6A62]">
                        {workoutExercise.muscleGroup} •{' '}
                        {workoutExercise.equipmentName || 'Sem equipamento'}
                      </p>

                      {workoutExercise.notes && (
                        <p className="mt-2 text-sm text-[#6F6A62]">
                          {workoutExercise.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-[#8A8378]">Séries</p>

                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {workoutExercise.sets}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8A8378]">Repetições</p>

                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {workoutExercise.reps}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8A8378]">Descanso</p>

                      <p className="mt-1 font-semibold text-[#1F1F1F]">
                        {formatRestTime(workoutExercise.restTimeSeconds)}
                      </p>

                      <p className="mt-1 text-xs text-[#8A8378]">
                        Carga: {formatRecommendedLoad(workoutExercise.recommendedLoad)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
    </div>
  )
}