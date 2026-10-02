import { apiClient } from "./client";
import { AuthResponse, UserRole } from "@/types/auth";

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", credentials);
  return res.data.data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/register", payload);
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout");
}
