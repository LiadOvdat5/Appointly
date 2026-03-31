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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Flag Modal ───────────────────────────────────────────────────────────────

function FlagModal({
  onSubmit,
  onClose,
  submitting,
  error,
}: {
  onSubmit: (reason: string) => void;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold text-[#111418] dark:text-white text-base">{t("reviews.flag.title")}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t("reviews.flag.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <MaterialIcon name="close" className="text-xl text-gray-500" />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("reviews.flag.placeholder")}
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-[#111418] dark:text-white outline-none resize-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSubmit(reason)}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <MaterialIcon name="flag" className="text-base" />
            )}
            {submitting ? t("reviews.flag.submitting") : t("reviews.flag.submitButton")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm font-semibold py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {t("reviews.flag.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  onFlag,
}: {
  review: ReviewDTO;
  onFlag: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className={`p-5 space-y-3 ${review.isFlagged ? "border-orange-200 dark:border-orange-800" : ""}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-[#111418] dark:text-white">
              {review.customerName}
            </span>
            {review.isFlagged && (
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full px-2 py-0.5 shrink-0">
                <MaterialIcon name="flag" className="text-xs leading-none" />
                {t("reviews.badge.flagged")}
              </span>
            )}
          </div>

          {/* Service + date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {review.serviceName && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <MaterialIcon name="content_cut" className="text-xs leading-none" />
                {review.serviceName}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Stars + flag button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcon
                key={s}
                name={review.rating >= s ? "star" : "star_border"}
                className={`text-base leading-none ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={review.isFlagged}
            onClick={() => onFlag(review.id)}
            title={review.isFlagged ? t("reviews.flag.alreadyFlagged") : t("reviews.flag.flagAsInappropriate")}
            className={`p-1.5 rounded-lg transition-colors ${
              review.isFlagged
                ? "text-orange-400 cursor-not-allowed"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <MaterialIcon
              name={review.isFlagged ? "flag" : "outlined_flag"}
              className="text-base leading-none"
            />
          </button>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          "{review.comment}"
        </p>
      )}

      {/* Flagged note */}
      {review.isFlagged && (
        <p className="text-xs text-orange-500 flex items-center gap-1 pt-2 border-t border-orange-100 dark:border-orange-900/30">
          <MaterialIcon name="info" className="text-sm leading-none" />
          {t("reviews.flag.pendingNote")}
        </p>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function BusinessReviewsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug: paramBusinessSlug } = useParams<{ businessSlug?: string }>();

  // Business id resolved from param or owner's first business
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Data
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [services, setServices] = useState<ServiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterService, setFilterService] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<number>(0); // 0 = all
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

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filterService !== "all" && r.serviceId !== filterService) return false;
      if (filterRating > 0 && r.rating !== filterRating) return false;
      if (filterFrom) {
        const from = new Date(filterFrom);
        if (new Date(r.createdAt) < from) return false;
      }
      if (filterTo) {
        const to = new Date(filterTo + "T23:59:59");
        if (new Date(r.createdAt) > to) return false;
      }
      return true;
    });
  }, [reviews, filterService, filterRating, filterFrom, filterTo]);

  const hasActiveFilters =
    filterService !== "all" || filterRating > 0 || filterFrom !== "" || filterTo !== "";

  // ── Summary stats for filtered set ───────────────────────────────────────
  const avgRating =
    filtered.length > 0
      ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
      : 0;

  function clearFilters() {
    setFilterService("all");
    setFilterRating(0);
    setFilterFrom("");
    setFilterTo("");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {flaggingId && (
        <FlagModal
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
              onClick={() => navigate(-1)}
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

          {/* ── Filters ── */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MaterialIcon name="filter_list" className="text-base text-gray-500" />
              <span className="text-sm font-semibold text-[#111418] dark:text-white">{t("reviews.filters.title")}</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  {t("reviews.filters.clearAll")}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Service filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("reviews.filters.service")}
                </label>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{t("reviews.filters.allServices")}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("reviews.filters.rating")}
                </label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFilterRating(r)}
                      className={[
                        "flex-1 rounded-lg border text-xs font-semibold py-2 transition-all",
                        filterRating === r
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary",
                      ].join(" ")}
                    >
                      {r === 0 ? t("reviews.filters.all") : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date from */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("reviews.filters.from")}
                </label>
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Date to */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("reviews.filters.to")}
                </label>
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </Card>

          {/* ── Reviews list ── */}
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
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  {t("reviews.clearFilters")}
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((review) => (
                <ReviewCard key={review.id} review={review} onFlag={setFlaggingId} />
              ))}

              {/* Load more — only if no filters active (since we filter client-side over loaded pages) */}
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
