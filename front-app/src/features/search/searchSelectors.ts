import type { RootState } from "../../redux/store";
import type { Business } from "../../types/search";

/**
 * Select the search query
 */
export const selectSearchQuery = (state: RootState) => state.search.searchQuery;

/**
 * Select current filters
 */
export const selectFilters = (state: RootState) => state.search.filters;

/**
 * Select search results
 */
export const selectResults = (state: RootState) => state.search.results;

/**
 * Select total count of results
 */
export const selectTotalCount = (state: RootState) => state.search.totalCount;

/**
 * Select if there are more results available
 */
export const selectHasMore = (state: RootState) => state.search.hasMore;

/**
 * Select current page
 */
export const selectCurrentPage = (state: RootState) => state.search.currentPage;

/**
 * Select loading state
 */
export const selectLoading = (state: RootState) => state.search.loading;

/**
 * Select error state
 */
export const selectError = (state: RootState) => state.search.error;

/**
 * Select current view mode
 */
export const selectViewMode = (state: RootState) => state.search.viewMode;

/**
 * Select user location
 */
export const selectUserLocation = (state: RootState) =>
  state.search.userLocation;

/**
 * Select location loading state
 */
export const selectLocationLoading = (state: RootState) =>
  state.search.locationLoading;

/**
 * Select location error
 */
export const selectLocationError = (state: RootState) =>
  state.search.locationError;

/**
 * Select location permission state
 */
export const selectLocationPermission = (state: RootState) =>
  state.search.locationPermission;

/**
 * Select selected business ID
 */
export const selectSelectedBusinessId = (state: RootState) =>
  state.search.selectedBusinessId;

/**
 * Select the currently selected business object
 */
export const selectSelectedBusiness = (state: RootState): Business | null => {
  const selectedId = state.search.selectedBusinessId;
  if (!selectedId) return null;
  return (
    state.search.results.find((business) => business.id === selectedId) || null
  );
};

/**
 * Select favorites set
 */
export const selectFavorites = (state: RootState) => state.search.favorites;

/**
 * Select if a specific business is favorited
 */
export const selectIsFavorited = (state: RootState, businessId: string) =>
  state.search.favorites.has(businessId);

/**
 * Select all favorited business IDs as array
 */
export const selectFavoritedBusinessIds = (state: RootState) =>
  Array.from(state.search.favorites);

/**
 * Select favorited businesses from results
 */
export const selectFavoritedBusinesses = (state: RootState): Business[] => {
  const favorites = state.search.favorites;
  return state.search.results.filter((business) => favorites.has(business.id));
};

/**
 * Select selected categories
 */
export const selectSelectedCategories = (state: RootState) =>
  state.search.filters.selectedCategories;

export const selectCategories = (state: RootState) => state.search.categories;

/**
 * Select sort option
 */
export const selectSortBy = (state: RootState) => state.search.filters.sortBy;

/**
 * Select radius filter
 */
export const selectRadiusFilter = (state: RootState) =>
  state.search.filters.radiusFilter;

/**
 * Select minimum rating filter
 */
export const selectMinRating = (state: RootState) =>
  state.search.filters.minRating;

/**
 * Select if any filters are active
 */
export const selectHasActiveFilters = (state: RootState): boolean => {
  const filters = state.search.filters;
  return (
    filters.searchQuery !== "" ||
    filters.selectedCategories.length > 0 ||
    (filters.minRating ?? 0) > 0 ||
    (filters.radiusFilter ?? 5) !== 5
  );
};

/**
 * Select last search query (for cache comparison)
 */
export const selectLastSearchQuery = (state: RootState) =>
  state.search.lastSearchQuery;

/**
 * Select last search timestamp
 */
export const selectLastSearchTimestamp = (state: RootState) =>
  state.search.lastSearchTimestamp;

/**
 * Select results filtered by category
 */
export const selectResultsByCategory = (
  state: RootState,
  category: string,
): Business[] => {
  if (category === "all" || !category) return state.search.results;
  return state.search.results.filter(
    (business) => business.category === category,
  );
};

/**
 * Select results sorted by distance
 */
export const selectResultsSortedByDistance = (state: RootState): Business[] => {
  return [...state.search.results].sort(
    (a, b) => (a.distance ?? 999) - (b.distance ?? 999),
  );
};

/**
 * Select results sorted by rating
 */
export const selectResultsSortedByRating = (state: RootState): Business[] => {
  return [...state.search.results].sort((a, b) => b.rating - a.rating);
};

/**
 * Select results sorted by review count
 */
export const selectResultsSortedByReviews = (state: RootState): Business[] => {
  return [...state.search.results].sort(
    (a, b) => b.reviewCount - a.reviewCount,
  );
};
