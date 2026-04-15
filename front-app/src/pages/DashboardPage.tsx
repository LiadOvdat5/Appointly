import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../redux/store";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";
import { Role } from "../constants/roles";
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
import { getFollowerCount } from "../services/followService";
import type { BusinessProfile } from "../types/business";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewViewModal } from "../components/UI/ReviewViewModal";
import { ShareModal } from "../components/UI/ShareModal";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";
import { DashboardStatsSection } from "../components/dashboard/DashboardStatsSection";
import { DashboardQuickLinks } from "../components/dashboard/DashboardQuickLinks";
import { DashboardUpcomingSection } from "../components/dashboard/DashboardUpcomingSection";
import { DashboardCompletedSection } from "../components/dashboard/DashboardCompletedSection";
import { DEFAULT_METRICS, type MetricKey } from "../components/dashboard/metricDefs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Tutorial steps ───────────────────────────────────────────────────────────

const OWNER_DASHBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='dashboard-stats']",
    titleKey: "tutorials.owner-dashboard.step1.title",
    bodyKey: "tutorials.owner-dashboard.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='dashboard-upcoming']",
    titleKey: "tutorials.owner-dashboard.step2.title",
    bodyKey: "tutorials.owner-dashboard.step2.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='dashboard-edit-link']",
    titleKey: "tutorials.owner-dashboard.step3.title",
    bodyKey: "tutorials.owner-dashboard.step3.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='dashboard-quick-links']",
    titleKey: "tutorials.owner-dashboard.step4.title",
    bodyKey: "tutorials.owner-dashboard.step4.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='dashboard-quick-links']",
    titleKey: "tutorials.owner-dashboard.step5.title",
    bodyKey: "tutorials.owner-dashboard.step5.body",
    placement: "top",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug: paramBusinessSlug } = useParams<{ businessSlug?: string }>();
  const authUser = useSelector((s: RootState) => s.auth.user);

  // Partners should never land on the owner dashboard
  if (authUser?.role === Role.Partner) {
    return <Navigate to={authUser.businessId ? `/staff-dashboard/${authUser.businessId}` : "/customer-dashboard"} replace />;
  }

  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial("owner-dashboard");

  // Business
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(null);

  // Follower count
  const [followerCount, setFollowerCount] = useState<number | null>(null);

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

  // ── Load follower count ──────────────────────────────────────────────────
  useEffect(() => {
    if (!business) return;
    getFollowerCount(business.id)
      .then(setFollowerCount)
      .catch(() => {
        /* silently ignore */
      });
  }, [business]);

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
      {tutorialActive && (
        <Tutorial
          tutorialKey="owner-dashboard"
          steps={OWNER_DASHBOARD_TUTORIAL_STEPS}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}
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
                data-tutorial="dashboard-edit-link"
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
          {/* Follower count summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm">
            <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <MaterialIcon name="favorite" className="text-xl text-rose-500 icon-filled" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                {t("dashboard.followers")}
              </p>
              {followerCount === null ? (
                <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mt-0.5" />
              ) : (
                <p className="text-2xl font-bold text-[#111418] dark:text-white leading-tight">
                  {followerCount.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div data-tutorial="dashboard-stats">
            <DashboardStatsSection
              report={report}
              reportLoading={reportLoading}
              activeMetrics={activeMetrics}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onToggleMetric={toggleMetric}
            />
          </div>

          <div data-tutorial="dashboard-upcoming">
            <DashboardUpcomingSection
              appointments={appointments}
              loading={apptLoading}
              businessSlug={business.slug}
            />
          </div>

          <DashboardCompletedSection
            appointments={completedAppointments}
            loading={apptLoading}
            cancelingId={cancelingId}
            reviewMap={reviewMap}
            onRequestVoid={setConfirmCancelId}
            onViewReview={setViewingReview}
            viewAllHref={`/business/${business.slug}/schedule`}
          />

          <div data-tutorial="dashboard-quick-links">
            <DashboardQuickLinks
              businessSlug={business.slug}
              reviewCount={business.reviewCount}
              averageRating={business.averageRating}
            />
          </div>
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
