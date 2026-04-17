import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBusinessReviews, flagReview, type ReviewDTO } from "../services/reviewService";
import {
  getPublicServicesForBusiness,
  getMyBusinesses,
  getPublicBusinessBySlug,
  getBusinessById,
} from "../services/businessManagementService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ReviewFlagModal } from "../components/reviews/ReviewFlagModal";
import { ReviewCard } from "../components/reviews/ReviewCard";
import { ReviewFiltersCard } from "../components/reviews/ReviewFiltersCard";

const PAGE_SIZE = 20;

export default function BusinessReviewsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug: paramBusinessSlug } = useParams<{ businessSlug?: string }>();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [services, setServices] = useState<ServiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterService, setFilterService] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  // Flag flow
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);

  // ── Resolve business id ───────────────────────────────────────────────────
  useEffect(() => {
    if (paramBusinessSlug) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramBusinessSlug);
      const load = isUUID ? getBusinessById(paramBusinessSlug) : getPublicBusinessBySlug(paramBusinessSlug);
      load
        .then((biz) => setBusinessId(biz.id))
        .catch(() => setError("Failed to load business."));
      return;
    }
    getMyBusinesses()
      .then((list) => list.length > 0 ? setBusinessId(list[0].id) : setError("No business found."))
      .catch(() => setError("Failed to load business."));
  }, [paramBusinessSlug]);

  // ── Load reviews + services once businessId is known ─────────────────────
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    Promise.all([
      getBusinessReviews(businessId, 1, PAGE_SIZE),
      getPublicServicesForBusiness(businessId),
    ])
      .then(([revs, svcs]) => {
        setReviews(revs);
        setHasMore(revs.length === PAGE_SIZE);
        setServices(svcs);
        setPage(1);
      })
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, [businessId]);

  async function handleLoadMore() {
    if (!businessId || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await getBusinessReviews(businessId, nextPage, PAGE_SIZE);
      setReviews((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      /* silently ignore */
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleFlag(reason: string) {
    if (!businessId || !flaggingId) return;
    setFlagSubmitting(true);
    setFlagError(null);
    try {
      const updated = await flagReview(businessId, flaggingId, reason);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setFlaggingId(null);
    } catch {
      setFlagError(t("reviews.flag.errorSubmit"));
    } finally {
      setFlagSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filterService !== "all" && r.serviceId !== filterService) return false;
      if (filterRating > 0 && r.rating !== filterRating) return false;
      if (filterFrom && new Date(r.createdAt) < new Date(filterFrom)) return false;
      if (filterTo && new Date(r.createdAt) > new Date(filterTo + "T23:59:59")) return false;
      return true;
    });
  }, [reviews, filterService, filterRating, filterFrom, filterTo]);

  const hasActiveFilters = filterService !== "all" || filterRating > 0 || filterFrom !== "" || filterTo !== "";
  const avgRating = filtered.length > 0 ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length : 0;

  function clearFilters() {
    setFilterService("all");
    setFilterRating(0);
    setFilterFrom("");
    setFilterTo("");
  }

  return (
    <>
      {flaggingId && (
        <ReviewFlagModal
          onSubmit={handleFlag}
          onClose={() => { setFlaggingId(null); setFlagError(null); }}
          submitting={flagSubmitting}
          error={flagError}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        {/* Header */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/${paramBusinessSlug}`)}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
                {t("reviews.title")}
              </h1>
              {!loading && (
                <p className="text-xs text-gray-500">
                  {filtered.length} of {reviews.length} {reviews.length !== 1 ? "reviews" : "review"}
                  {avgRating > 0 && ` · ${avgRating.toFixed(1)} ${t("reviews.avgSuffix")}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          <ReviewFiltersCard
            services={services}
            filterService={filterService}
            filterRating={filterRating}
            filterFrom={filterFrom}
            filterTo={filterTo}
            hasActiveFilters={hasActiveFilters}
            onServiceChange={setFilterService}
            onRatingChange={setFilterRating}
            onFromChange={setFilterFrom}
            onToChange={setFilterTo}
            onClear={clearFilters}
          />

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 flex flex-col items-center gap-3 text-center">
              <MaterialIcon name="error_outline" className="text-4xl text-red-400" />
              <p className="text-sm text-gray-500">{error}</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-3 text-center">
              <MaterialIcon name="rate_review" className="text-4xl text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-semibold text-[#111418] dark:text-white">
                {hasActiveFilters ? t("reviews.empty.noMatch") : t("reviews.empty.noReviews")}
              </p>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">
                  {t("reviews.clearFilters")}
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((review) => (
                <ReviewCard key={review.id} review={review} onFlag={setFlaggingId} />
              ))}

              {hasMore && !hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-sm font-semibold text-primary hover:underline disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingMore ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  ) : (
                    <>
                      <MaterialIcon name="expand_more" className="text-base leading-none" />
                      {t("reviews.loadMore")}
                    </>
                  )}
                </button>
              )}
              {hasMore && hasActiveFilters && (
                <p className="text-center text-xs text-gray-400 py-2">
                  {t("reviews.loadMoreNote")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
