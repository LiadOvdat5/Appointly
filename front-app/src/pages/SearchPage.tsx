import React, { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../redux/store";
import type { Business } from "../types/search";
import {
  setSearchQuery,
  setSelectedCategories,
  setLoading,
  setError,
  setResults,
  selectBusiness,
  toggleFavorite,
} from "../features/search/searchSlice";
import {
  selectSearchQuery,
  selectResults,
  selectLoading,
  selectError,
  selectViewMode,
  selectSelectedCategories,
  selectFavorites,
  selectTotalCount,
  selectHasMore,
  selectCurrentPage,
} from "../features/search/searchSelectors";
import {
  searchBusinesses,
  getFeaturedBusinesses,
  getNearbyBusinesses,
} from "../services/businessService";
import { BUSINESS_CATEGORIES } from "../constants/googleMapsConfig";
import { useLocationTracking } from "../hooks/useLocationTracking";
import { SearchHeader } from "../components/search/SearchHeader";
import { SearchListView } from "../components/search/SearchListView";
import { MaterialIcon } from "../components/UI/MaterialIcon";

/**
 * SearchPage Component
 * Main container for search functionality
 * Manages:
 * - Search state and filters
 * - View mode (list/map) switching
 * - Favorite management
 * - Business result fetching and caching
 * - Featured businesses loading
 */
export function SearchPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const searchQuery = useSelector(selectSearchQuery);
  const results = useSelector(selectResults);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const viewMode = useSelector(selectViewMode);
  const selectedCategories = useSelector(selectSelectedCategories);
  const favorites = useSelector(selectFavorites);
  const totalCount = useSelector(selectTotalCount);
  const hasMore = useSelector(selectHasMore);
  const currentPage = useSelector(selectCurrentPage);

  // Local state for featured businesses
  const [featuredResults, setFeaturedResults] = React.useState<Business[]>([]);

  // Load featured businesses on mount
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featured = await getFeaturedBusinesses();
        setFeaturedResults(featured);
      } catch (err) {
        console.error("Failed to load featured businesses:", err);
      }
    };

    loadFeatured();
  }, []);

  // --- Location tracking (Phase 5 integration) ---
  const { location, requestLocation } = useLocationTracking({
    useDefaultLocation: true,
  });

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // When location becomes available and there's no query, fetch nearby businesses using category
  useEffect(() => {
    if (!location || searchQuery) return;

    const fetchNearby = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const result = await getNearbyBusinesses(
          location,
          5,
          selectedCategories,
        );
        dispatch(setResults(result));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch nearby businesses";
        dispatch(setError(errorMessage));
      }
    };

    fetchNearby();
  }, [location, searchQuery, selectedCategories, dispatch]);

  // Handle search
  const handleSearch = useCallback(
    async (query: string) => {
      dispatch(setSearchQuery(query));
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const result = await searchBusinesses({
          searchQuery: query,
          selectedCategories,
        });
        dispatch(setResults(result));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search businesses";
        dispatch(setError(errorMessage));
      }
    },
    [dispatch, selectedCategories],
  );

  // Handle category filter change
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      let updatedCategories = [...selectedCategories];

      if (categoryId === "all") {
        updatedCategories = [];
      } else {
        const index = updatedCategories.indexOf(categoryId);
        if (index > -1) {
          updatedCategories.splice(index, 1);
        } else {
          updatedCategories.push(categoryId);
        }
      }

      dispatch(setSelectedCategories(updatedCategories));

      // Re-run search with new categories
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    },
    [dispatch, selectedCategories, searchQuery, handleSearch],
  );

  // Handle load more - Backend does not support pagination
  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    // Backend currently doesn't support pagination
    // This is a stub for future implementation
    console.warn("Pagination not supported by current backend API");
  }, [loading, hasMore]);

  // Handle favorite toggle
  const handleFavoriteClick = useCallback(
    (businessId: string) => {
      dispatch(toggleFavorite(businessId));
      // TODO: Persist to backend in Phase 6
    },
    [dispatch],
  );

  // Handle business card click
  const handleBusinessClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      // TODO: Navigate to business detail view in Phase 6
    },
    [dispatch],
  );

  // Handle view services click
  const handleViewServicesClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      // TODO: Navigate to booking flow in Phase 6
    },
    [dispatch],
  );

  // View mode is list-only for now

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(""));
    dispatch(setSelectedCategories([]));
  }, [dispatch]);

  // Category options for filter
  const categoryOptions = useMemo(
    () =>
      BUSINESS_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.name,
        icon: cat.icon,
      })),
    [],
  );

  // Map controls removed (maps disabled for now)

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900">
      {/* Header with Search and Filters */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        categoryOptions={categoryOptions}
        onClear={handleClearSearch}
      />
      {/* Main Content - List View (maps disabled) */}
      <div className="sticky top-35 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3" />
      {/* Main Content - List View */}

      <SearchListView
        results={results}
        loading={loading}
        error={error}
        hasMore={hasMore}
        totalCount={totalCount}
        currentPage={currentPage}
        onLoadMore={handleLoadMore}
        onFavoriteClick={handleFavoriteClick}
        onBusinessClick={handleBusinessClick}
        onViewServicesClick={handleViewServicesClick}
        favorites={favorites}
        featuredResults={
          searchQuery
            ? undefined
            : featuredResults.filter(
                (b) =>
                  !selectedCategories.length ||
                  selectedCategories.includes(b.category),
              )
        }
      />
      {/* Initial Empty State */}
      {!loading &&
        results.length === 0 &&
        !searchQuery &&
        viewMode === "list" && (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MaterialIcon
                  name="travel_explore"
                  className="text-[64px] text-primary opacity-30"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Explore Businesses
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
                Search for your favorite salons, doctors, fitness centers, and
                more
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
