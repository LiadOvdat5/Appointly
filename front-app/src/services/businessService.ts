/**
 * Business Service
 * Handles all API calls related to business search, details, and nearby locations
 *
 * Backend Search Endpoints:
 * - GET /api/search/businesses/by-name?text={query} - Search by business name
 * - GET /api/search/businesses/by-category?categoryId={categoryId} - Search by category
 * - GET /api/search/businesses/by-category-availability?categoryId={id}&from={date}&to={date}&durationMinutes={duration}
 */

import { API_REQUEST_TIMEOUT } from "../constants/googleMapsConfig";
import type {
  Business,
  SearchResult,
  LocationCoords,
  SearchFilters,
} from "../types/search";
import { apiClient } from "./apiClient";

/**
 * Enrich business object with default values for optional fields
 * The backend may not return all fields, so we provide sensible defaults
 */
const enrichBusiness = (business: Partial<Business> & {
  // Backend DTO flat fields (camelCase from ASP.NET Core)
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string;
  categories?: Array<{ id: string; name: string; iconName?: string }>;
}): Business => {
  // Derive category name from the first category in the categories array
  const categoryName =
    business.category ||
    (business.categories && business.categories.length > 0
      ? business.categories[0].name
      : "Other");

  // Derive image URL from logoUrl if imageUrl not present
  const imageUrl = business.imageUrl || business.logoUrl;

  // Map flat address string to location object
  const location = business.location || {
    address: business.address || "Address not available",
    city: "",
  };

  // Map flat lat/lng from backend to coordinates object
  const coordinates = business.coordinates || {
    latitude: business.latitude ?? 0,
    longitude: business.longitude ?? 0,
  };

  return {
    id: business.id || "",
    name: business.name || "Unknown Business",
    description: business.description,
    rating: business.rating ?? 0,
    reviewCount: business.reviewCount ?? 0,
    category: categoryName,
    location,
    coordinates,
    distance: business.distance,
    imageUrl,
    services: business.services || [],
    phone: business.phone,
    email: business.email,
    website: business.website,
    isFavorite: business.isFavorite ?? false,
    hoursOfOperation: business.hoursOfOperation,
  };
};

/**
 * Search businesses by name (text query)
 * Uses: GET /api/search/businesses/by-name?text={query}
 * @param filters - Search filters (searchQuery is used)
 * @returns Promise<SearchResult>
 */
export const searchBusinesses = async (
  filters: SearchFilters,
): Promise<SearchResult> => {
  try {
    if (!filters.searchQuery) {
      // If no text query but category filter exists, use category endpoint
      if (
        filters.selectedCategories &&
        filters.selectedCategories.length > 0 &&
        filters.selectedCategories[0] !== "all"
      ) {
        return await searchBusinessesByCategory(filters.selectedCategories[0]);
      }

      // otherwise return empty result
      return {
        businesses: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      };
    }

    const response = await apiClient.get<Partial<Business>[]>(
      `/api/search/businesses/by-name?text=${encodeURIComponent(filters.searchQuery)}`,
      {
        timeout: API_REQUEST_TIMEOUT,
      },
    );

    // Transform backend response to SearchResult format
    const rawBusinesses = Array.isArray(response.data) ? response.data : [];
    const businesses = rawBusinesses.map(enrichBusiness);
    return {
      businesses,
      totalCount: businesses.length,
      page: 1,
      pageSize: businesses.length,
      hasMore: false,
    };
  } catch (error) {
    console.error("Search businesses error:", error);
    return {
      businesses: [],
      totalCount: 0,
      page: 1,
      pageSize: 0,
      hasMore: false,
    };
  }
};

/**
 * Get all businesses (used as the base for nearby/map discovery)
 * Uses: GET /api/search/businesses/all
 */
export const getAllBusinesses = async (): Promise<SearchResult> => {
  try {
    const response = await apiClient.get<Partial<Business>[]>(
      "/api/search/businesses/all",
      { timeout: API_REQUEST_TIMEOUT },
    );
    const rawBusinesses = Array.isArray(response.data) ? response.data : [];
    const businesses = rawBusinesses.map(enrichBusiness);
    return {
      businesses,
      totalCount: businesses.length,
      page: 1,
      pageSize: businesses.length,
      hasMore: false,
    };
  } catch (error) {
    console.error("Get all businesses error:", error);
    return { businesses: [], totalCount: 0, page: 1, pageSize: 0, hasMore: false };
  }
};

/**
 * Get nearby businesses based on user location.
 * Fetches all businesses, optionally filters by category, then sorts by distance.
 */
export const getNearbyBusinesses = async (
  location: LocationCoords,
  _radius: number = 50,
  categories: string[] = [],
): Promise<SearchResult> => {
  try {
    let result: SearchResult;

    if (categories.length > 0 && categories[0] !== "all") {
      result = await searchBusinessesByCategory(categories[0]);
    } else {
      result = await getAllBusinesses();
    }

    // Filter to only businesses that have real coordinates
    let businesses = result.businesses.filter(
      (b) => b.coordinates.latitude !== 0 || b.coordinates.longitude !== 0,
    );

    // Sort by distance from user
    businesses = sortByDistance(businesses, location);

    return {
      businesses,
      totalCount: businesses.length,
      page: 1,
      pageSize: businesses.length,
      hasMore: false,
    };
  } catch (error) {
    console.error("Get nearby businesses error:", error);
    return { businesses: [], totalCount: 0, page: 1, pageSize: 0, hasMore: false };
  }
};

/**
 * Get featured/promoted businesses
 * NOTE: Backend does not have a featured businesses endpoint.
 * Returns empty array. To be implemented in future phases.
 * @param limit - Number of featured businesses to return (ignored)
 * @returns Promise<Business[]>
 */
