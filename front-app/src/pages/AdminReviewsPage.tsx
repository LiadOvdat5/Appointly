import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import {
  getAdminReviewAnalytics,
  type AdminReviewAnalytics,
  type ReviewBusinessEntry,
} from "../services/adminService";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  loading,
  linkTo,
  alert,
}: {
  label: string;
  value: number | string;
  icon: string;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  linkTo?: string;
  alert?: boolean;
}) {
  const content = (
    <Card
      className={[
        "flex items-center gap-3 px-4 py-3",
        alert
          ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30"
          : "",
      ].join(" ")}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <MaterialIcon name={icon} className={`text-xl ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p
            className={[
              "font-bold text-lg leading-tight",
              alert
                ? "text-orange-700 dark:text-orange-300"
                : "text-[#111418] dark:text-white",
            ].join(" ")}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {linkTo && !loading && (
        <MaterialIcon
          name="open_in_new"
          className="text-base text-gray-400 shrink-0"
        />
      )}
    </Card>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

// ── Rating distribution bar chart ─────────────────────────────────────────────

function RatingDistribution({
  distribution,
  total,
  loading,
}: {
  distribution: Record<string, number>;
  total: number;
  loading: boolean;
}) {
  const stars = [5, 4, 3, 2, 1];
  const starColors = [
    "bg-green-500",
    "bg-lime-500",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-red-500",
  ];
  const max = Math.max(...stars.map((s) => distribution[String(s)] ?? 0), 1);

  if (loading) {
    return (
      <div className="space-y-2">
        {stars.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-right">{s}</span>
            <MaterialIcon name="star" className="text-xs text-gray-300" />
            <div className="flex-1 h-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stars.map((s, idx) => {
        const count = distribution[String(s)] ?? 0;
        const widthPct = max > 0 ? (count / max) * 100 : 0;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
        return (
          <div key={s} className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-3 text-right">{s}</span>
            <MaterialIcon name="star" className="text-xs text-yellow-400" />
            <div className="flex-1 relative h-5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${starColors[idx]}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-14 text-right shrink-0">
              {count.toLocaleString()} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Monthly bar chart (CSS-only) ──────────────────────────────────────────────

function MonthlyBarChart({
  data,
  loading,
}: {
  data: { month: string; count: number }[];
  loading: boolean;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  function formatMonth(ym: string) {
    const [year, month] = ym.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-end gap-1 h-28">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t bg-gray-200 dark:bg-gray-700"
            style={{ height: `${30 + (i % 5) * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-28">
        {data.map((d) => {
          const heightPct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={d.month} className="flex-1 relative h-full group">
              <div
                className="absolute bottom-0 left-0 right-0 bg-yellow-400 dark:bg-yellow-500 rounded-t transition-all"
                style={{ height: `${heightPct}%` }}
              >
                {d.count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                    {d.count}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {data.map((d, i) => (
          <div key={d.month} className="flex-1 text-center">
            {i % 2 === 0 ? (
              <span className="text-[9px] text-gray-400 leading-tight">{formatMonth(d.month)}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ranked business list ──────────────────────────────────────────────────────

function RankedList({
  title,
  items,
  loading,
  skeletonCount,
  renderRight,
  rowVariant,
}: {
  title: string;
  items: ReviewBusinessEntry[];
  loading: boolean;
  skeletonCount?: number;
  renderRight: (item: ReviewBusinessEntry) => React.ReactNode;
  rowVariant?: "default" | "warning";
}) {
  const rowBase =
    "flex items-center gap-3 px-3 py-2 rounded-xl border";
  const rowStyle =
    rowVariant === "warning"
      ? `${rowBase} bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800`
      : `${rowBase} bg-white dark:bg-surface-dark border-[#e7edf3] dark:border-gray-800`;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#111418] dark:text-white">{title}</p>
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: skeletonCount ?? 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 px-1">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={item.businessId} className={rowStyle}>
              <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.slug}</p>
              </div>
              <div className="shrink-0">{renderRight(item)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <StatCard
          label="Total Reviews"
          value={data?.totalReviews ?? 0}
          icon="rate_review"
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          loading={loading}
        />
        <StatCard
          label="Platform Average"
          value={data ? `${data.platformAverageRating.toFixed(1)} ★` : "—"}
          icon="star"
          iconColor="text-yellow-500"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          loading={loading}
        />
        <StatCard
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
        <StatCard
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
            className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
          >
            <MaterialIcon name="open_in_new" className="text-xs" />
            Review {pendingFlags} pending flag{pendingFlags !== 1 ? "s" : ""}
          </Link>
        )}
      </Card>

      {/* Rating distribution */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          Rating Distribution
        </p>
        <RatingDistribution
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
      <RankedList
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
      <RankedList
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
      <RankedList
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
