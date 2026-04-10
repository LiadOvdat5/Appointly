import { apiClient } from "./apiClient";

export interface OwnedBusinessDTO {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  description?: string;
}

export async function getMyBusinesses(): Promise<OwnedBusinessDTO[]> {
  const response = await apiClient.get<OwnedBusinessDTO[]>("/businesses/my");
  return response.data;
}
