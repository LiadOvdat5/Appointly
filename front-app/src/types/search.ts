/**
 * Business entity type representing a business/service provider
 */
export interface Business {
  id: string;
  name: string;
  description?: string;
  rating: number;
  reviewCount: number;
  category: string;
  location: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // in miles or km from user location
  imageUrl?: string;
  services: Service[];
  phone?: string;
  email?: string;
  website?: string;
  isFavorite?: boolean;
  hoursOfOperation?: HoursOfOperation;
}

/**
 * Service offered by a business
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

/**
 * Business hours information
 */
export interface HoursOfOperation {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  isOpen?: boolean;
}

/**
 * Search filter configuration
 */
export interface SearchFilters {
  searchQuery: string;
  selectedCategories: string[];
  sortBy?: "distance" | "rating" | "reviews" | "relevance";
  radiusFilter?: number; // in miles or km
  minRating?: number;
}

/**
 * Search results response from API
 */
export interface SearchResult {
  businesses: Business[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

/**
 * Map marker representing a business on the map
 */
export interface MapMarker {
  businessId: string;
  position: {
    latitude: number;
    longitude: number;
  };
  title: string;
  rating: number;
  category: string;
  imageUrl?: string;
  infoWindowData?: {
    name: string;
    rating: number;
    distance?: number;
  };
}

/**
 * User's geographic location
 */
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

/**
 * Clustered markers for map rendering
 */
export interface ClusterMarker extends MapMarker {
  clusterSize?: number;
  isCluster?: boolean;
}

/**
 * Business category with metadata
 */
export interface BusinessCategory {
  id: string;
  name: string;
  icon: string; // Material Symbol icon name
  description?: string;
}

/**
 * Geolocation permission state
 */
export type LocationPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unknown";
