import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { formatTime } from "../utils/formatTime";
import type { RootState } from "../redux/store";
import {
  getBusinessAppointments,
  cancelAppointment,
  AppointmentStatus,
  getBusinessReport,
  type AppointmentDTO,
  type BusinessReportDTO,
} from "../services/appointmentService";
import {
  getMyBusinesses,
  getBusinessById,
  getPublicBusinessBySlug,
} from "../services/businessManagementService";
import type { BusinessProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewViewModal } from "../components/UI/ReviewViewModal";
import { ShareModal } from "../components/UI/ShareModal";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";

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
  | "bookings"
  | "revenue"
  | "topService"
  | "cancellations"
  | "avgValue"
  | "uniqueCustomers"
  | "busiestDay";

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

interface MetricDef {
  key: MetricKey;
  labelKey: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  getValue: (r: BusinessReportDTO) => string;
  getSubtext: (r: BusinessReportDTO, t: TFunc) => string;
}

const METRIC_DEFS: MetricDef[] = [
  {
    key: "bookings",
    labelKey: "dashboard.metrics.totalBookings",
    icon: "event_available",
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    getValue: (r) => String(r.totalAppointments),
    getSubtext: (r, t) =>
      r.totalAppointments === 1
        ? t("dashboard.metrics.appointment")
        : t("dashboard.metrics.appointments"),
  },
  {
    key: "revenue",
    labelKey: "dashboard.metrics.revenue",
    icon: "payments",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    getValue: (r) => `$${r.revenue.toFixed(2)}`,
    getSubtext: (_r, t) => t("dashboard.metrics.revenueSubtext"),
  },
  {
    key: "topService",
    labelKey: "dashboard.metrics.topService",
    icon: "star",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    getValue: (r) => r.topServiceName ?? "—",
    getSubtext: (r, t) =>
      r.topServiceCount > 0
        ? `${r.topServiceCount} ${t("dashboard.metrics.bookings")}`
        : t("dashboard.metrics.noDataYet"),
  },
  {
    key: "cancellations",
    labelKey: "dashboard.metrics.cancellations",
    icon: "event_busy",
    iconColor: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    getValue: (r) => String(r.cancellations),
    getSubtext: (r, t) => {
      const total = r.totalAppointments + r.cancellations;
      if (total === 0) return t("dashboard.metrics.noAppointments");
      const rate = Math.round((r.cancellations / total) * 100);
      return t("dashboard.metrics.cancellationRate", { rate });
    },
  },
  {
    key: "avgValue",
    labelKey: "dashboard.metrics.avgValue",
    icon: "trending_up",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    getValue: (r) =>
      r.totalAppointments > 0
        ? `$${(r.revenue / r.totalAppointments).toFixed(2)}`
        : "—",
    getSubtext: (_r, t) => t("dashboard.metrics.revenuePerAppt"),
  },
  {
    key: "uniqueCustomers",
    labelKey: "dashboard.metrics.uniqueCustomers",
    icon: "group",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    getValue: (r) => String(r.uniqueCustomers),
    getSubtext: (r, t) =>
      r.uniqueCustomers === 1
        ? t("dashboard.metrics.individualClient")
        : t("dashboard.metrics.individualClients"),
  },
  {
    key: "busiestDay",
    labelKey: "dashboard.metrics.busiestDay",
    icon: "bar_chart",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    getValue: (r) => r.busiestDayOfWeek ?? "—",
    getSubtext: (_r, t) => t("dashboard.metrics.mostBookingsDay"),
  },
];

const DEFAULT_METRICS: MetricKey[] = ["bookings", "revenue", "topService"];

// ─── AnalyticCard ─────────────────────────────────────────────────────────────

