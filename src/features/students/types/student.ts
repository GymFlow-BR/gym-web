export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type Student = {
  id: number;
  organizationId: number;
  organizationName: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string | null;
};

export type CreateStudentRequest = {
  organizationId: number;
  name: string;
  email: string;
  password: string;
  role: "STUDENT";
};
