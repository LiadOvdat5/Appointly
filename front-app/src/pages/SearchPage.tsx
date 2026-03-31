import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import type { Business } from "../types/search";
import {
  setSearchQuery,
  setSelectedCategories,
  setLoading,
  setError,
  setResults,
  selectBusiness,
  setCategories,
  setAvailabilityDate,
  setAvailabilityTime,
  setViewMode,
} from "../features/search/searchSlice";
import {
  selectSearchQuery,
  selectResults,
  selectLoading,
  selectError,
  selectViewMode,
  selectSelectedCategories,
  selectTotalCount,
  selectHasMore,
  selectCurrentPage,
  selectCategories,
  selectAvailabilityDate,
  selectAvailabilityTimeFrom,
  selectAvailabilityTimeTo,
  selectSelectedBusinessId,
} from "../features/search/searchSelectors";
import {
  searchBusinesses,
  getFeaturedBusinesses,
  getNearbyBusinesses,
  searchByAvailability,
} from "../services/businessService";
import { fetchCategories } from "../services/categoryService";
import {
  followBusiness,
  unfollowBusiness,
  getFollowedBusinesses,
} from "../services/followService";
import { useLocationTracking } from "../hooks/useLocationTracking";
import { SearchHeader } from "../components/search/SearchHeader";
import { SearchListView } from "../components/search/SearchListView";
import { SearchMapView } from "../components/search/SearchMapView";
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
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Auth
  const authUser = useSelector((s: RootState) => s.auth.user);
  const authStatus = useSelector((s: RootState) => s.auth.status);
  const isAuthenticated = authStatus === "authenticated";

  // Local follow state (backed by API when authenticated)
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Redux selectors
  const searchQuery = useSelector(selectSearchQuery);
  const results = useSelector(selectResults);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const viewMode = useSelector(selectViewMode);
  const selectedCategories = useSelector(selectSelectedCategories);
  const totalCount = useSelector(selectTotalCount);
  const hasMore = useSelector(selectHasMore);
  const currentPage = useSelector(selectCurrentPage);

  // Selected business (for map marker highlight)
  const selectedBusinessId = useSelector(selectSelectedBusinessId);

  // Availability filter selectors
  const availabilityDate = useSelector(selectAvailabilityDate);
  const availabilityTimeFrom = useSelector(selectAvailabilityTimeFrom);
  const availabilityTimeTo = useSelector(selectAvailabilityTimeTo);

  // Local state for featured businesses
  const [featuredResults, setFeaturedResults] = React.useState<Business[]>([]);

  // Load categories on mount (so filter popup is populated quickly)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        dispatch(setCategories(cats));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    loadCategories();
  }, [dispatch]);

  // Load real follow state from API (authenticated customers only)
  useEffect(() => {
    if (!isAuthenticated) return;
    getFollowedBusinesses()
      .then((businesses) => setFollowedIds(businesses.map((b) => b.id)))
      .catch(() => {
        /* silently ignore */
      });
  }, [isAuthenticated]);

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

  // When location becomes available (or map view is activated) with no active search,
  // fetch nearby businesses sorted by distance.
  useEffect(() => {
    if (
      !location ||
      searchQuery ||
      availabilityDate ||
      selectedCategories.length > 0 ||
      results.length > 0
    )
      return;

    const fetchNearby = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const result = await getNearbyBusinesses(location, 50, []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, viewMode]);

  // Handle search
  // When an availability date is set, delegates to searchByAvailability.
  // Otherwise performs a standard keyword/category search.
  const handleSearch = useCallback(
    async (
      query: string,
      catOverride?: string[],
      dateOverride?: string | null,
      timeFromOverride?: string | null,
      timeToOverride?: string | null,
    ) => {
      dispatch(setSearchQuery(query));
      dispatch(setLoading(true));
      dispatch(setError(null));

      const cats = catOverride ?? selectedCategories;
      const date = dateOverride !== undefined ? dateOverride : availabilityDate;
      const timeFrom =
        timeFromOverride !== undefined
          ? timeFromOverride
          : availabilityTimeFrom;
      const timeTo =
        timeToOverride !== undefined ? timeToOverride : availabilityTimeTo;

      try {
        if (date) {
          // Build from/to datetimes
          const fromDate = new Date(`${date}T${timeFrom ?? "00:00"}:00`);
          const toDate = new Date(`${date}T${timeTo ?? "23:59"}:00`);
          const categoryId =
            cats.length > 0 && cats[0] !== "all" ? cats[0] : undefined;
          const result = await searchByAvailability(
            categoryId ?? "",
            fromDate,
            toDate,
          );
          dispatch(setResults(result));
        } else {
          const result = await searchBusinesses({
            searchQuery: query,
            selectedCategories: cats,
          });
          dispatch(setResults(result));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search businesses";
        dispatch(setError(errorMessage));
      }
    },
    [
      dispatch,
      selectedCategories,
      availabilityDate,
      availabilityTimeFrom,
      availabilityTimeTo,
    ],
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

      // immediately search using the updated categories list
      handleSearch(searchQuery, updatedCategories);
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

  // Handle follow toggle — backed by real API when authenticated
  const handleFavoriteClick = useCallback(
    async (businessId: string) => {
      if (!isAuthenticated) return;
      const isFollowing = followedIds.includes(businessId);
      // Optimistic update
      setFollowedIds((prev) =>
        isFollowing
          ? prev.filter((id) => id !== businessId)
          : [...prev, businessId],
      );
      try {
        if (isFollowing) {
          await unfollowBusiness(businessId);
        } else {
          await followBusiness(businessId);
        }
      } catch {
        // Revert optimistic update on failure
        setFollowedIds((prev) =>
          isFollowing
            ? [...prev, businessId]
            : prev.filter((id) => id !== businessId),
        );
      }
    },
    [isAuthenticated, followedIds],
  );

  // Handle business card click
  const handleBusinessClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      navigate(`/business/${businessId}`);
    },
    [dispatch, navigate],
  );

  // Handle "View Business" button click
  const handleViewServicesClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      navigate(`/business/${businessId}`);
    },
    [dispatch, navigate],
  );

  // Handle availability date change
  const handleAvailabilityDateChange = useCallback(
    (date: string | null) => {
      dispatch(setAvailabilityDate(date));
      handleSearch(
        searchQuery,
        undefined,
        date,
        availabilityTimeFrom,
        availabilityTimeTo,
      );
    },
    [
      dispatch,
      handleSearch,
      searchQuery,
      availabilityTimeFrom,
      availabilityTimeTo,
    ],
  );

  // Handle availability time range change
  const handleAvailabilityTimeChange = useCallback(
    (from: string | null, to: string | null) => {
      dispatch(setAvailabilityTime({ from, to }));
      if (availabilityDate) {
        handleSearch(searchQuery, undefined, availabilityDate, from, to);
      }
    },
    [dispatch, handleSearch, searchQuery, availabilityDate],
  );

  // Handle view mode toggle
  const handleViewChange = useCallback(
    (view: "list" | "map") => {
      dispatch(setViewMode(view));
    },
    [dispatch],
  );

  // Handle clear search (also clears availability filter)
  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(""));
    dispatch(setSelectedCategories([]));
    dispatch(setAvailabilityDate(null));
    dispatch(setAvailabilityTime({ from: null, to: null }));
    dispatch(setResults({ businesses: [], totalCount: 0, hasMore: false }));
  }, [dispatch]);

  // Category options for filter
  const categories = useSelector(selectCategories);

  const categoryOptions = useMemo(() => {
    const dynamic = categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      icon: cat.iconName || "category", // fallback icon when none provided
    }));
    return [
      { id: "all", label: t("search.filters.all"), icon: "star" },
      ...dynamic,
    ];
  }, [categories, t]);

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900">
      {/* Header with Search and Filters */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        categoryOptions={categoryOptions}
        availabilityDate={availabilityDate}
        availabilityTimeFrom={availabilityTimeFrom}
        availabilityTimeTo={availabilityTimeTo}
        onAvailabilityDateChange={handleAvailabilityDateChange}
        onAvailabilityTimeChange={handleAvailabilityTimeChange}
        onClear={handleClearSearch}
        currentView={viewMode}
        onViewChange={handleViewChange}
      />

      {/* Map View */}
      {viewMode === "map" && (
        <SearchMapView
          results={results}
          loading={loading}
          error={error}
          userLocation={location}
          selectedMarkerId={selectedBusinessId}
          onMarkerClick={(id) => dispatch(selectBusiness(id))}
          onBusinessClick={handleBusinessClick}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
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
            favorites={followedIds}
            currentUserId={authUser?.id}
            hasActiveSearch={
              !!searchQuery ||
              selectedCategories.length > 0 ||
              !!availabilityDate
            }
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
            !availabilityDate &&
            selectedCategories.length === 0 && (
              <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <MaterialIcon
                      name="travel_explore"
                      className="text-[64px] text-primary opacity-30"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("search.emptyState.title")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
                    {t("search.emptyState.text")}
                  </p>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
