import { apiClient } from "./apiClient";

export interface AdminCategoryRequest {
  id: string;
  description: string;
  aiSuggestedName: string | null;
  aiSuggestedIcon: string | null;
  status: string;
  createdAt: string;
  requesterName: string;
  requesterEmail: string;
  businessId: string | null;
  businessName: string | null;
}

export const getPendingCategoryRequests = async (): Promise<AdminCategoryRequest[]> => {
  const res = await apiClient.get<AdminCategoryRequest[]>("/admin/category-requests");
  return res.data;
};

export const approveCategoryRequest = async (
  id: string,
  overrides: { name?: string; iconName?: string } = {},
): Promise<void> => {
  await apiClient.post(`/admin/category-requests/${id}/approve`, overrides);
};

export const rejectCategoryRequest = async (id: string): Promise<void> => {
  await apiClient.post(`/admin/category-requests/${id}/reject`);
};
