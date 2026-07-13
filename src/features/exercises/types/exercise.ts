export type Exercise = {
  id: number
  organizationId: number
  exerciseName: string
  muscleGroup: string
  equipmentName: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateExerciseRequest = {
  organizationId: number
  exerciseName: string
  muscleGroup: string
  equipmentName: string
  description?: string
  imageUrl?: string
  videoUrl?: string
}

export type UpdateExerciseRequest = {
  exerciseName: string
  muscleGroup: string
  equipmentName: string
  description?: string
  imageUrl?: string
  videoUrl?: string
}