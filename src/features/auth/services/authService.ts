import { api } from "../../../services/api";
import type {
  AuthenticatedUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterOrganizationRequest,
  RegisterOrganizationResponse,
} from "../types/auth";

export function login(data: LoginRequest) {
  return api.post<AuthenticatedUser, LoginRequest>("/api/auth/login", data);
}

export function registerOrganization(data: RegisterOrganizationRequest) {
  return api.post<RegisterOrganizationResponse, RegisterOrganizationRequest>(
    "/api/auth/register",
    data,
  );
}

export function getAuthenticatedUser() {
  return api.get<AuthenticatedUser>("/api/auth/me");
}

export function logout() {
  return api.post<void>("/api/auth/logout");
}

export function changePassword(data: ChangePasswordRequest) {
  return api.post<void, ChangePasswordRequest>(
    "/api/auth/change-password",
    data,
  );
}
