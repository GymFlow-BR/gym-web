import { api } from "../../../services/api";
import type {
  CreateTeacherRequest,
  Teacher,
  UpdateTeacherRequest,
} from "../types/teacher";

export function getTeachersByOrganization(organizationId: number) {
  return api.get<Teacher[]>(
    `/api/users/by-organization/${organizationId}/by-role?role=TEACHER`,
  );
}

export function createTeacher(data: CreateTeacherRequest) {
  return api.post<Teacher, CreateTeacherRequest>("/api/users", data);
}

export function updateTeacher(teacherId: number, data: UpdateTeacherRequest) {
  return api.patch<Teacher, UpdateTeacherRequest>(
    `/api/users/${teacherId}`,
    data,
  );
}
