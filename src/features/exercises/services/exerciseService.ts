import { api } from '../../../services/api'
import type { Exercise } from '../types/exercise'

export function getExercises() {
  return api.get<Exercise[]>('/api/exercises')
}