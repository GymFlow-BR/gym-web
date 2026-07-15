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