import { useQuery } from '@tanstack/react-query'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useAuthenticatedUser } from '../../auth/hooks/useAuthenticatedUser'
import { getStudentCurrentWorkout } from '../services/studentWorkoutService'

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

export function StudentCurrentWorkoutPage() {
  const {
    data: authenticatedUser,
    isLoading: isLoadingAuthenticatedUser,
    isError: isAuthenticatedUserError,
  } = useAuthenticatedUser()

  const studentId = authenticatedUser?.userId

  const {
    data: currentWorkout,
    isLoading: isLoadingCurrentWorkout,
    isError: isCurrentWorkoutError,
    error: currentWorkoutError,
  } = useQuery({
    queryKey: ['student-current-workout', studentId],
    queryFn: () => getStudentCurrentWorkout(studentId!),
    enabled: !!studentId,
    retry: false,
  })

  const isLoading = isLoadingAuthenticatedUser || isLoadingCurrentWorkout

  const sortedExercises = currentWorkout?.exercises
    ? [...currentWorkout.exercises].sort(
        (first, second) => first.exerciseOrder - second.exerciseOrder,
      )
    : []

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-[#6F6A62]">Carregando treino atual...</p>
      </Card>
    )
  }

  if (isAuthenticatedUserError) {
    return (
      <Card>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Não foi possível identificar o aluno autenticado.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Faça login novamente para acessar seu treino atual.
          </p>
        </div>
      </Card>
    )
  }

  if (authenticatedUser?.role !== 'STUDENT') {
    return (
      <Card>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">
            Esta área é exclusiva para alunos.
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            Acesse com uma conta de aluno para visualizar o treino atual.
          </p>
        </div>
      </Card>
    )
  }

  if (isCurrentWorkoutError) {
    return (
      <Card>
        <div className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-5 text-center">
          <p className="text-lg font-semibold text-[#1F1F1F]">
            Nenhum treino atual encontrado
          </p>

          <p className="mt-2 text-sm text-[#6F6A62]">
            Você ainda não possui um treino ativo atribuído. Fale com seu
            professor para receber um treino.
          </p>

          <p className="mt-3 text-xs text-[#8A8378]">
            {currentWorkoutError instanceof Error
              ? currentWorkoutError.message
              : 'Treino atual não encontrado.'}
          </p>
        </div>
      </Card>
    )
  }

  if (!currentWorkout) {
    return (
      <Card>
        <p className="text-sm text-[#6F6A62]">
          Nenhum treino atual disponível no momento.
        </p>
      </Card>
    )
  }

  return (
    <>
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#6F6A62]">Treino atual</p>

            <h2 className="mt-1 text-2xl font-bold text-[#1F1F1F]">
              {currentWorkout.workoutName}
            </h2>

            <p className="text-sm font-medium text-[#2F4F3E]">
              {sortedExercises.length} exercício
              {sortedExercises.length === 1 ? '' : 's'} no treino
            </p>
          </div>

          <span className="rounded-full bg-[#2F4F3E]/10 px-3 py-1 text-xs font-semibold text-[#2F4F3E]">
            Ativo
          </span>
        </div>

        <Card className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6F6A62]">Resumo do treino</span>
            <span className="font-semibold text-[#1F1F1F]">
              {sortedExercises.length} exercício
              {sortedExercises.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[#EDEAE3]">
            <div className="h-2 w-0 rounded-full bg-[#2F4F3E]" />
          </div>

          <p className="mt-2 text-xs text-[#6F6A62]">
            O controle de progresso será implementado em uma próxima etapa.
          </p>
        </Card>
      </section>

      {sortedExercises.length === 0 && (
        <Card className="mt-5">
          <div className="text-center">
            <p className="text-lg font-semibold text-[#1F1F1F]">
              Nenhum exercício vinculado
            </p>

            <p className="mt-2 text-sm text-[#6F6A62]">
              Seu treino atual ainda não possui exercícios cadastrados.
            </p>
          </div>
        </Card>
      )}

      {sortedExercises.length > 0 && (
        <div className="mt-5 space-y-3">
          {sortedExercises.map((exercise) => (
            <div
              key={exercise.workoutExerciseId}
              className="rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] p-4 text-[#1F1F1F] shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {exercise.exerciseOrder}. {exercise.exerciseName}
                  </p>

                  <p className="mt-1 text-xs text-[#6F6A62]">
                    {exercise.muscleGroup || 'Grupo muscular não informado'} •{' '}
                    {exercise.equipmentName || 'Sem equipamento'}
                  </p>
                </div>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B7B2A8] text-xs text-[#6F6A62]">
                  {exercise.exerciseOrder}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[#FAF9F6] p-3">
                  <p className="text-xs text-[#8A8378]">Séries</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {exercise.sets}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F6] p-3">
                  <p className="text-xs text-[#8A8378]">Repetições</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {exercise.reps}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F6] p-3">
                  <p className="text-xs text-[#8A8378]">Carga</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {formatRecommendedLoad(exercise.recommendedLoad)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F6] p-3">
                  <p className="text-xs text-[#8A8378]">Descanso</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {formatRestTime(exercise.restTimeSeconds)}
                  </p>
                </div>
              </div>

              {exercise.description && (
                <p className="mt-4 text-sm text-[#6F6A62]">
                  {exercise.description}
                </p>
              )}

              {exercise.notes && (
                <div className="mt-4 rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-3">
                  <p className="text-xs font-semibold text-[#8A8378]">
                    Observações
                  </p>

                  <p className="mt-1 text-sm text-[#6F6A62]">
                    {exercise.notes}
                  </p>
                </div>
              )}

              {(exercise.imageUrl || exercise.videoUrl) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exercise.imageUrl && (
                    <a
                      href={exercise.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#E4DFD6] px-3 py-1 text-xs font-semibold text-[#2F4F3E]"
                    >
                      Ver imagem
                    </a>
                  )}

                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#E4DFD6] px-3 py-1 text-xs font-semibold text-[#2F4F3E]"
                    >
                      Ver vídeo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Button className="mt-5" fullWidth disabled={sortedExercises.length === 0}>
        Iniciar treino
      </Button>
    </>
  )
}