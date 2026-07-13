import { api } from '../../../services/api'
import type { Workout } from '../types/workout'

export function getWorkouts() {
  return api.get<Workout[]>('/api/workouts')
}