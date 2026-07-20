export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type Student = {
  userId: number;
  organizationId: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
