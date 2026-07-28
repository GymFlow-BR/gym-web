export type Teacher = {
  id: number;
  organizationId: number;
  organizationName: string;
  name: string;
  email: string;
  role: "TEACHER";
  active: boolean;
  createdAt: string | null;
};

export type CreateTeacherRequest = {
  organizationId: number;
  name: string;
  email: string;
  password: string;
  role: "TEACHER";
};

export type UpdateTeacherRequest = {
  name?: string;
  email?: string;
  active?: boolean;
};