function AnalyticCard({
  def,
  report,
  t,
}: {
  def: MetricDef;
  report: BusinessReportDTO;
  t: TFunc;
}) {
  const value = def.getValue(report);
  const subtext = def.getSubtext(report, t);

  return (
    <div className="bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-5">
      {/* Icon */}
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

      {/* Label + subtext */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {t(def.labelKey)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {subtext}
        </p>
      </div>

      {/* Value */}
      <div className="shrink-0 text-right">
        <p className="text-3xl font-black text-[#0e141b] dark:text-white leading-tight truncate max-w-45">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug: paramBusinessSlug } = useParams<{ businessSlug?: string }>();
  const authUser = useSelector((s: RootState) => s.auth.user);

  // Business
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(null);

  // All appointments — split into upcoming/completed in render
  const [allAppointments, setAllAppointments] = useState<AppointmentDTO[]>([]);
  const [apptLoading, setApptLoading] = useState(false);

  // Cancel flow (for completed appointments owner can revert to canceled)
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reviews
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewDTO>>({});
  const [viewingReview, setViewingReview] = useState<ReviewDTO | null>(null);

  // Share modal
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Report / stats
  const [report, setReport] = useState<BusinessReportDTO | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const now = new Date();
  const [startDate, setStartDate] = useState(toInputDate(startOfMonth(now)));
  const [endDate, setEndDate] = useState(toInputDate(endOfMonth(now)));
  const [activeMetrics, setActiveMetrics] =
    useState<MetricKey[]>(DEFAULT_METRICS);

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  // ── Load business ────────────────────────────────────────────────────────
  useEffect(() => {
    setBusinessLoading(true);
    let load: Promise<BusinessProfile>;
    if (paramBusinessSlug) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramBusinessSlug);
      load = isUUID
        ? getBusinessById(paramBusinessSlug).then((biz) => {
            if (biz.slug) navigate(`/dashboard/${biz.slug}`, { replace: true });
            return biz;
          })
        : getPublicBusinessBySlug(paramBusinessSlug);
    } else {
      load = getMyBusinesses().then((list) => {
        if (list.length === 0) throw new Error("no-business");
        return list[0];
      });
    }

    load
      .then((biz) => {
        if (biz.isSuspended) {
          setBusinessError("suspended");
        } else {
          setBusiness(biz);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 503 || err?.response?.status === 410 || err?.message === "suspended") {
          setBusinessError("suspended");
        } else if (err?.message === "no-business") {
          setBusinessError(t("dashboard.error.noBusinessFound"));
        } else {
          setBusinessError(t("dashboard.error.loadFailed"));
        }
      })
      .finally(() => setBusinessLoading(false));
  }, [paramBusinessSlug, t, navigate]);

  // ── Load appointments ────────────────────────────────────────────────────
  useEffect(() => {
    if (!business) return;
    setApptLoading(true);
    getBusinessAppointments(business.id, 1, 100)
      .then(setAllAppointments)
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setApptLoading(false));
  }, [business]);

  const now2 = new Date();
  const appointments = allAppointments
    .filter(
      (a) =>
        a.status !== AppointmentStatus.Canceled &&
        a.status !== AppointmentStatus.Completed &&
        new Date(a.startDateTime) >= now2,
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )
    .slice(0, 10);

  const completedAppointments = allAppointments
    .filter(
      (a) =>
        a.status === AppointmentStatus.Completed ||
        (a.status === AppointmentStatus.Canceled &&
          a.notes?.includes("Service did not take place")),
    )
    .sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime(),
    )
    .slice(0, 20);

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    const id = confirmCancelId;
    setConfirmCancelId(null);
    setCancelingId(id);
    setCancelError(null);
    try {
      const updated = await cancelAppointment(id, "Service did not take place");
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      );
    } catch {
      setCancelError(t("dashboard.error.voidFailed"));
    } finally {
      setCancelingId(null);
    }
  }

  // ── Load reviews ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!business) return;
    getBusinessReviews(business.id, 1, 200)
      .then((reviews) => {
        const map: Record<string, ReviewDTO> = {};
        for (const r of reviews) map[r.appointmentId] = r;
        setReviewMap(map);
      })
      .catch(() => {
        /* silently ignore */
      });
  }, [business]);

  // ── Load report ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!business) return;
    setReportLoading(true);
    getBusinessReport(
      business.id,
      new Date(startDate),
      new Date(endDate + "T23:59:59"),
    )
      .then(setReport)
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setReportLoading(false));
  }, [business, startDate, endDate]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (businessError === "suspended") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-background-dark p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <MaterialIcon name="block" className="text-4xl text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-[#111418] dark:text-white">
          Business Suspended
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
          This business has been suspended by an admin and is temporarily unavailable.
          Please contact support for more information.
        </p>
        <Button variant="outline" className="w-auto px-6" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-background-dark p-6">
        <MaterialIcon name="store_off" className="text-5xl text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 text-center">
          {businessError ?? t("dashboard.error.noBusinessFound")}
        </p>
        <Button variant="primary" onClick={() => navigate("/onboarding")}>
          {t("dashboard.setupBusiness")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmCancelId !== null}
        title={t("dashboard.cancelAppt.title")}
        message={t("dashboard.cancelAppt.message")}
        confirmLabel={t("dashboard.cancelAppt.confirm")}
        cancelLabel={t("dashboard.cancelAppt.cancel")}
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelId(null)}
      />
      {viewingReview && (
        <ReviewViewModal
          open
          review={viewingReview}
          onClose={() => setViewingReview(null)}
        />
      )}

      {cancelError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 shadow-lg">
          <MaterialIcon
            name="error_outline"
            className="text-red-500 shrink-0"
          />
          <p className="text-sm text-red-600 dark:text-red-400">
            {cancelError}
          </p>
          <button
            type="button"
            onClick={() => setCancelError(null)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            <MaterialIcon name="close" className="text-base" />
          </button>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        {/* ── Header ── */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
                  {business.name}
                </h1>
                <p className="text-xs text-gray-500">
                  {authUser?.name ?? t("dashboard.businessDashboard")}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <MaterialIcon name="share" className="text-base" />
                {t("share.button")}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/business/${business.slug}?edit=true`)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <MaterialIcon name="edit" className="text-base" />
                {t("dashboard.editPage")}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* ── Stats Section ── */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
                {t("dashboard.performance")}
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
                  {t("dashboard.selectMetrics")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {METRIC_DEFS.filter((d) => activeMetrics.includes(d.key)).map(
                  (def) =>
                    report ? (
                      <AnalyticCard
                        key={def.key}
                        def={def}
                        report={report}
                        t={t}
                      />
                    ) : (
                      <div
                        key={def.key}
                        className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-400">
                          {t("dashboard.noData")}
                        </span>
                      </div>
                    ),
                )}
              </div>
            )}
          </section>

          {/* ── Reviews Summary ── */}
          {(business.reviewCount ?? 0) > 0 && (
            <section>
              <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
                {t("dashboard.reviews")}
              </h2>
              <div className="bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-6">
                {/* Average rating */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-4xl font-black text-[#0e141b] dark:text-white leading-tight">
                    {business.averageRating?.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const filled = (business.averageRating ?? 0) >= s;
                      const half =
                        !filled && (business.averageRating ?? 0) >= s - 0.5;
                      return (
                        <MaterialIcon
                          key={s}
                          name={
                            filled ? "star" : half ? "star_half" : "star_border"
                          }
                          className={`text-lg ${filled || half ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500">
                    {t("dashboard.reviewCount", {
                      count: business.reviewCount,
                    })}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px self-stretch bg-gray-100 dark:bg-gray-800" />

                {/* Rating breakdown from loaded reviews */}
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = Object.values(reviewMap).filter(
                      (r) => r.rating === star,
                    ).length;
                    const total = Object.values(reviewMap).length;
                    const pct =
                      total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-4 text-gray-500 text-right shrink-0">
                          {star}
                        </span>
                        <MaterialIcon
                          name="star"
                          className="text-yellow-400 text-xs shrink-0"
                        />
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-7 text-gray-400 shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── Upcoming Appointments ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
                {t("dashboard.upcomingAppointments")}
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/business/${business.slug}/schedule`)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                {t("dashboard.viewAll")}
                <MaterialIcon name="chevron_right" className="text-sm" />
              </button>
            </div>

            {apptLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <MaterialIcon
                    name="calendar_today"
                    className="text-2xl text-gray-400"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.noUpcoming.title")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.noUpcoming.text")}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <Card key={appt.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                          {appt.clientName}
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
                        {t("dashboard.confirmed")}
                      </Badge>
                    </div>
                  </Card>
                ))}

                {/* View full schedule CTA */}
                <button
                  type="button"
                  onClick={() => navigate(`/business/${business.slug}/schedule`)}
                  className="w-full text-center text-sm text-primary font-semibold py-2 hover:underline"
                >
                  {t("dashboard.manageAll")}
                </button>
              </div>
            )}
          </section>

          {/* ── Completed Appointments ── */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("dashboard.completedAppointments")}
            </h2>

            {apptLoading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : completedAppointments.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-3 text-center">
                <MaterialIcon
                  name="check_circle"
                  className="text-3xl text-gray-400"
                />
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  {t("dashboard.noCompleted")}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedAppointments.map((appt) => {
                  const review = reviewMap[appt.id];
                  return (
                    <Card key={appt.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                            {appt.clientName}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {appt.serviceName} · {appt.partnerName}
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
                        {appt.status === AppointmentStatus.Completed && (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(appt.id)}
                            disabled={cancelingId === appt.id}
                            className="shrink-0 text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {cancelingId === appt.id
                              ? t("dashboard.canceling")
                              : t("dashboard.didntHappen")}
                          </button>
                        )}
                      </div>

                      {/* Review indicator / voided indicator */}
                      <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800">
                        {appt.status === AppointmentStatus.Canceled ? (
                          <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                            <MaterialIcon name="block" className="text-sm" />
                            {t("dashboard.markedNotCompleted")}
                          </p>
                        ) : review ? (
                          <button
                            type="button"
                            onClick={() => setViewingReview(review)}
                            className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                          >
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <MaterialIcon
                                  key={s}
                                  name={
                                    review.rating >= s ? "star" : "star_border"
                                  }
                                  className={`text-sm ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">
                              {review.comment
                                ? `"${review.comment.slice(0, 40)}${review.comment.length > 40 ? "…" : ""}"`
                                : t("reviews.viewModal.title")}
                            </span>
                            <MaterialIcon
                              name="open_in_new"
                              className="text-xs ml-auto"
                            />
                          </button>
                        ) : (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MaterialIcon
                              name="rate_review"
                              className="text-sm"
                            />
                            {t("dashboard.noReview")}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Quick Links ── */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("dashboard.manage")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Services & Working Hours */}
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${business.slug}/services`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="tune"
                    className="text-2xl text-purple-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.servicesHours")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.servicesHoursDesc")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>

              {/* Public business page */}
              <button
                type="button"
                onClick={() => navigate(`/business/${business.slug}`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="storefront"
                    className="text-2xl text-green-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.viewPublicPage")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.viewPublicPageDesc")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>

              {/* Edit business page */}
              <button
                type="button"
                onClick={() => navigate(`/business/${business.slug}?edit=true`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="edit_note"
                    className="text-2xl text-orange-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.editBusinessPage")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.editBusinessPageDesc")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>

              {/* Staff management */}
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${business.slug}/staff`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="group"
                    className="text-2xl text-indigo-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.staffManagement")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.staffManagementDesc")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>

              {/* Reviews */}
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${business.slug}/reviews`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="star"
                    className="text-2xl text-yellow-500"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.reviews")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(business.reviewCount ?? 0) > 0
                      ? `${t("dashboard.reviewCount", { count: business.reviewCount })} · ${business.averageRating?.toFixed(1)} ${t("dashboard.avgSuffix")}`
                      : t("dashboard.noReviewsYet")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>

              {/* Notification Settings */}
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${business.slug}/notifications`)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name="notifications"
                    className="text-2xl text-sky-500"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#111418] dark:text-white text-sm">
                    {t("dashboard.notificationSettings")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("dashboard.notificationSettingsSubtext")}
                  </p>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="text-gray-400 ml-auto shrink-0"
                />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Share modal */}
      {business && (
        <ShareModal
          open={isShareOpen}
          businessSlug={business.slug}
          businessName={business.name}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </>
  );
}
