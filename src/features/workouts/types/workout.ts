export type WorkoutStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Workout = {
  workoutId: number;
  teacherId: number;
  workoutName: string;
  status: WorkoutStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutRequest = {
  teacherId: number;
  workoutName: string;
};

export type UpdateWorkoutRequest = {
  workoutName: string;
  status: WorkoutStatus;
};
