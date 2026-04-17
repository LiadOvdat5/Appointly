import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import {
  getAdminReviewAnalytics,
  type AdminReviewAnalytics,
} from "../services/adminService";
import { AdminReviewStatCard } from "../components/admin/reviews/AdminReviewStatCard";
import { RatingDistributionChart } from "../components/admin/reviews/RatingDistributionChart";
import { MonthlyBarChart } from "../components/admin/reviews/MonthlyBarChart";
import { ReviewRankedList } from "../components/admin/reviews/ReviewRankedList";

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminReviewAnalytics()
      .then(setData)
      .catch(() => setError("Failed to load review analytics."))
      .finally(() => setLoading(false));
  }, []);

  const pendingFlags = data?.flagStats.pendingFlags ?? 0;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Back"
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <div>
          <h1 className="font-bold text-[#111418] dark:text-white text-xl leading-tight">
            Review Analytics
          </h1>
          <p className="text-xs text-gray-500">Platform-wide review overview</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <MaterialIcon name="error" className="text-base shrink-0" />
          {error}
        </div>
      )}

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <AdminReviewStatCard
          label="Total Reviews"
          value={data?.totalReviews ?? 0}
          icon="rate_review"
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          loading={loading}
        />
        <AdminReviewStatCard
          label="Platform Average"
          value={data ? `${data.platformAverageRating.toFixed(1)} ★` : "—"}
          icon="star"
          iconColor="text-yellow-500"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          loading={loading}
        />
        <AdminReviewStatCard
          label="Pending Flags"
          value={pendingFlags}
          icon="flag"
          iconColor={pendingFlags > 0 ? "text-orange-600" : "text-gray-500"}
          iconBg={
            pendingFlags > 0
              ? "bg-orange-100 dark:bg-orange-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }
          loading={loading}
          linkTo={pendingFlags > 0 ? "/admin/flagged-reviews" : undefined}
          alert={pendingFlags > 0}
        />
        <AdminReviewStatCard
          label="Total Flagged"
          value={data?.flagStats.totalFlagged ?? 0}
          icon="outlined_flag"
          iconColor="text-gray-500"
          iconBg="bg-gray-100 dark:bg-gray-800"
          loading={loading}
        />
      </div>

      {/* Flag stats row */}
      <Card className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Flag Activity
        </p>
        {loading ? (
          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold">
              <MaterialIcon name="flag" className="text-sm" />
              {(data?.flagStats.pendingFlags ?? 0).toLocaleString()} pending
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
              <MaterialIcon name="delete" className="text-sm" />
              {(data?.flagStats.resolvedRemoved ?? 0).toLocaleString()} removed
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
              <MaterialIcon name="check_circle" className="text-sm" />
              {(data?.flagStats.resolvedDismissed ?? 0).toLocaleString()} dismissed
            </div>
          </div>
        )}
        {!loading && pendingFlags > 0 && (
          <Link
            to="/admin/flagged-reviews"
            className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium group"
          >
            <MaterialIcon name="open_in_new" className="text-xs" />
            <span className="group-hover:underline">Review {pendingFlags} pending flag{pendingFlags !== 1 ? "s" : ""}</span>
          </Link>
        )}
      </Card>

      {/* Rating distribution */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          Rating Distribution
        </p>
        <RatingDistributionChart
          distribution={data?.ratingDistribution ?? {}}
          total={data?.totalReviews ?? 0}
          loading={loading}
        />
      </Card>

      {/* Reviews by month */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          Reviews by Month
        </p>
        <p className="text-xs text-gray-400">Last 12 months — hover bars for count</p>
        <MonthlyBarChart data={data?.reviewsByMonth ?? []} loading={loading} />
      </Card>

      {/* Top businesses by review count */}
      <ReviewRankedList
        title="Top Businesses by Review Count"
        items={data?.topBusinessesByReviewCount ?? []}
        loading={loading}
        skeletonCount={10}
        renderRight={(item) => (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
              {item.reviewCount.toLocaleString()} reviews
            </span>
            <span className="text-[10px] text-gray-400">avg {item.averageRating.toFixed(1)} ★</span>
          </div>
        )}
      />

      {/* Top rated businesses */}
      <ReviewRankedList
        title="Top Rated Businesses"
        items={data?.topRatedBusinesses ?? []}
        loading={loading}
        renderRight={(item) => (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              {item.averageRating.toFixed(1)} ★
            </span>
            <span className="text-[10px] text-gray-400">{item.reviewCount} reviews</span>
          </div>
        )}
      />

      {/* Lowest rated businesses */}
      <ReviewRankedList
        title="Lowest Rated Businesses"
        items={data?.lowestRatedBusinesses ?? []}
        loading={loading}
        rowVariant="warning"
        renderRight={(item) => (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              {item.averageRating.toFixed(1)} ★
            </span>
            <span className="text-[10px] text-gray-400">{item.reviewCount} reviews</span>
          </div>
        )}
      />
    </div>
  );
}
