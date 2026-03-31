/**
 * Business Management Service
 * Handles API calls for business owner CRUD operations.
 * Distinct from businessService.ts which handles customer-facing search.
 */

import { apiClient } from "./apiClient";
import type {
  BusinessProfile,
  CreateBusinessInput,
  UpdateBusinessInput,
  ServiceProfile,
  CreateServiceInput,
  UpdateServiceInput,
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

export const updateBusiness = async (
  id: string,
  dto: UpdateBusinessInput,
): Promise<BusinessProfile> => {
  const response = await apiClient.put<BusinessProfile>(`/businesses/${id}`, dto);
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

export const updateService = async (
  businessId: string,
  serviceId: string,
  dto: UpdateServiceInput,
): Promise<ServiceProfile> => {
  const response = await apiClient.put<ServiceProfile>(
    `/businesses/${businessId}/services/${serviceId}`,
    dto,
  );
  return response.data;
};

export const deleteService = async (
  businessId: string,
  serviceId: string,
): Promise<void> => {
  await apiClient.delete(`/businesses/${businessId}/services/${serviceId}`);
};

export const getMyBusinesses = async (): Promise<BusinessProfile[]> => {
  const response = await apiClient.get<BusinessProfile[]>("/businesses/my");
  return response.data;
};

export const getPublicBusinessById = async (id: string): Promise<BusinessProfile> => {
  const response = await apiClient.get<BusinessProfile>(`/businesses/${id}`);
  return response.data;
};

export const getPublicBusinessBySlug = async (slug: string): Promise<BusinessProfile> => {
  const response = await apiClient.get<BusinessProfile>(`/businesses/by-slug/${slug}`);
  return response.data;
};

export const getPublicServicesForBusiness = async (businessId: string): Promise<ServiceProfile[]> => {
  const response = await apiClient.get<ServiceProfile[]>(`/businesses/${businessId}/services`);
  return response.data;
};

export const uploadBusinessLogo = async (
  businessId: string,
  file: File,
): Promise<BusinessProfile> => {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post<BusinessProfile>(
    `/businesses/${businessId}/upload-logo`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

export const uploadBusinessBanner = async (
  businessId: string,
  file: File,
): Promise<BusinessProfile> => {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post<BusinessProfile>(
    `/businesses/${businessId}/upload-banner`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

export const uploadBusinessSearchImage = async (
  businessId: string,
  file: File,
): Promise<BusinessProfile> => {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post<BusinessProfile>(
    `/businesses/${businessId}/upload-search-image`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
