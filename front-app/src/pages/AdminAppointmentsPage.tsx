import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import {
  getAdminAppointmentAnalytics,
  type AdminAppointmentAnalytics,
} from "../services/adminService";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  loading,
}: {
  label: string;
  value: number | string;
  icon: string;
  iconColor: string;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <MaterialIcon name={icon} className={`text-xl ${iconColor}`} />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p className="font-bold text-lg text-[#111418] dark:text-white leading-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Card>
  );
}

// ── Rate badge ────────────────────────────────────────────────────────────────

function RateBadge({
  label,
  rate,
  color,
  loading,
}: {
  label: string;
  rate: number;
  color: "green" | "red";
  loading: boolean;
}) {
  const colorMap = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-[#e7edf3] dark:border-gray-800 bg-white dark:bg-surface-dark">
      <p className="text-sm text-[#111418] dark:text-white font-medium">{label}</p>
      {loading ? (
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      ) : (
        <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${colorMap[color]}`}>
          {rate.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// ── Bar chart (CSS-only) ──────────────────────────────────────────────────────

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
            style={{ height: `${Math.random() * 70 + 20}%` }}
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
                className="absolute bottom-0 left-0 right-0 bg-purple-500 dark:bg-purple-400 rounded-t transition-all"
                style={{ height: `${heightPct}%` }}
              >
                {/* Tooltip */}
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
      {/* X-axis labels — every other month to avoid crowding */}
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

// ── Ranked list ───────────────────────────────────────────────────────────────

function RankedList({
  title,
  items,
  loading,
  renderRight,
}: {
  title: string;
  items: { businessId: string; name: string; slug: string }[];
  loading: boolean;
  renderRight: (item: { businessId: string; name: string; slug: string; [key: string]: unknown }) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#111418] dark:text-white">{title}</p>
      {loading ? (
        <div className="space-y-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 px-1">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={item.businessId}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800"
            >
              <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.slug}</p>
              </div>
              <div className="shrink-0">{renderRight(item as never)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminAppointmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminAppointmentAnalytics()
      .then(setData)
      .catch(() => setError("Failed to load appointment analytics."))
      .finally(() => setLoading(false));
  }, []);

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
            Appointment Analytics
          </h1>
          <p className="text-xs text-gray-500">Platform-wide booking overview</p>
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
          label="Total"
          value={data?.totalAppointments ?? 0}
          icon="calendar_month"
          iconColor="text-purple-600"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          loading={loading}
        />
        <StatCard
          label="Booked"
          value={data?.byStatus.booked ?? 0}
          icon="event_available"
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={data?.byStatus.completed ?? 0}
          icon="check_circle"
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-900/30"
          loading={loading}
        />
        <StatCard
          label="Cancelled"
          value={data?.byStatus.cancelled ?? 0}
          icon="cancel"
          iconColor="text-red-600"
          iconBg="bg-red-100 dark:bg-red-900/30"
          loading={loading}
        />
      </div>

      {/* Rates */}
      <div className="space-y-2">
        <RateBadge
          label="Completion Rate"
          rate={data?.completionRate ?? 0}
          color="green"
          loading={loading}
        />
        <RateBadge
          label="Cancellation Rate"
          rate={data?.cancellationRate ?? 0}
          color="red"
          loading={loading}
        />
      </div>

      {/* Monthly chart */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          Appointments by Month
        </p>
        <p className="text-xs text-gray-400">Last 12 months — hover bars for count</p>
        <MonthlyBarChart data={data?.appointmentsByMonth ?? []} loading={loading} />
      </Card>

      {/* Top businesses by volume */}
      <RankedList
        title="Top Businesses by Volume"
        items={data?.topBusinessesByVolume ?? []}
        loading={loading}
        renderRight={(item) => (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {(item as unknown as { count: number }).count.toLocaleString()} appts
          </span>
        )}
      />

      {/* Top businesses by completion rate */}
      <RankedList
        title="Top Businesses by Completion Rate"
        items={data?.topBusinessesByCompletion ?? []}
        loading={loading}
        renderRight={(item) => (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {(item as unknown as { rate: number }).rate.toFixed(1)}%
          </span>
        )}
      />
    </div>
  );
}
