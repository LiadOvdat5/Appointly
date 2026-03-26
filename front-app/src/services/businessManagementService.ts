/**
 * Business Management Service
 * Handles API calls for business owner CRUD operations.
 * Distinct from businessService.ts which handles customer-facing search.
 */

import { apiClient } from "./apiClient";
import type {
  BusinessProfile,
  CreateBusinessInput,
  ServiceProfile,
  CreateServiceInput,
} from "../types/business";

export const createBusiness = async (
  dto: CreateBusinessInput,
): Promise<BusinessProfile> => {
  const response = await apiClient.post<BusinessProfile>("/businesses", dto);
  return response.data;
};

export const getBusinessById = async (id: string): Promise<BusinessProfile> => {
  const response = await apiClient.get<BusinessProfile>(`/businesses/${id}`);
  return response.data;
};

export const createService = async (
  businessId: string,
  dto: CreateServiceInput,
): Promise<ServiceProfile> => {
  const response = await apiClient.post<ServiceProfile>(
    `/businesses/${businessId}/services`,
    dto,
  );
  return response.data;
};

export const getServicesForBusiness = async (
  businessId: string,
): Promise<ServiceProfile[]> => {
  const response = await apiClient.get<ServiceProfile[]>(
    `/businesses/${businessId}/services`,
  );
  return response.data;
};

export const getMyBusinesses = async (): Promise<BusinessProfile[]> => {
  const response = await apiClient.get<BusinessProfile[]>("/businesses/my");
  return response.data;
};

export const getPublicBusinessById = async (id: string): Promise<BusinessProfile> => {
  const response = await apiClient.get<BusinessProfile>(`/businesses/${id}`);
  return response.data;
};

export const getPublicServicesForBusiness = async (businessId: string): Promise<ServiceProfile[]> => {
  const response = await apiClient.get<ServiceProfile[]>(`/businesses/${businessId}/services`);
  return response.data;
};
