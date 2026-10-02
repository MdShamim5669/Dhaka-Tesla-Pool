export type UserRole = "PASSENGER" | "DRIVER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
