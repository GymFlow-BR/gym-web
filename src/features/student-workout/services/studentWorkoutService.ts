import { api } from '../../../services/api'
import type {
  StudentCurrentWorkout,
  StudentCurrentWorkoutProgress,
  StudentWorkoutExerciseProgress,
} from '../types/studentWorkout'

export function getStudentCurrentWorkout(studentId: number) {
  return api.get<StudentCurrentWorkout>(
    `/api/students/${studentId}/workouts/current`,
  )
}

export function getStudentCurrentWorkoutProgress(studentId: number) {
  return api.get<StudentCurrentWorkoutProgress>(
    `/api/students/${studentId}/workouts/current/progress`,
  )
}

export function completeStudentWorkoutExercise(
  studentId: number,
  workoutExerciseId: number,
) {
  return api.patch<StudentWorkoutExerciseProgress>(
    `/api/students/${studentId}/workouts/current/exercises/${workoutExerciseId}/complete`,
  )
}

export function uncompleteStudentWorkoutExercise(
  studentId: number,
  workoutExerciseId: number,
) {
  return api.patch<StudentWorkoutExerciseProgress>(
    `/api/students/${studentId}/workouts/current/exercises/${workoutExerciseId}/uncomplete`,
  )
}