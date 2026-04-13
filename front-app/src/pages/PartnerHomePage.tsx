import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import {
  getBusinessAppointmentsByRange,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { getPublicBusinessById } from "../services/businessManagementService";
import { getStaffServices } from "../services/staffService";
import type { BusinessProfile } from "../types/business";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { formatTime } from "../utils/formatTime";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

function todayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-[#4e7397] dark:text-gray-500 px-4 mb-2">
      {children}
    </h2>
  );
}

function WidgetSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="mx-4 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Today's Schedule Widget ──────────────────────────────────────────────────

const MAX_VISIBLE = 5;

function TodayScheduleWidget({
  loading,
  appointments,
  businessId,
}: {
  loading: boolean;
  appointments: AppointmentDTO[];
  businessId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const upcoming = appointments.filter(
    (a) => a.status === AppointmentStatus.Scheduled,
  );
  const visible = upcoming.slice(0, MAX_VISIBLE);
  const overflow = upcoming.length - visible.length;

  return (
    <section className="pt-6">
      <SectionLabel>{t("partnerHome.todaySchedule.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton rows={3} />
      ) : visible.length > 0 ? (
        <Card className="mx-4 divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
          {visible.map((appt) => (
            <div key={appt.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <MaterialIcon name="person" className="text-purple-600 text-base!" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                  {appt.clientName}
                </p>
                <p className="text-xs text-[#4e7397] dark:text-gray-400 truncate mt-0.5">
                  {appt.serviceName}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#111418] dark:text-white shrink-0 tabular-nums">
                {formatTime(appt.startDateTime)}
              </span>
            </div>
          ))}

          {overflow > 0 && (
            <div className="px-4 py-2 text-center">
              <span className="text-xs text-[#4e7397] dark:text-gray-400">
                {t("partnerHome.todaySchedule.more", { count: overflow })}
              </span>
            </div>
          )}

          <div className="px-4 py-3 flex justify-end border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(`/staff-dashboard/${businessId}/appointments`)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              {t("partnerHome.todaySchedule.viewAll")}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </Card>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="event_available" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("partnerHome.todaySchedule.empty")}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

function QuickActionsSection({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      icon: "store",
      labelKey: "partnerHome.quickActions.dashboard",
      onClick: () => navigate(`/staff-dashboard/${businessId}`),
    },
  ];

  return (
    <section className="pt-6">
      <SectionLabel>{t("partnerHome.quickActions.label")}</SectionLabel>
      <div className="px-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.labelKey}
            type="button"
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#e7edf3] dark:border-gray-800 bg-white dark:bg-surface-dark px-3 py-4 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-center"
          >
            <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <MaterialIcon name={action.icon} className="text-purple-600 text-xl!" />
            </div>
            <span className="text-xs font-semibold text-[#111418] dark:text-white leading-tight">
              {t(action.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnerHomePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const firstName = getFirstName(user?.name ?? "");
  const businessId = user?.businessId ?? "";

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentDTO[]>([]);

  // Load business info
  useEffect(() => {
    if (!businessId) {
      setLoadingBusiness(false);
      return;
    }
    getPublicBusinessById(businessId)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoadingBusiness(false));
  }, [businessId]);

  // Load today's appointments, filtered to this staff member's services
  useEffect(() => {
    if (!businessId || !user) return;
    const { start, end } = todayRange();
    setLoadingAppointments(true);

    Promise.all([
      getBusinessAppointmentsByRange(businessId, start, end),
      getStaffServices(businessId, user.id).catch(() => [] as string[]),
    ])
      .then(([appts, assignedIds]) => {
        const myAppts = assignedIds.length > 0
          ? appts.filter((a) => assignedIds.includes(a.serviceId))
          : appts;
        setTodaysAppointments(myAppts);
      })
      .catch(() => setTodaysAppointments([]))
      .finally(() => setLoadingAppointments(false));
  }, [businessId, user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-16">
      {/* ── Greeting ── */}
      <section className="px-4 pt-8 pb-6 bg-white dark:bg-gray-950 border-b border-[#e7edf3] dark:border-gray-800">
        <h1 className="text-2xl font-black text-[#0e141b] dark:text-white tracking-tight">
          {t("partnerHome.greeting", { name: firstName })}
        </h1>

        {loadingBusiness ? (
          <div className="h-4 w-40 mt-2 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : business ? (
          <p className="text-sm text-[#4e7397] dark:text-gray-400 mt-1">
            {t("partnerHome.workingAt", { name: business.name })}
          </p>
        ) : null}
      </section>

      {/* ── Today's Schedule ── */}
      <TodayScheduleWidget
        loading={loadingAppointments}
        appointments={todaysAppointments}
        businessId={businessId}
      />

      {/* ── Quick Actions ── */}
      {businessId && <QuickActionsSection businessId={businessId} />}
    </div>
  );
}
