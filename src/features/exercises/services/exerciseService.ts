import { api } from "../../../services/api";
import type {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from "../types/exercise";

export function getExercises() {
  return api.get<Exercise[]>("/api/exercises");
}

export function createExercise(data: CreateExerciseRequest) {
  return api.post<Exercise, CreateExerciseRequest>("/api/exercises", data);
}

export function updateExercise(
  exerciseId: number,
  data: UpdateExerciseRequest,
) {
  return api.put<Exercise, UpdateExerciseRequest>(
    `/api/exercises/${exerciseId}`,
    data,
  );
}

export function uploadExerciseImage(exerciseId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<Exercise, FormData>(
    `/api/exercises/${exerciseId}/image`,
    formData,
  );
}

export function uploadExerciseVideo(exerciseId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<Exercise, FormData>(
    `/api/exercises/${exerciseId}/video`,
    formData,
  );
}

export function deactivateExercise(exerciseId: number) {
  return api.delete<void>(`/api/exercises/${exerciseId}`);
}
