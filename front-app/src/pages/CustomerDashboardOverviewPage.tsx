import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { formatTime } from "../utils/formatTime";
import type { RootState } from "../redux/store";
import {
  getClientAppointments,
  getCustomerReport,
  AppointmentStatus,
  type AppointmentDTO,
  type CustomerReportDTO,
} from "../services/appointmentService";
import {
  getFollowedBusinesses,
  unfollowBusiness,
} from "../services/followService";
import {
  getMyInvitations,
  InvitationStatus,
} from "../services/invitationService";
import type { BusinessProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Metric definitions ───────────────────────────────────────────────────────

type MetricKey =
  | "totalBookings"
  | "completedBookings"
  | "canceledBookings"
  | "totalSpent"
  | "favBusiness"
  | "favService";

interface MetricDef {
  key: MetricKey;
  labelKey: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  getValue: (r: CustomerReportDTO) => string;
  getSubtext: (
    r: CustomerReportDTO,
    t: (key: string, opts?: Record<string, unknown>) => string,
  ) => string;
}

const METRIC_DEFS: MetricDef[] = [
  {
    key: "totalBookings",
    labelKey: "customerDashboard.metrics.totalBookings",
    icon: "event_available",
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    getValue: (r) => String(r.totalBookings),
    getSubtext: (r, t) =>
      r.totalBookings === 1
        ? t("customerDashboard.metrics.appointment")
        : t("customerDashboard.metrics.appointments"),
  },
  {
    key: "completedBookings",
    labelKey: "customerDashboard.metrics.completed",
    icon: "check_circle",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    getValue: (r) => String(r.completedBookings),
    getSubtext: (r, t) =>
      r.totalBookings > 0
        ? `${Math.round((r.completedBookings / (r.totalBookings + r.canceledBookings)) * 100)}% completion rate`
        : t("customerDashboard.metrics.noAppointments"),
  },
  {
    key: "canceledBookings",
    labelKey: "customerDashboard.metrics.cancellations",
    icon: "event_busy",
    iconColor: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    getValue: (r) => String(r.canceledBookings),
    getSubtext: (r, t) => {
      const total = r.totalBookings + r.canceledBookings;
      if (total === 0) return t("customerDashboard.metrics.noAppointments");
      return `${Math.round((r.canceledBookings / total) * 100)}% cancellation rate`;
    },
  },
  {
    key: "totalSpent",
    labelKey: "customerDashboard.metrics.totalSpent",
    icon: "payments",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    getValue: (r) => `$${r.totalSpent.toFixed(2)}`,
    getSubtext: (r, t) =>
      r.totalBookings > 0
        ? `$${(r.totalSpent / r.totalBookings).toFixed(2)} avg per visit`
        : t("customerDashboard.metrics.noDataYet"),
  },
  {
    key: "favBusiness",
    labelKey: "customerDashboard.metrics.favBusiness",
    icon: "star",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    getValue: (r) => r.favoriteBusinessName ?? "—",
    getSubtext: (r, t) =>
      r.favoriteBusinessCount > 0
        ? `${r.favoriteBusinessCount} visit${r.favoriteBusinessCount !== 1 ? "s" : ""}`
        : t("customerDashboard.metrics.noDataYet"),
  },
  {
    key: "favService",
    labelKey: "customerDashboard.metrics.favService",
    icon: "content_cut",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    getValue: (r) => r.favoriteServiceName ?? "—",
    getSubtext: (r, t) =>
      r.favoriteServiceCount > 0
        ? `Booked ${r.favoriteServiceCount} time${r.favoriteServiceCount !== 1 ? "s" : ""}`
        : t("customerDashboard.metrics.noDataYet"),
  },
];

const DEFAULT_METRICS: MetricKey[] = [
  "totalBookings",
  "totalSpent",
  "favBusiness",
];

// ─── AnalyticCard ─────────────────────────────────────────────────────────────

function AnalyticCard({
  def,
  report,
}: {
  def: MetricDef;
  report: CustomerReportDTO;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-5">
      <div
        className={[
          "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center",
          def.iconBg,
        ].join(" ")}
      >
        <MaterialIcon
          name={def.icon}
          className={["text-2xl", def.iconColor].join(" ")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {t(def.labelKey)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {def.getSubtext(report, t)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-3xl font-black text-[#0e141b] dark:text-white leading-tight truncate max-w-45">
          {def.getValue(report)}
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboardOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((s: RootState) => s.auth.user);

  // Upcoming preview
  const [upcoming, setUpcoming] = useState<AppointmentDTO[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Analytics
  const [report, setReport] = useState<CustomerReportDTO | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const now = new Date();
  const [startDate, setStartDate] = useState(toInputDate(startOfMonth(now)));
  const [endDate, setEndDate] = useState(toInputDate(endOfMonth(now)));
  const [activeMetrics, setActiveMetrics] =
    useState<MetricKey[]>(DEFAULT_METRICS);

  // Pending invitations count (for quick action card)
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);

  // Followed businesses
  const [followedBusinesses, setFollowedBusinesses] = useState<
    BusinessProfile[]
  >([]);
  const [followedLoading, setFollowedLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  // Load upcoming appointments (max 3)
  useEffect(() => {
    setUpcomingLoading(true);
    getClientAppointments(1, 50)
      .then((all) => {
        const sorted = all
          .filter(
            (a) =>
              a.status !== AppointmentStatus.Canceled &&
              new Date(a.startDateTime) >= new Date(),
          )
          .sort(
            (a, b) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )
          .slice(0, 3);
        setUpcoming(sorted);
      })
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setUpcomingLoading(false));
  }, []);

  // Load analytics report
  useEffect(() => {
    setReportLoading(true);
    getCustomerReport(new Date(startDate), new Date(endDate + "T23:59:59"))
      .then(setReport)
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setReportLoading(false));
  }, [startDate, endDate]);

  // Load pending invitations count
  useEffect(() => {
    getMyInvitations()
      .then((inv) => {
        const pending = inv.filter(
          (i) => i.status === InvitationStatus.Pending,
        ).length;
        setPendingInvitationCount(pending);
      })
      .catch(() => {
        /* silently ignore */
      });
  }, []);

  // Load followed businesses
  useEffect(() => {
    setFollowedLoading(true);
    getFollowedBusinesses()
      .then(setFollowedBusinesses)
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setFollowedLoading(false));
  }, []);

  async function handleUnfollow(businessId: string) {
    setUnfollowingId(businessId);
    try {
      await unfollowBusiness(businessId);
      setFollowedBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    } catch {
      // silently ignore
    } finally {
      setUnfollowingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {t("customerDashboard.title")}
            </h1>
            <p className="text-xs text-gray-500">
              {authUser?.name ?? t("nav.profile")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* ── Analytics Section ── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
              {t("customerDashboard.myActivity")}
            </h2>
            {/* Date range picker */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MaterialIcon name="date_range" className="text-base" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-surface-dark text-[#111418] dark:text-white text-xs"
              />
              <span>–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-surface-dark text-[#111418] dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Metric toggles */}
          <div className="flex flex-wrap gap-2 mb-4">
            {METRIC_DEFS.map((def) => {
              const active = activeMetrics.includes(def.key);
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => toggleMetric(def.key)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  <MaterialIcon
                    name={def.icon}
                    className="text-sm leading-none"
                  />
                  {t(def.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Analytics cards */}
          {reportLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : activeMetrics.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <MaterialIcon
                name="insights"
                className="text-4xl text-gray-300 dark:text-gray-700"
              />
              <p className="text-sm text-gray-400">
                {t("customerDashboard.selectMetrics")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {METRIC_DEFS.filter((d) => activeMetrics.includes(d.key)).map(
                (def) =>
                  report ? (
                    <AnalyticCard key={def.key} def={def} report={report} />
                  ) : (
                    <div
                      key={def.key}
                      className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-400">
                        {t("customerDashboard.noDataPeriod")}
                      </span>
                    </div>
                  ),
              )}
            </div>
          )}
        </section>

        {/* ── Upcoming Appointments Preview ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
              {t("customerDashboard.upcomingAppointments")}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/dashboard/customer")}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              {t("customerDashboard.viewAll")}
              <MaterialIcon name="chevron_right" className="text-sm" />
            </button>
          </div>

          {upcomingLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="p-6 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MaterialIcon
                  name="calendar_today"
                  className="text-2xl text-gray-400"
                />
              </div>
              <div>
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  {t("customerDashboard.noUpcoming.title")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("customerDashboard.noUpcoming.text")}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/search")}
              >
                {t("customerDashboard.findBusiness")}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <Card key={appt.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                        {appt.businessName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {appt.serviceName}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MaterialIcon
                            name="calendar_today"
                            className="text-sm leading-none"
                          />
                          {formatDate(appt.startDateTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MaterialIcon
                            name="schedule"
                            className="text-sm leading-none"
                          />
                          {formatTime(appt.startDateTime)} –{" "}
                          {formatTime(appt.endDateTime)}
                        </span>
                        {appt.servicePrice != null && (
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <MaterialIcon
                              name="payments"
                              className="text-sm leading-none"
                            />
                            ${appt.servicePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="confirmed">
                      {t("customerDashboard.confirmed")}
                    </Badge>
                  </div>
                </Card>
              ))}

              <button
                type="button"
                onClick={() => navigate("/dashboard/customer")}
                className="w-full text-center text-sm text-primary font-semibold py-2 hover:underline"
              >
                {t("customerDashboard.manageAll")}
              </button>
            </div>
          )}
        </section>

        {/* ── Quick Links ── */}
        <section>
          <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
            {t("customerDashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/customer")}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MaterialIcon
                  name="event_note"
                  className="text-2xl text-blue-600"
                />
              </div>
              <div>
                <p className="font-bold text-[#111418] dark:text-white text-sm">
                  {t("customerDashboard.myAppointments")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("customerDashboard.myAppointmentsDesc")}
                </p>
              </div>
              <MaterialIcon
                name="chevron_right"
                className="text-gray-400 ml-auto shrink-0"
              />
            </button>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <MaterialIcon
                  name="search"
                  className="text-2xl text-green-600"
                />
              </div>
              <div>
                <p className="font-bold text-[#111418] dark:text-white text-sm">
                  {t("customerDashboard.discoverBusinesses")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("customerDashboard.discoverBusinessesDesc")}
                </p>
              </div>
              <MaterialIcon
                name="chevron_right"
                className="text-gray-400 ml-auto shrink-0"
              />
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
            >
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <MaterialIcon
                  name="person"
                  className="text-2xl text-orange-600"
                />
              </div>
              <div>
                <p className="font-bold text-[#111418] dark:text-white text-sm">
                  {t("customerDashboard.myProfile")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("customerDashboard.myProfileDesc")}
                </p>
              </div>
              <MaterialIcon
                name="chevron_right"
                className="text-gray-400 ml-auto shrink-0"
              />
            </button>

            {pendingInvitationCount > 0 && (
              <button
                type="button"
                onClick={() => navigate("/invitations")}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition text-left relative"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 relative">
                  <MaterialIcon
                    name="mail"
                    className="text-2xl text-indigo-600"
                  />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingInvitationCount}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("customerDashboard.businessInvitations")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("customerDashboard.pendingInvites_other", {
                      count: pendingInvitationCount,
                    })}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>
            )}
          </div>
        </section>

        {/* ── Followed Businesses ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
              {t("customerDashboard.followedBusinesses")}
            </h2>
            {followedBusinesses.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/search")}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                {t("customerDashboard.discoverMore")}
                <MaterialIcon name="chevron_right" className="text-sm" />
              </button>
            )}
          </div>

          {followedLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : followedBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-8 flex flex-col items-center gap-3 text-center">
              <MaterialIcon
                name="favorite_border"
                className="text-4xl text-gray-300 dark:text-gray-600"
              />
              <div>
                <p className="font-semibold text-sm text-[#111418] dark:text-white">
                  {t("customerDashboard.noFollowed.title")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("customerDashboard.noFollowed.text")}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/search")}
              >
                {t("customerDashboard.exploreBusinesses")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {followedBusinesses.map((biz) => (
                <Card key={biz.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {biz.logoUrl ? (
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MaterialIcon
                          name="storefront"
                          className="text-xl text-primary"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/business/${biz.slug ?? biz.id}`)}
                        className="font-semibold text-sm text-[#111418] dark:text-white hover:text-primary transition-colors truncate block text-left"
                      >
                        {biz.name}
                      </button>
                      {biz.categories && biz.categories.length > 0 && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {biz.categories.map((c) => c.name).join(" · ")}
                        </p>
                      )}
                      {biz.address && (
                        <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <MaterialIcon
                            name="location_on"
                            className="text-xs leading-none"
                          />
                          {biz.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/business/${biz.slug ?? biz.id}`)}
                      >
                        Book
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleUnfollow(biz.id)}
                        disabled={unfollowingId === biz.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        aria-label="Unfollow"
                      >
                        {unfollowingId === biz.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 block" />
                        ) : (
                          <MaterialIcon
                            name="favorite"
                            className="text-base leading-none text-primary icon-filled"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
