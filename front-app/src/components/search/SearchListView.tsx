import { useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Business } from "../../types/search";
import { BusinessCard } from "./BusinessCard";
import { MaterialIcon } from "../UI/MaterialIcon";

interface SearchListViewProps {
  results: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  onLoadMore: () => void;
  onFavoriteClick?: (businessId: string, isFavorite: boolean) => void;
  onBusinessClick?: (businessId: string) => void;
  onViewServicesClick?: (businessId: string) => void;
  favorites: string[];
  currentUserId?: string;
  featuredResults?: Business[];
  hasActiveSearch?: boolean;
  className?: string;
}

/**
 * SearchListView Component
 * Displays search results in a scrollable list format
 * Includes featured businesses section and near you section
 * Supports infinite scroll or pagination
 */
export function SearchListView({
  results,
  loading,
  error,
  hasMore,
  totalCount,
  onLoadMore,
  onFavoriteClick,
  onBusinessClick,
  onViewServicesClick,
  favorites,
  currentUserId,
  featuredResults,
  hasActiveSearch = false,
  className,
}: SearchListViewProps) {
  const { t } = useTranslation();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const handleFavorite = useCallback(
    (businessId: string, isFavorite: boolean) => {
      onFavoriteClick?.(businessId, isFavorite);
    },
    [onFavoriteClick],
  );

  const handleViewServices = useCallback(
    (businessId: string) => {
      onViewServicesClick?.(businessId);
    },
    [onViewServicesClick],
  );

  const handleCardClick = useCallback(
    (businessId: string) => {
      onBusinessClick?.(businessId);
    },
    [onBusinessClick],
  );

  // Show error state
  if (error) {
    return (
      <main
        className={[
          "flex-1 flex items-center justify-center px-4 py-8",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MaterialIcon
              name="error_outline"
              className="text-[48px] text-red-500"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("search.list.error")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </main>
    );
  }

  // Show nothing when there's no active search and no results — let the parent render its initial explore state
  if (!loading && results.length === 0 && !featuredResults?.length && !hasActiveSearch) {
    return null;
  }

  // Show empty state only when there's an active search that returned nothing
  if (!loading && results.length === 0 && !featuredResults?.length && hasActiveSearch) {
    return (
      <main
        className={[
          "flex-1 flex items-center justify-center px-4 py-8",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MaterialIcon
              name="search_off"
              className="text-[48px] text-gray-400"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("search.list.noResults")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t("search.list.noResultsHint")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={[
        "flex-1 pb-24 w-full max-w-2xl mx-auto overflow-y-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Visually-hidden live region — announces result count to screen readers */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {loading
          ? t("search.list.loadingMore")
          : t("search.list.resultCount", { count: results.length + (featuredResults?.length ?? 0) })}
      </p>
      {/* Featured Businesses Section */}
      {featuredResults && featuredResults.length > 0 && (
        <section className="flex flex-col">
          <div className="px-4 pb-3 pt-6 flex justify-between items-end">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
              {t("search.list.featuredBusinesses")}
            </h3>
            <a
              href="#"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("search.list.seeAll")}
            </a>
          </div>

          <div className="space-y-4 px-4 pb-4">
            {featuredResults.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                variant="vertical"
                isFavorite={favorites.includes(business.id)}
                currentUserId={currentUserId}
                onFavoriteClick={handleFavorite}
                onViewServicesClick={handleViewServices}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Results Section */}
      <section className="flex flex-col">
        <div className="px-4 pb-3 pt-6 flex justify-between items-end">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            {featuredResults?.length ? t("search.list.nearYou") : t("search.list.searchResults")}
          </h3>
          {totalCount > 0 && (
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {results.length} of {totalCount}
            </span>
          )}
        </div>

        <div className="space-y-4 px-4 pb-4">
          {results.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              variant="vertical"
              isFavorite={favorites.includes(business.id)}
              currentUserId={currentUserId}
              onFavoriteClick={handleFavorite}
              onViewServicesClick={handleViewServices}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div
          role="status"
          aria-busy="true"
          aria-label={t("search.list.loadingMore")}
          className="px-4 py-8 flex justify-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <p className="text-sm text-gray-600 dark:text-gray-400" aria-hidden="true">
              {t("search.list.loadingMore")}
            </p>
          </div>
        </div>
      )}

      {/* Load More Observer */}
      {hasMore && <div ref={observerTarget} className="py-8" />}

      {/* End of Results */}
      {!hasMore && results.length > 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("search.list.noMoreResults")}
          </p>
        </div>
      )}
    </main>
  );
}
