import { apiClient } from "./apiClient";
import type { Category } from "../types/search";

/**
 * Fetch all categories from backend.
 * The endpoint returns an array of CategoryDTO (id, name, description, iconName).
 * We don't cache locally because categories are small and rarely change;
 * they are loaded once when the search page mounts.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>("/categories");
    const categories = Array.isArray(response.data) ? response.data : [];
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

/** The seeded "Uncategorized" category ID — used as fallback while a request is pending. */
export const UNCATEGORIZED_CATEGORY_ID = "11111111-1111-1111-1111-111111111111";

export interface CategoryNamePreview {
  suggestedName: string | null;
  suggestedIcon: string | null;
}

/**
 * US-12-B-01 helper: Ask AI to suggest a new generic category name + icon for a description.
 * Does NOT store anything — purely a preview before the owner confirms.
 */
export const previewCategoryName = async (description: string): Promise<CategoryNamePreview> => {
  const response = await apiClient.post<CategoryNamePreview>("/categories/preview-name", { description });
  return response.data;
};

/**
 * US-12-B-01: Ask the AI to suggest up to 3 existing categories that match the description.
 * Returns empty array if the AI call fails — caller should handle gracefully.
 */
export const suggestCategories = async (description: string): Promise<Category[]> => {
  const response = await apiClient.post<Category[]>("/categories/suggest", { description });
  return response.data;
};

export interface CategoryRequestResult {
  id: string;
  description: string;
  aiSuggestedName: string | null;
  aiSuggestedIcon: string | null;
  status: string;
  createdAt: string;
}

/**
 * US-12-B-02: Submit a new category request for admin review.
 * The backend calls AI to propose a name and stores it as Pending.
 * Pass businessId so the admin can update the right services on approval.
 */
export const requestNewCategory = async (
  description: string,
  businessId?: string,
): Promise<CategoryRequestResult> => {
  const response = await apiClient.post<CategoryRequestResult>("/categories/request", {
    description,
    businessId: businessId ?? null,
  });
  return response.data;
};
