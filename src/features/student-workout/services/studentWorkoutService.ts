import { api } from "../../../services/api";
import type {
  CreateStudentWorkoutRequest,
  PatchStudentWorkoutRequest,
  StudentCurrentWorkout,
  StudentCurrentWorkoutProgress,
  StudentWorkout,
  StudentWorkoutExerciseProgress,
} from "../types/studentWorkout";

export function createStudentWorkout(
  studentId: number,
  data: CreateStudentWorkoutRequest,
) {
  return api.post<StudentWorkout>(`/api/students/${studentId}/workouts`, data);
}

export function getStudentWorkouts(studentId: number) {
  return api.get<StudentWorkout[]>(`/api/students/${studentId}/workouts`);
}

export function getStudentWorkoutById(
  studentId: number,
  studentWorkoutId: number,
) {
  return api.get<StudentWorkout>(
    `/api/students/${studentId}/workouts/${studentWorkoutId}`,
  );
}

export function updateStudentWorkout(
  studentId: number,
  studentWorkoutId: number,
  data: PatchStudentWorkoutRequest,
) {
  return api.patch<StudentWorkout>(
    `/api/students/${studentId}/workouts/${studentWorkoutId}`,
    data,
  );
}

export function deleteStudentWorkout(
  studentId: number,
  studentWorkoutId: number,
) {
  return api.delete<void>(
    `/api/students/${studentId}/workouts/${studentWorkoutId}`,
  );
}

export function getStudentCurrentWorkout(studentId: number) {
  return api.get<StudentCurrentWorkout>(
    `/api/students/${studentId}/workouts/current`,
  );
}

export function getStudentCurrentWorkoutProgress(studentId: number) {
  return api.get<StudentCurrentWorkoutProgress>(
    `/api/students/${studentId}/workouts/current/progress`,
  );
}

export function completeStudentWorkoutExercise(
  studentId: number,
  workoutExerciseId: number,
) {
  return api.patch<StudentWorkoutExerciseProgress>(
    `/api/students/${studentId}/workouts/current/exercises/${workoutExerciseId}/complete`,
  );
}

export function uncompleteStudentWorkoutExercise(
  studentId: number,
  workoutExerciseId: number,
) {
  return api.patch<StudentWorkoutExerciseProgress>(
    `/api/students/${studentId}/workouts/current/exercises/${workoutExerciseId}/uncomplete`,
  );
}
