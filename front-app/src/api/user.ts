import { http } from "./http";

export type UserProfileDto = {
  id: string;
  name: string;
  email: string;
  role: number;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  preferredLanguage?: string;
};

export async function getUser(id: string): Promise<UserProfileDto> {
  const res = await http.get<UserProfileDto>(`/users/${id}`);
  return res.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest,
): Promise<UserProfileDto> {
  const res = await http.patch<UserProfileDto>(`/users/${id}`, data);
  return res.data;
}

export async function demoteToClient(): Promise<void> {
  await http.patch("/users/me/demote");
}

export async function deleteAccount(): Promise<void> {
  await http.delete("/users/me");
}
