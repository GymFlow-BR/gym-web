export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type OrganizationType = "ACADEMY" | "PERSONAL";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterOrganizationRequest = {
  organizationName: string;
  organizationType: OrganizationType;
  organizationEmail: string;
  organizationPhone?: string | null;
  adminName: string;
  adminEmail: string;
  password: string;
};

export type RegisterOrganizationResponse = {
  organizationId: number;
  organizationName: string;
  organizationType: OrganizationType;
  adminUserId: number;
  adminName: string;
  adminEmail: string;
};

export type AuthenticatedUser = {
  userId: number;
  organizationId: number;
  name: string;
  email: string;
  role: UserRole;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
