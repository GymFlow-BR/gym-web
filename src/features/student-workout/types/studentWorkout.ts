export type StudentCurrentWorkoutExercise = {
  workoutExerciseId: number
  exerciseId: number
  exerciseName: string
  equipmentName: string | null
  muscleGroup: string | null
  description: string | null
  exerciseOrder: number
  sets: number
  reps: string
  recommendedLoad: number | null
  restTimeSeconds: number | null
  notes: string | null
  imageUrl: string | null
  videoUrl: string | null
}

export type StudentCurrentWorkout = {
  studentId: number
  studentWorkoutId: number
  workoutId: number
  workoutName: string
  assignedAt: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  exercises: StudentCurrentWorkoutExercise[]
}

export type StudentCurrentWorkoutExerciseProgress = {
  workoutExerciseId: number
  exerciseId: number
  exerciseName: string
  exerciseOrder: number
  completed: boolean
  completedAt: string | null
}

export type StudentCurrentWorkoutProgress = {
  studentId: number
  studentWorkoutId: number
  workoutId: number
  workoutName: string
  totalExercises: number
  completedExercises: number
  progressPercentage: number
  exercises: StudentCurrentWorkoutExerciseProgress[]
}

export type StudentWorkoutExerciseProgress = {
  studentWorkoutId: number
  workoutExerciseId: number
  completed: boolean
  completedAt: string | null
}