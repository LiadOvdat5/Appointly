import { apiClient } from "./apiClient";
import type { BusinessProfile } from "../types/business";

export interface FollowDTO {
  id: string;
  userId: string;
  businessId: string;
  createdAt: string;
}

export interface FollowStatusDTO {
  isFollowing: boolean;
  followId: string | null;
}

export async function followBusiness(businessId: string): Promise<FollowDTO> {
  const response = await apiClient.post<FollowDTO>("/api/follow", { businessId });
  return response.data;
}

export async function unfollowBusiness(businessId: string): Promise<void> {
  await apiClient.delete(`/api/follow/${businessId}`);
}

export async function getFollowedBusinesses(): Promise<BusinessProfile[]> {
  const response = await apiClient.get<BusinessProfile[]>("/api/follow/user");
  return response.data;
}

export async function getFollowStatus(businessId: string): Promise<FollowStatusDTO> {
  const response = await apiClient.get<FollowStatusDTO>(`/api/follow/status/${businessId}`);
  return response.data;
}
