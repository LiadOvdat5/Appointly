/**
 * Types for business management (owner CRUD operations).
 * Distinct from search types in search.ts.
 */

export interface BusinessProfile {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  categories: BusinessCategory[];
  themeColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  iconName?: string;
  description?: string;
}

export interface CreateBusinessInput {
  name: string;
  address: string;
  phone: string;
  description?: string;
}

export interface UpdateBusinessInput {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  themeColor?: string;
}

export interface ServiceProfile {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  categoryId: string;
  userId: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  categoryId: string;
  userId: string;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
}
