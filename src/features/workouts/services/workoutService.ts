import { api } from '../../../services/api'
import type {
  CreateWorkoutExerciseRequest,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
  WorkoutExercise,
} from '../types/workout'

export function getWorkouts() {
  return api.get<Workout[]>('/api/workouts')
}

export function getWorkoutById(workoutId: number) {
  return api.get<Workout>(`/api/workouts/${workoutId}`)
}

export function getWorkoutExercises(workoutId: number) {
  return api.get<WorkoutExercise[]>(`/api/workouts/${workoutId}/exercises`)
}

export function createWorkout(data: CreateWorkoutRequest) {
  return api.post<Workout, CreateWorkoutRequest>('/api/workouts', data)
}

export function updateWorkout(workoutId: number, data: UpdateWorkoutRequest) {
  return api.patch<Workout, UpdateWorkoutRequest>(
    `/api/workouts/${workoutId}`,
    data,
  )
}

export function deactivateWorkout(workoutId: number) {
  return api.delete<void>(`/api/workouts/${workoutId}`)
}

export function createWorkoutExercise(
  workoutId: number,
  data: CreateWorkoutExerciseRequest,
) {
  return api.post<WorkoutExercise, CreateWorkoutExerciseRequest>(
    `/api/workouts/${workoutId}/exercises`,
    data,
  )
}