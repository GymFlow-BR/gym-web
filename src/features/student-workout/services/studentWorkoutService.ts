import { api } from '../../../services/api'
import type { StudentCurrentWorkout } from '../types/studentWorkout'

export function getStudentCurrentWorkout(studentId: number) {
  return api.get<StudentCurrentWorkout>(
    `/api/students/${studentId}/workouts/current`,
  )
}