export const getFeaturedBusinesses = async (): Promise<Business[]> => {
  try {
    console.warn(
      "getFeaturedBusinesses: Backend does not have featured businesses endpoint. Returning empty array.",
    );
    // Backend limitation: no featured endpoint
    // Future: Could implement client-side caching or backend enhancement
    return [];
  } catch (error) {
    console.error("Get featured businesses error:", error);
    return [];
  }
};

/**
 * Get business details by ID
 * NOTE: Backend does not expose individual business detail endpoint via search API.
 * This is a stub for future implementation.
 * @param businessId - Business ID
 * @returns Promise<Business>
 */
export const getBusinessDetails = async (
  _businessId: string,
): Promise<Business> => {
  try {
    // Backend limitation: SearchController doesn't expose /api/search/businesses/{id}
    // Would need to use /businesses/{id} endpoint if available
    throw new Error(
      "getBusinessDetails: Backend does not expose this endpoint. Use Business controller endpoints instead.",
    );
  } catch (error) {
    console.error("Get business details error:", error);
    throw error;
  }
};

/**
 * Get multiple business details by IDs
 * NOTE: Backend does not have this endpoint. Stub for future implementation.
 * @param businessIds - Array of business IDs
 * @returns Promise<Business[]>
 */
export const getBusinessesDetails = async (
  _businessIds: string[],
): Promise<Business[]> => {
  try {
    console.warn(
      "getBusinessesDetails: Backend does not have batch business details endpoint.",
    );
    return [];
  } catch (error) {
    console.error("Get businesses details error:", error);
    return [];
  }
};

/**
 * Search businesses by category
 * Uses: GET /api/search/businesses/by-category?categoryId={categoryId}
 * @param categoryId - Business category ID (UUID)
 * @returns Promise<SearchResult>
 */
export const searchBusinessesByCategory = async (
  categoryId: string,
): Promise<SearchResult> => {
  try {
    if (!categoryId || categoryId === "all") {
      // No category filter
      return {
        businesses: [],
        totalCount: 0,
        page: 1,
        pageSize: 0,
        hasMore: false,
      };
    }

    const response = await apiClient.get<Partial<Business>[]>(
      `/api/search/businesses/by-category?categoryId=${encodeURIComponent(categoryId)}`,
      {
        timeout: API_REQUEST_TIMEOUT,
      },
    );

    const rawBusinesses = Array.isArray(response.data) ? response.data : [];
    const businesses = rawBusinesses.map(enrichBusiness);
    return {
      businesses,
      totalCount: businesses.length,
      page: 1,
      pageSize: businesses.length,
      hasMore: false,
    };
  } catch (error) {
    console.error("Search by category error:", error);
    return {
      businesses: [],
      totalCount: 0,
      page: 1,
      pageSize: 0,
      hasMore: false,
    };
  }
};

/**
 * Search by availability (category + date range + duration)
 * Uses: GET /api/search/businesses/by-category-availability?categoryId={id}&from={date}&to={date}&durationMinutes={duration}
 * @param categoryId - Business category ID
 * @param fromDate - Start date for availability search
 * @param toDate - End date for availability search
 * @param durationMinutes - Required service duration in minutes
 * @returns Promise<SearchResult>
 */
export const searchByAvailability = async (
  categoryId: string | undefined,
  fromDate: Date,
  toDate: Date,
  durationMinutes?: number,
): Promise<SearchResult> => {
  try {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== "all") {
      params.append("categoryId", categoryId);
    }
    params.append("from", fromDate.toISOString());
    params.append("to", toDate.toISOString());
    if (durationMinutes) {
      params.append("durationMinutes", durationMinutes.toString());
    }

    const response = await apiClient.get<
      Array<{ business: Partial<Business>; services: unknown[] }>
    >(
      `/api/search/businesses/by-category-availability?${params.toString()}`,
      {
        timeout: API_REQUEST_TIMEOUT,
      },
    );

    const rawResults = Array.isArray(response.data) ? response.data : [];
    const businesses = rawResults.map((r) => enrichBusiness(r.business ?? r as unknown as Partial<Business>));
    return {
      businesses,
      totalCount: businesses.length,
      page: 1,
      pageSize: businesses.length,
      hasMore: false,
    };
  } catch (error) {
    console.error("Search by availability error:", error);
    return {
      businesses: [],
      totalCount: 0,
      page: 1,
      pageSize: 0,
      hasMore: false,
    };
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - First location latitude
 * @param lon1 - First location longitude
 * @param lat2 - Second location latitude
 * @param lon2 - Second location longitude
 * @returns Distance in miles
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filter results by radius from user location
 * @param businesses - Array of businesses
 * @param userLocation - User's location
 * @param radiusInMiles - Radius in miles
 * @returns Filtered businesses
 */
export const filterByRadius = (
  businesses: Business[],
  userLocation: LocationCoords,
  radiusInMiles: number,
): Business[] => {
  return businesses.filter((business) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      business.coordinates.latitude,
      business.coordinates.longitude,
    );
    return distance <= radiusInMiles;
  });
};

/**
 * Sort businesses by distance
 * @param businesses - Array of businesses
 * @param userLocation - User's location
 * @returns Sorted businesses
 */
export const sortByDistance = (
  businesses: Business[],
  userLocation: LocationCoords,
): Business[] => {
  return [...businesses].sort((a, b) => {
    const distA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.coordinates.latitude,
      a.coordinates.longitude,
    );
    const distB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.coordinates.latitude,
      b.coordinates.longitude,
    );
    return distA - distB;
  });
};
