import { apiClient } from "./apiClient";

export interface BroadcastDTO {
  id: string;
  businessId: string;
  title: string;
  body: string;
  sentAt: string;
  followerCount: number;
}

export interface BroadcastStatusDTO {
  sentToday: number;
  dailyLimit: number;
  resetsAt: string | null;
}

export interface BroadcastHistoryResponse {
  items: BroadcastDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function sendBroadcast(
  businessId: string,
  title: string,
  body: string,
): Promise<BroadcastDTO> {
  const res = await apiClient.post<BroadcastDTO>(
    `/api/businesses/${businessId}/broadcasts`,
    { title, body },
  );
  return res.data;
}

export async function getBroadcasts(
  businessId: string,
  page = 1,
  pageSize = 20,
): Promise<BroadcastHistoryResponse> {
  const res = await apiClient.get<BroadcastHistoryResponse>(
    `/api/businesses/${businessId}/broadcasts`,
    { params: { page, pageSize } },
  );
  return res.data;
}

export async function getBroadcastStatus(
  businessId: string,
): Promise<BroadcastStatusDTO> {
  const res = await apiClient.get<BroadcastStatusDTO>(
    `/api/businesses/${businessId}/broadcasts/status`,
  );
  return res.data;
}
