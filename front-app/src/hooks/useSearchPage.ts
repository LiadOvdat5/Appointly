import { useEffect, useCallback, useMemo, useState } from "react";
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
import { useLocationTracking } from "./useLocationTracking";

export function useSearchPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector((s: RootState) => s.auth.user);
  const authStatus = useSelector((s: RootState) => s.auth.status);
  const isAuthenticated = authStatus === "authenticated";

  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [featuredResults, setFeaturedResults] = useState<Business[]>([]);

  const searchQuery = useSelector(selectSearchQuery);
  const results = useSelector(selectResults);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const viewMode = useSelector(selectViewMode);
  const selectedCategories = useSelector(selectSelectedCategories);
  const totalCount = useSelector(selectTotalCount);
  const hasMore = useSelector(selectHasMore);
  const currentPage = useSelector(selectCurrentPage);
  const selectedBusinessId = useSelector(selectSelectedBusinessId);
  const availabilityDate = useSelector(selectAvailabilityDate);
  const availabilityTimeFrom = useSelector(selectAvailabilityTimeFrom);
  const availabilityTimeTo = useSelector(selectAvailabilityTimeTo);
  const categories = useSelector(selectCategories);

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then((cats) => dispatch(setCategories(cats)))
      .catch((err) => console.error("Failed to fetch categories", err));
  }, [dispatch]);

  // Load real follow state from API
  useEffect(() => {
    if (!isAuthenticated) return;
    getFollowedBusinesses()
      .then((businesses) => setFollowedIds(businesses.map((b) => b.id)))
      .catch(() => { /* silently ignore */ });
  }, [isAuthenticated]);

  // Load featured businesses on mount
  useEffect(() => {
    getFeaturedBusinesses()
      .then(setFeaturedResults)
      .catch((err) => console.error("Failed to load featured businesses:", err));
  }, []);

  const { location, requestLocation } = useLocationTracking({ useDefaultLocation: true });

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Fetch nearby businesses when location becomes available with no active search
  useEffect(() => {
    if (!location || searchQuery || availabilityDate || selectedCategories.length > 0 || results.length > 0)
      return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    getNearbyBusinesses(location, 50, [])
      .then((result) => dispatch(setResults(result)))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to fetch nearby businesses";
        dispatch(setError(msg));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, viewMode]);

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
      const timeFrom = timeFromOverride !== undefined ? timeFromOverride : availabilityTimeFrom;
      const timeTo = timeToOverride !== undefined ? timeToOverride : availabilityTimeTo;

      try {
        if (date) {
          const fromDate = new Date(`${date}T${timeFrom ?? "00:00"}:00`);
          const toDate = new Date(`${date}T${timeTo ?? "23:59"}:00`);
          const categoryId = cats.length > 0 && cats[0] !== "all" ? cats[0] : undefined;
          const result = await searchByAvailability(categoryId ?? "", fromDate, toDate);
          dispatch(setResults(result));
        } else {
          const result = await searchBusinesses({ searchQuery: query, selectedCategories: cats });
          dispatch(setResults(result));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to search businesses";
        dispatch(setError(msg));
      }
    },
    [dispatch, selectedCategories, availabilityDate, availabilityTimeFrom, availabilityTimeTo],
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      let updated = [...selectedCategories];
      if (categoryId === "all") {
        updated = [];
      } else {
        const idx = updated.indexOf(categoryId);
        if (idx > -1) updated.splice(idx, 1);
        else updated.push(categoryId);
      }
      dispatch(setSelectedCategories(updated));
      handleSearch(searchQuery, updated);
    },
    [dispatch, selectedCategories, searchQuery, handleSearch],
  );

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    console.warn("Pagination not supported by current backend API");
  }, [loading, hasMore]);

  const handleFavoriteClick = useCallback(
    async (businessId: string) => {
      if (!isAuthenticated) return;
      const isFollowing = followedIds.includes(businessId);
      setFollowedIds((prev) =>
        isFollowing ? prev.filter((id) => id !== businessId) : [...prev, businessId],
      );
      try {
        if (isFollowing) await unfollowBusiness(businessId);
        else await followBusiness(businessId);
      } catch {
        setFollowedIds((prev) =>
          isFollowing ? [...prev, businessId] : prev.filter((id) => id !== businessId),
        );
      }
    },
    [isAuthenticated, followedIds],
  );

  const handleBusinessClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      const business = results.find((b) => b.id === businessId);
      navigate(`/business/${business?.slug ?? businessId}`);
    },
    [dispatch, navigate, results],
  );

  const handleViewServicesClick = useCallback(
    (businessId: string) => {
      dispatch(selectBusiness(businessId));
      const business = results.find((b) => b.id === businessId);
      navigate(`/business/${business?.slug ?? businessId}`);
    },
    [dispatch, navigate, results],
  );

  const handleAvailabilityDateChange = useCallback(
    (date: string | null) => {
      dispatch(setAvailabilityDate(date));
      handleSearch(searchQuery, undefined, date, availabilityTimeFrom, availabilityTimeTo);
    },
    [dispatch, handleSearch, searchQuery, availabilityTimeFrom, availabilityTimeTo],
  );

  const handleAvailabilityTimeChange = useCallback(
    (from: string | null, to: string | null) => {
      dispatch(setAvailabilityTime({ from, to }));
      if (availabilityDate) {
        handleSearch(searchQuery, undefined, availabilityDate, from, to);
      }
    },
    [dispatch, handleSearch, searchQuery, availabilityDate],
  );

  const handleViewChange = useCallback(
    (view: "list" | "map") => dispatch(setViewMode(view)),
    [dispatch],
  );

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(""));
    dispatch(setSelectedCategories([]));
    dispatch(setAvailabilityDate(null));
    dispatch(setAvailabilityTime({ from: null, to: null }));
    dispatch(setResults({ businesses: [], totalCount: 0, hasMore: false }));
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const dynamic = categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      icon: cat.iconName || "category",
    }));
    return [{ id: "all", label: t("search.filters.all"), icon: "star" }, ...dynamic];
  }, [categories, t]);

  const hasActiveSearch = !!searchQuery || selectedCategories.length > 0 || !!availabilityDate;

  const filteredFeatured = searchQuery
    ? undefined
    : featuredResults.filter(
        (b) => !selectedCategories.length || selectedCategories.includes(b.category),
      );

  return {
    // State
    searchQuery,
    results,
    loading,
    error,
    viewMode,
    selectedCategories,
    totalCount,
    hasMore,
    currentPage,
    selectedBusinessId,
    availabilityDate,
    availabilityTimeFrom,
    availabilityTimeTo,
    followedIds,
    authUser,
    location,
    categoryOptions,
    hasActiveSearch,
    filteredFeatured,
    // Handlers
    handleSearch,
    handleCategoryChange,
    handleLoadMore,
    handleFavoriteClick,
    handleBusinessClick,
    handleViewServicesClick,
    handleAvailabilityDateChange,
    handleAvailabilityTimeChange,
    handleViewChange,
    handleClearSearch,
    onMarkerClick: (id: string) => dispatch(selectBusiness(id)),
  };
}
