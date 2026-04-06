import { apiClient } from "./apiClient";

export interface ReviewDTO {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  appointmentId: string;
  serviceId?: string;
  serviceName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isFlagged: boolean;
  flagReason?: string;
  isFlagDismissed: boolean;
}

export interface CreateReviewDTO {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export async function submitReview(
  businessId: string,
  dto: CreateReviewDTO,
): Promise<ReviewDTO> {
  const response = await apiClient.post<ReviewDTO>(
    `/api/businesses/${businessId}/reviews`,
    dto,
  );
  return response.data;
}

export async function getBusinessReviews(
  businessId: string,
  page = 1,
  pageSize = 20,
): Promise<ReviewDTO[]> {
  const response = await apiClient.get<ReviewDTO[]>(
    `/api/businesses/${businessId}/reviews`,
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function flagReview(
  businessId: string,
  reviewId: string,
  reason: string,
): Promise<ReviewDTO> {
  const response = await apiClient.post<ReviewDTO>(
    `/api/businesses/${businessId}/reviews/${reviewId}/flag`,
    { reason },
  );
  return response.data;
}
