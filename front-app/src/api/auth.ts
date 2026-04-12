import { http } from "./http";

export type UserDto = {
  id: string;
  name: string;
  role: number;
  businessId?: string; // only set for partner role
};

export type SessionDto = {
  user: UserDto;
  expiresAt: string; // ISO string or whatever backend returns
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export async function register(data: RegisterRequest): Promise<UserDto> {
  const res = await http.post<UserDto>("/auth/register", data);
  return res.data;
}

export async function login(data: LoginRequest): Promise<SessionDto> {
  const res = await http.post<SessionDto>("/auth/login", data);
  return res.data;
}

export async function me(): Promise<SessionDto> {
  const res = await http.get<SessionDto>("/auth/me");
  return res.data;
}

export async function logout(): Promise<void> {
  await http.post("/auth/logout", null);
}

export type GoogleAuthRequest = {
  idToken: string;
  role?: number; // UserRole enum value — required only for new sign-ups
};

export async function googleAuth(data: GoogleAuthRequest): Promise<SessionDto> {
  const res = await http.post<SessionDto>("/auth/google", data);
  return res.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await http.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await http.post("/auth/reset-password", { token, newPassword });
}

export async function refresh(): Promise<SessionDto> {
  const res = await http.post<SessionDto>("/auth/refresh", null);
  return res.data;
}
