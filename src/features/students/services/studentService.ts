import { api } from "../../../services/api";
import type {
  CreateStudentRequest,
  Student,
  UpdateStudentRequest,
} from "../types/student";

export function getStudentsByOrganization(organizationId: number) {
  return api.get<Student[]>(
    `/api/users/by-organization/${organizationId}/by-role?role=STUDENT`,
  );
}

export function createStudent(data: CreateStudentRequest) {
  return api.post<Student, CreateStudentRequest>("/api/users", data);
}

export function updateStudent(studentId: number, data: UpdateStudentRequest) {
  return api.patch<Student, UpdateStudentRequest>(
    `/api/users/${studentId}`,
    data,
  );
}
