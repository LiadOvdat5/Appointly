import { apiClient } from "./apiClient";

export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalAppointments: number;
  totalReviews: number;
  pendingFlaggedReviews: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await apiClient.get<AdminStats>("/admin/stats");
  return res.data;
};

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

// ── Flagged Reviews ───────────────────────────────────────────────────────────

export interface AdminFlaggedReview {
  id: string;
  businessId: string;
  businessName: string;
  customerName: string;
  rating: number;
  comment: string | null;
  flagReason: string | null;
  flaggedAt: string | null;
  createdAt: string;
}

export type ResolveAction = "remove" | "dismiss";

export const getFlaggedReviews = async (): Promise<AdminFlaggedReview[]> => {
  const res = await apiClient.get<AdminFlaggedReview[]>("/admin/reviews/flagged");
  return res.data;
};

export const resolveReview = async (id: string, action: ResolveAction): Promise<void> => {
  await apiClient.post(`/admin/reviews/${id}/resolve`, { action });
};
