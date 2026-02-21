import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  Business,
  SearchFilters,
  SearchResult,
  LocationCoords,
  LocationPermissionState,
} from "../../types/search";

export interface SearchState {
  // Search query and filters
  searchQuery: string;
  filters: SearchFilters;

  // Results
  results: Business[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // View mode
  viewMode: "list" | "map";

  // User location
  userLocation: LocationCoords | null;
  locationLoading: boolean;
  locationError: string | null;
  locationPermission: LocationPermissionState;

  // Selected business (for detail view or map marker)
  selectedBusinessId: string | null;

  // Favorites
  favorites: Set<string>;

  // Cache
  lastSearchQuery: string;
  lastSearchTimestamp: number;
}

const initialState: SearchState = {
  searchQuery: "",
  filters: {
    searchQuery: "",
    selectedCategories: [],
    sortBy: "relevance",
    radiusFilter: 5,
  },
  results: [],
  totalCount: 0,
  hasMore: true,
  currentPage: 1,
  loading: false,
  error: null,
  viewMode: "list",
  userLocation: null,
  locationLoading: false,
  locationError: null,
  locationPermission: "unknown",
  selectedBusinessId: null,
  favorites: new Set<string>(),
  lastSearchQuery: "",
  lastSearchTimestamp: 0,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    /**
     * Set the search query
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filters.searchQuery = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set active category filters
     */
    setSelectedCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.selectedCategories = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set sort option
     */
    setSortBy: (
      state,
      action: PayloadAction<"distance" | "rating" | "reviews" | "relevance">,
    ) => {
      state.filters.sortBy = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set search radius filter
     */
    setRadiusFilter: (state, action: PayloadAction<number>) => {
      state.filters.radiusFilter = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set minimum rating filter
     */
    setMinRating: (state, action: PayloadAction<number>) => {
      state.filters.minRating = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set search results from API
     */
    setResults: (state, action: PayloadAction<SearchResult>) => {
      state.results = action.payload.businesses;
      state.totalCount = action.payload.totalCount;
      state.hasMore = action.payload.hasMore ?? true;
      state.currentPage = action.payload.page ?? 1;
      state.loading = false;
      state.error = null;
      state.lastSearchQuery = state.searchQuery;
      state.lastSearchTimestamp = Date.now();
    },

    /**
     * Append more results for pagination
     */
    appendResults: (state, action: PayloadAction<SearchResult>) => {
      state.results.push(...action.payload.businesses);
      state.totalCount = action.payload.totalCount;
      state.hasMore = action.payload.hasMore ?? false;
      state.currentPage = action.payload.page ?? state.currentPage + 1;
      state.loading = false;
    },

    /**
     * Set loading state for results
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Toggle between list and map view
     */
    setViewMode: (state, action: PayloadAction<"list" | "map">) => {
      state.viewMode = action.payload;
    },

    /**
     * Set user's current location
     */
    setUserLocation: (state, action: PayloadAction<LocationCoords>) => {
      state.userLocation = action.payload;
      state.locationLoading = false;
      state.locationError = null;
    },

    /**
     * Set location loading state
     */
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.locationLoading = action.payload;
    },

    /**
     * Set location error
     */
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.locationError = action.payload;
      state.locationLoading = false;
    },

    /**
     * Set location permission state
     */
    setLocationPermission: (
      state,
      action: PayloadAction<LocationPermissionState>,
    ) => {
      state.locationPermission = action.payload;
    },

    /**
     * Select a business (for detail view or map marker highlight)
     */
    selectBusiness: (state, action: PayloadAction<string | null>) => {
      state.selectedBusinessId = action.payload;
    },

    /**
     * Toggle favorite status for a business
     */
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const businessId = action.payload;
      if (state.favorites.has(businessId)) {
        state.favorites.delete(businessId);
      } else {
        state.favorites.add(businessId);
      }
    },

    /**
     * Add business to favorites
     */
    addFavorite: (state, action: PayloadAction<string>) => {
      state.favorites.add(action.payload);
    },

    /**
     * Remove business from favorites
     */
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites.delete(action.payload);
    },

    /**
     * Set favorites (bulk operation)
     */
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = new Set(action.payload);
    },

    /**
     * Clear search results
     */
    clearResults: (state) => {
      state.results = [];
      state.totalCount = 0;
      state.hasMore = true;
      state.currentPage = 1;
      state.error = null;
    },

    /**
     * Reset all filters to default
     */
    resetFilters: (state) => {
      state.filters = {
        searchQuery: "",
        selectedCategories: [],
        sortBy: "relevance",
        radiusFilter: 5,
      };
      state.searchQuery = "";
      state.currentPage = 1;
    },

    /**
     * Reset entire search state
     */
    resetSearchState: () => {
      return initialState;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategories,
  setSortBy,
  setRadiusFilter,
  setMinRating,
  setResults,
  appendResults,
  setLoading,
  setError,
  setViewMode,
  setUserLocation,
  setLocationLoading,
  setLocationError,
  setLocationPermission,
  selectBusiness,
  toggleFavorite,
  addFavorite,
  removeFavorite,
  setFavorites,
  clearResults,
  resetFilters,
  resetSearchState,
} = searchSlice.actions;

export default searchSlice.reducer;
