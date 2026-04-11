import { useSearchPage } from "../hooks/useSearchPage";
import { SearchHeader } from "../components/search/SearchHeader";
import { SearchListView } from "../components/search/SearchListView";
import { SearchMapView } from "../components/search/SearchMapView";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { useTranslation } from "react-i18next";

export function SearchPage() {
  const { t } = useTranslation();
  const {
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
    onMarkerClick,
  } = useSearchPage();

  return (
    <div className="flex flex-col h-dvh w-full bg-white dark:bg-gray-900">
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

      {viewMode === "map" && (
        <SearchMapView
          results={results}
          loading={loading}
          error={error}
          userLocation={location}
          selectedMarkerId={selectedBusinessId}
          onMarkerClick={onMarkerClick}
          onBusinessClick={handleBusinessClick}
        />
      )}

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
            hasActiveSearch={hasActiveSearch}
            featuredResults={filteredFeatured}
          />
          {!loading && results.length === 0 && !hasActiveSearch && (
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <MaterialIcon name="travel_explore" className="text-[64px] text-primary opacity-30" />
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
