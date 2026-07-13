import { api } from '../../../services/api'
import type { CreateWorkoutRequest, Workout } from '../types/workout'

export function getWorkouts() {
  return api.get<Workout[]>('/api/workouts')
}

export function createWorkout(data: CreateWorkoutRequest) {
  return api.post<Workout, CreateWorkoutRequest>('/api/workouts', data)
}

export function deactivateWorkout(workoutId: number) {
  return api.delete<void>(`/api/workouts/${workoutId}`)
}