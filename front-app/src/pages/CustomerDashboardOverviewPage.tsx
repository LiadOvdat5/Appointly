import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";
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
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { CustomerStatsSection } from "../components/dashboard/CustomerStatsSection";
import { CustomerUpcomingSection } from "../components/dashboard/CustomerUpcomingSection";
import { CustomerQuickLinks } from "../components/dashboard/CustomerQuickLinks";
import { CustomerFollowedSection } from "../components/dashboard/CustomerFollowedSection";
import {
  DEFAULT_CUSTOMER_METRICS,
  type CustomerMetricKey,
} from "../components/dashboard/customerMetricDefs";

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

const CUSTOMER_DASHBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='upcoming-section']",
    titleKey: "tutorials.customer-dashboard.step1.title",
    bodyKey: "tutorials.customer-dashboard.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='followed-section']",
    titleKey: "tutorials.customer-dashboard.step2.title",
    bodyKey: "tutorials.customer-dashboard.step2.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='quick-links']",
    titleKey: "tutorials.customer-dashboard.step3.title",
    bodyKey: "tutorials.customer-dashboard.step3.body",
    placement: "top",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboardOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial("customer-dashboard");

  const [upcoming, setUpcoming] = useState<AppointmentDTO[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  const [report, setReport] = useState<CustomerReportDTO | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const now = new Date();
  const [startDate, setStartDate] = useState(toInputDate(startOfMonth(now)));
  const [endDate, setEndDate] = useState(toInputDate(endOfMonth(now)));
  const [activeMetrics, setActiveMetrics] =
    useState<CustomerMetricKey[]>(DEFAULT_CUSTOMER_METRICS);

  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);

  const [followedBusinesses, setFollowedBusinesses] = useState<BusinessProfile[]>([]);
  const [followedLoading, setFollowedLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  function toggleMetric(key: CustomerMetricKey) {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

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
      .catch(() => { /* silently ignore */ })
      .finally(() => setUpcomingLoading(false));
  }, []);

  useEffect(() => {
    setReportLoading(true);
    getCustomerReport(new Date(startDate), new Date(endDate + "T23:59:59"))
      .then(setReport)
      .catch(() => { /* silently ignore */ })
      .finally(() => setReportLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    getMyInvitations()
      .then((inv) => {
        const pending = inv.filter((i) => i.status === InvitationStatus.Pending).length;
        setPendingInvitationCount(pending);
      })
      .catch(() => { /* silently ignore */ });
  }, []);

  useEffect(() => {
    setFollowedLoading(true);
    getFollowedBusinesses()
      .then(setFollowedBusinesses)
      .catch(() => { /* silently ignore */ })
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
      {tutorialActive && (
        <Tutorial
          tutorialKey="customer-dashboard"
          steps={CUSTOMER_DASHBOARD_TUTORIAL_STEPS}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}
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
        <CustomerStatsSection
          report={report}
          reportLoading={reportLoading}
          activeMetrics={activeMetrics}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onToggleMetric={toggleMetric}
        />

        <div data-tutorial="upcoming-section">
          <CustomerUpcomingSection
            appointments={upcoming}
            loading={upcomingLoading}
          />
        </div>

        <div data-tutorial="quick-links">
          <CustomerQuickLinks pendingInvitationCount={pendingInvitationCount} />
        </div>

        <div data-tutorial="followed-section">
          <CustomerFollowedSection
            businesses={followedBusinesses}
            loading={followedLoading}
            unfollowingId={unfollowingId}
            onUnfollow={handleUnfollow}
          />
        </div>
      </div>
    </div>
  );
}
