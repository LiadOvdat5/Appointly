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
