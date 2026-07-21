import { api } from "../../../services/api";
import type { CreateStudentRequest, Student } from "../types/student";

export function getStudentsByOrganization(organizationId: number) {
  return api.get<Student[]>(
    `/api/users/by-organization/${organizationId}/by-role?role=STUDENT`,
  );
}

export function createStudent(data: CreateStudentRequest) {
  return api.post<Student, CreateStudentRequest>("/api/users", data);
}
