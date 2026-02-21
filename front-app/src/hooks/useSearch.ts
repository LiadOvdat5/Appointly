import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchBusinesses } from "../services/businessService";
import {
  setLoading,
  setError,
  setResults,
  resetFilters,
} from "../features/search/searchSlice";
import {
  selectSearchQuery,
  selectFilters,
  selectLastSearchQuery,
  selectLastSearchTimestamp,
} from "../features/search/searchSelectors";
import { SEARCH_DEBOUNCE_DELAY } from "../constants/googleMapsConfig";

interface UseSearchOptions {
  debounceDelay?: number;
  cacheTimeout?: number; // in milliseconds
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseSearchReturn {
  search: (query: string, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  clearSearch: () => void;
  isSearchCached: () => boolean;
}

/**
 * useSearch Hook
 * Manages search functionality with debouncing and caching
 * Integrates with Redux state management
 * Handles API calls and error management
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceDelay = SEARCH_DEBOUNCE_DELAY,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
  } = options;

  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const filters = useSelector(selectFilters);
  const lastSearchQuery = useSelector(selectLastSearchQuery);
  const lastSearchTimestamp = useSelector(selectLastSearchTimestamp);

  // Refs for debouncing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const lastSearchRef = useRef<string>("");
  const currentPageRef = useRef<number>(1);

  /**
   * Perform search request
   */
  const performSearch = useCallback(
    async (query: string) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const result = await searchBusinesses({
          ...filters,
          searchQuery: query,
        });

        // Backend doesn't support pagination, so always replace results
        dispatch(setResults(result));
        currentPageRef.current = 1;

        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Search failed";
        dispatch(setError(errorMessage));
        onError?.(errorMessage);
      }
    },
    [dispatch, filters, onSuccess, onError],
  );

  /**
   * Search with debouncing
   * Prevents excessive API calls while typing
   */
  const search = useCallback(
    async (query: string) => {
      lastSearchRef.current = query;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceDelay);
    },
    [performSearch, debounceDelay],
  );

  /**
   * Load more results (pagination)
   * NOTE: Backend does not support pagination
   */
  const loadMore = useCallback(async () => {
    if (!lastSearchRef.current) return;
    // Pagination not supported by backend
    console.warn("Pagination not supported by current backend API");
  }, []);

  /**
   * Clear search and reset filters
   */
  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    lastSearchRef.current = "";
    dispatch(resetFilters());
  }, [dispatch]);

  /**
   * Check if current search result is cached (within timeout)
   */
  const isSearchCached = useCallback((): boolean => {
    if (lastSearchQuery !== searchQuery) {
      return false;
    }
    const timeSinceLastSearch = Date.now() - lastSearchTimestamp;
    return timeSinceLastSearch < cacheTimeout;
  }, [searchQuery, lastSearchQuery, lastSearchTimestamp, cacheTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    search,
    loadMore,
    clearSearch,
    isSearchCached,
  };
}
