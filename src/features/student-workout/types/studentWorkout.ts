export type StudentWorkoutStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type StudentCurrentWorkoutExercise = {
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  equipmentName: string | null;
  muscleGroup: string | null;
  description: string | null;
  exerciseOrder: number;
  sets: number;
  reps: string;
  recommendedLoad: number | null;
  restTimeSeconds: number | null;
  notes: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
};

export type StudentCurrentWorkout = {
  studentId: number;
  studentWorkoutId: number;
  workoutId: number;
  workoutName: string;
  teacherName: string;
  assignedAt: string;
  weekDay: WeekDay;
  status: StudentWorkoutStatus;
  exercises: StudentCurrentWorkoutExercise[];
};

export type StudentCurrentWorkoutExerciseProgress = {
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  completed: boolean;
  completedAt: string | null;
};

export type StudentCurrentWorkoutProgress = {
  studentId: number;
  studentWorkoutId: number;
  workoutId: number;
  workoutName: string;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  exercises: StudentCurrentWorkoutExerciseProgress[];
};

export type StudentWorkoutExerciseProgress = {
  studentWorkoutId: number;
  workoutExerciseId: number;
  completed: boolean;
  completedAt: string | null;
};

export type CreateStudentWorkoutRequest = {
  workoutId: number;
  weekDay: WeekDay;
};

export type StudentWorkout = {
  studentWorkoutId: number;
  studentId: number;
  studentName: string;
  workoutId: number;
  workoutName: string;
  teacherName: string;
  assignedAt: string;
  weekDay: WeekDay;
  status: StudentWorkoutStatus;
  createdAt: string;
  updatedAt: string;
};

export type PatchStudentWorkoutRequest = {
  status: StudentWorkoutStatus;
};
