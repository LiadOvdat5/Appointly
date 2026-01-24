import { http } from "./http";

export type UserDto = {
  id: string;
  name: string;
  role: number;
};

export type SessionDto = {
  user: UserDto;
  expiresAt: string; // ISO string or whatever backend returns
};

export type LoginRequest = {
  email: string;
  password: string;
};

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
