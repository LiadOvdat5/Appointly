import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import { getPartnerStats, type PartnerStats } from "../services/staffService";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";

// ─── Tutorial ─────────────────────────────────────────────────────────────────

const STAFF_HOME_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='partner-greeting']",
    titleKey: "tutorials.staff-home.step1.title",
    bodyKey: "tutorials.staff-home.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='partner-workplace']",
    titleKey: "tutorials.staff-home.step2.title",
    bodyKey: "tutorials.staff-home.step2.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='partner-assigned-services']",
    titleKey: "tutorials.staff-home.step3.title",
    bodyKey: "tutorials.staff-home.step3.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='partner-next-appointment']",
    titleKey: "tutorials.staff-home.step4.title",
    bodyKey: "tutorials.staff-home.step4.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='partner-stats']",
    titleKey: "tutorials.staff-home.step5.title",
    bodyKey: "tutorials.staff-home.step5.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='partner-schedule']",
    titleKey: "tutorials.staff-home.step6.title",
    bodyKey: "tutorials.staff-home.step6.body",
    placement: "auto",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-[#4e7397] dark:text-gray-500 px-4 mb-2">
      {children}
    </h2>
  );
}

function WidgetSkeleton({ rows = 1, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`mx-4 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse ${tall ? "h-32" : "h-20"}`}
        />
      ))}
    </div>
  );
}

// ─── Next Appointment Card ─────────────────────────────────────────────────────

function NextAppointmentCard({
  loading,
  stats,
  businessId,
}: {
  loading: boolean;
  stats: PartnerStats | null;
  businessId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const next = stats?.nextAppointment;

  return (
    <section data-tutorial="partner-next-appointment" className="pt-6">
      <SectionLabel>{t("partnerHome.nextAppointment.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton tall />
      ) : next ? (
        <Card className="mx-4 bg-linear-to-br from-purple-600 to-purple-800 text-white border-0 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">
                {formatDate(next.startDateTime)}
              </p>
              <p className="text-3xl font-black tracking-tight mb-1">
                {formatTime(next.startDateTime)}
              </p>
              <p className="font-semibold text-base truncate">{next.customerName}</p>
              <p className="text-purple-200 text-sm truncate mt-0.5">
                {next.serviceName} · {next.durationMinutes} min
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <MaterialIcon name="schedule" className="text-white text-2xl!" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/staff-dashboard/${businessId}/appointments`)}
            className="mt-4 text-xs text-purple-200 font-semibold hover:text-white flex items-center gap-1 transition-colors"
          >
            {t("partnerHome.nextAppointment.viewAll")}
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </Card>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="event_available" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("partnerHome.nextAppointment.empty")}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ loading, stats }: { loading: boolean; stats: PartnerStats | null }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <section className="pt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </section>
    );
  }

  const items = [
    {
      label: t("partnerHome.stats.today"),
      value: stats?.todayCount ?? 0,
      icon: "today",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("partnerHome.stats.thisWeek"),
      value: stats?.weekCount ?? 0,
      icon: "calendar_month",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
  ];

  return (
    <section data-tutorial="partner-stats" className="pt-6 px-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Card key={item.label} className="flex flex-col items-center gap-2 py-5 text-center">
            <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <MaterialIcon name={item.icon} className={`${item.color} text-xl!`} />
            </div>
            <p className="text-2xl font-black text-[#111418] dark:text-white">{item.value}</p>
            <p className="text-xs text-[#4e7397] dark:text-gray-400 font-medium">{item.label}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ─── Assigned Services ────────────────────────────────────────────────────────

function AssignedServicesSection({
  loading,
  stats,
}: {
  loading: boolean;
  stats: PartnerStats | null;
}) {
  const { t } = useTranslation();
  const services = stats?.assignedServices ?? [];

  return (
    <section data-tutorial="partner-assigned-services" className="pt-6">
      <SectionLabel>{t("partnerHome.assignedServices.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton rows={2} />
      ) : services.length > 0 ? (
        <div className="px-4 flex flex-col gap-3">
          {services.map((svc) => (
            <Card key={svc.serviceId} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <MaterialIcon name="content_cut" className="text-purple-600 text-base!" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                  {svc.name}
                </p>
                <p className="text-xs text-[#4e7397] dark:text-gray-400 mt-0.5">
                  {svc.durationMinutes} min
                  {svc.price != null ? ` · ₪${svc.price}` : ""}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-5 text-center">
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("partnerHome.assignedServices.empty")}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Workplace Card ───────────────────────────────────────────────────────────

function WorkplaceCard({
  loading,
  stats,
}: {
  loading: boolean;
  stats: PartnerStats | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const biz = stats?.business;

  return (
    <section data-tutorial="partner-workplace" className="pt-6 pb-8">
      <SectionLabel>{t("partnerHome.workplace.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton />
      ) : biz ? (
        <Card className="mx-4 flex items-center gap-4 p-4">
          {biz.logoUrl ? (
            <img
              src={biz.logoUrl}
              alt={biz.name}
              className="h-12 w-12 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <MaterialIcon name="store" className="text-gray-400 text-xl!" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#111418] dark:text-white truncate">{biz.name}</p>
            {biz.slug && (
              <p className="text-xs text-[#4e7397] dark:text-gray-400 mt-0.5 truncate">
                bizslot.co/{biz.slug}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => biz.slug && navigate(`/business/${biz.slug}`)}
            className="text-primary shrink-0"
            aria-label={t("partnerHome.workplace.viewPage")}
          >
            <MaterialIcon name="open_in_new" className="text-xl!" />
          </button>
        </Card>
      ) : null}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnerHomePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const firstName = getFirstName(user?.name ?? "");
  const businessId = user?.businessId ?? "";

  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial("staff-home");

  useEffect(() => {
    getPartnerStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-16">
      {tutorialActive && (
        <Tutorial
          tutorialKey="staff-home"
          steps={STAFF_HOME_TUTORIAL_STEPS}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}

      {/* ── Greeting ── */}
      <section data-tutorial="partner-greeting" className="px-4 pt-8 pb-6 bg-white dark:bg-gray-950 border-b border-[#e7edf3] dark:border-gray-800">
        <h1 className="text-2xl font-black text-[#0e141b] dark:text-white tracking-tight">
          {t("partnerHome.greeting", { name: firstName })}
        </h1>
        {!loading && stats?.business && (
          <p className="text-sm text-[#4e7397] dark:text-gray-400 mt-1">
            {t("partnerHome.workingAt", { name: stats.business.name })}
          </p>
        )}
        {loading && (
          <div className="h-4 w-40 mt-2 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        )}
      </section>

      {/* ── Next Appointment ── */}
      <NextAppointmentCard loading={loading} stats={stats} businessId={businessId} />

      {/* ── Stats Row (Today / This Week) ── */}
      <StatsRow loading={loading} stats={stats} />

      {/* ── Assigned Services ── */}
      <AssignedServicesSection loading={loading} stats={stats} />

      {/* ── Workplace Card ── */}
      <WorkplaceCard loading={loading} stats={stats} />
    </div>
  );
}
