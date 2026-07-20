import { api } from "../../../services/api";
import type { Student } from "../types/student";

export function getStudentsByOrganization(organizationId: number) {
  return api.get<Student[]>(
    `/api/users/by-organization/${organizationId}/by-role?role=STUDENT`,
  );
}
