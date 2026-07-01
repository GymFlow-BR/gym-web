export type Exercise = {
  exerciseId: number
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