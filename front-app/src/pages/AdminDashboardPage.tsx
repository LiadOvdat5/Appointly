import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { getAdminStats, type AdminStats } from "../services/adminService";

type NavCard = {
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  to: string;
  count?: number;
  countLoading: boolean;
  alert?: boolean; // orange highlight when true
};

function DashboardNavCard({
  label,
  description,
  icon,
  iconColor,
  iconBg,
  to,
  count,
  countLoading,
  alert,
}: NavCard) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={[
        "flex items-center gap-4 p-5 rounded-2xl border shadow-sm hover:shadow-md transition text-left w-full",
        alert
          ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
          : "bg-white dark:bg-surface-dark border-[#e7edf3] dark:border-gray-800",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
          alert ? "bg-orange-100 dark:bg-orange-900/40" : iconBg,
        ].join(" ")}
      >
        <MaterialIcon
          name={icon}
          className={[
            "text-2xl",
            alert ? "text-orange-600 dark:text-orange-400" : iconColor,
          ].join(" ")}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "font-bold text-sm",
            alert
              ? "text-orange-700 dark:text-orange-300"
              : "text-[#111418] dark:text-white",
          ].join(" ")}
        >
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
        {/* Live count badge */}
        <div className="mt-1.5">
          {countLoading ? (
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : count !== undefined ? (
            <span
              className={[
                "inline-block text-xs font-semibold px-2 py-0.5 rounded-full",
                alert && count > 0
                  ? "bg-orange-200 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
              ].join(" ")}
            >
              {count.toLocaleString()} total
            </span>
          ) : null}
        </div>
      </div>

      {/* Chevron */}
      <MaterialIcon
        name="chevron_right"
        className={[
          "shrink-0",
          alert ? "text-orange-400" : "text-gray-400",
        ].join(" ")}
      />
    </button>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError("Failed to load platform stats."))
      .finally(() => setLoading(false));
  }, []);

  const hasPendingFlags = (stats?.pendingFlaggedReviews ?? 0) > 0;

  const cards: Omit<NavCard, "countLoading">[] = [
    {
      label: "Users",
      description: "All registered users across all roles",
      icon: "group",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      to: "/admin/users",
      count: stats?.totalUsers,
    },
    {
      label: "Businesses",
      description: "All businesses registered on the platform",
      icon: "storefront",
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      to: "/admin/businesses",
      count: stats?.totalBusinesses,
    },
    {
      label: "Appointments",
      description: "All bookings made through BizSlot",
      icon: "calendar_month",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      to: "/admin/appointments",
      count: stats?.totalAppointments,
    },
    {
      label: "Reviews",
      description: "Customer reviews submitted for businesses",
      icon: "star",
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      to: "/admin/flagged-reviews",
      count: stats?.totalReviews,
    },
    {
      label: "Flagged Reviews",
      description: hasPendingFlags
        ? `${stats!.pendingFlaggedReviews} review${stats!.pendingFlaggedReviews !== 1 ? "s" : ""} awaiting moderation`
        : "No pending flags — all clear",
      icon: "flag",
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      to: "/admin/flagged-reviews",
      count: stats?.pendingFlaggedReviews,
      alert: hasPendingFlags,
    },
    {
      label: "Category Requests",
      description: "Business owner requests for new categories",
      icon: "category",
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      to: "/admin/categories",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header bar */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Platform-wide overview and moderation tools
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {cards.map((card) => (
          <DashboardNavCard key={card.label} {...card} countLoading={loading} />
        ))}
      </div>
    </div>
  );
}
