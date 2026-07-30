export type WorkoutStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type Workout = {
  workoutId: number
  teacherId: number
  teacherName: string
  workoutName: string
  status: WorkoutStatus
  createdAt: string
  updatedAt: string
}

export type CreateWorkoutRequest = {
  teacherId: number
  workoutName: string
}

export type UpdateWorkoutRequest = {
  workoutName: string
  status: WorkoutStatus
}

export type WorkoutExercise = {
  id: number
  workoutId: number
  exerciseId: number
  exerciseName: string
  muscleGroup: string
  equipmentName: string
  exerciseOrder: number
  sets: number
  reps: string
  recommendedLoad: number | null
  restTimeSeconds: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type CreateWorkoutExerciseRequest = {
  exerciseId: number
  exerciseOrder: number
  sets: number
  reps: string
  recommendedLoad?: number
  restTimeSeconds?: number
  notes?: string
}