import { apiClient } from "./apiClient";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  role: "teacher" | "student";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string) {
  const res = await apiClient.post<AuthResponse>("/api/auth/login", {
    username,
    password,
  });
  return res.data;
}

export async function register(
  username: string,
  password: string,
  fullName: string,
  role: "teacher" | "student"
) {
  const res = await apiClient.post<AuthResponse>("/api/auth/register", {
    username,
    password,
    full_name: fullName,
    role,
  });
  return res.data;
}

