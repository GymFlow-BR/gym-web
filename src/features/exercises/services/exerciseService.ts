import { api } from '../../../services/api'
import type {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from '../types/exercise'

export function getExercises() {
  return api.get<Exercise[]>('/api/exercises')
}

export function createExercise(data: CreateExerciseRequest) {
  return api.post<Exercise, CreateExerciseRequest>('/api/exercises', data)
}

export function updateExercise(exerciseId: number, data: UpdateExerciseRequest) {
  return api.put<Exercise, UpdateExerciseRequest>(
    `/api/exercises/${exerciseId}`,
    data,
  )
}

export function deactivateExercise(exerciseId: number) {
  return api.delete<void>(`/api/exercises/${exerciseId}`)
}