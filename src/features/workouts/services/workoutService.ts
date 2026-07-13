import { api } from "../../../services/api";
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from "../types/workout";

export function getWorkouts() {
  return api.get<Workout[]>("/api/workouts");
}

export function createWorkout(data: CreateWorkoutRequest) {
  return api.post<Workout, CreateWorkoutRequest>("/api/workouts", data);
}

export function updateWorkout(workoutId: number, data: UpdateWorkoutRequest) {
  return api.patch<Workout, UpdateWorkoutRequest>(
    `/api/workouts/${workoutId}`,
    data,
  );
}

export function deactivateWorkout(workoutId: number) {
  return api.delete<void>(`/api/workouts/${workoutId}`);
}
