import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import { setSession } from "../redux/authSlice";
import { demoteToClient } from "../api/user";
import { refresh } from "../api/auth";
import {
  getBusinessAppointmentsByRange,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { getMyBusinesses, type OwnedBusinessDTO } from "../services/ownerService";
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

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

function resolveLogoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
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

// ─── Greeting Section ─────────────────────────────────────────────────────────

function GreetingSection({
  firstName,
  business,
  hasMultiple,
  onSwitchToCustomer,
}: {
  firstName: string;
  business: OwnedBusinessDTO | null;
  hasMultiple: boolean;
  onSwitchToCustomer: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="px-4 pt-8 pb-6 bg-white dark:bg-gray-950 border-b border-[#e7edf3] dark:border-gray-800">
      <h1 className="text-2xl font-black text-[#0e141b] dark:text-white tracking-tight">
        {t("ownerHome.greeting", { name: firstName })}
      </h1>

      {business ? (
        <p className="text-sm text-[#4e7397] dark:text-gray-400 mt-1">
          {hasMultiple ? (
            t("ownerHome.yourBusinesses")
          ) : (
            <Link
              to={`/business/${business.slug}`}
              className="text-primary font-semibold hover:underline"
            >
              {t("ownerHome.businessSubtitle", { name: business.name })}
            </Link>
          )}
        </p>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="storefront" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("ownerHome.noBusinessPrompt")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="mt-1 px-5 h-10 rounded-xl bg-[#1980e6] text-white text-sm font-bold hover:bg-[#1670cc] transition-colors"
          >
            {t("ownerHome.completeSetup")}
          </button>
          <button
            type="button"
            onClick={onSwitchToCustomer}
            className="text-sm text-[#4e7397] dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
          >
            {t("ownerHome.switchToCustomer")}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Business Picker ──────────────────────────────────────────────────────────

function BusinessPicker({
  businesses,
  selected,
  onSelect,
}: {
  businesses: OwnedBusinessDTO[];
  selected: OwnedBusinessDTO;
  onSelect: (b: OwnedBusinessDTO) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="pt-6">
      <SectionLabel>{t("ownerHome.yourBusinesses")}</SectionLabel>
      <div className="px-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {businesses.map((b) => {
          const isActive = b.id === selected.id;
          const logo = resolveLogoUrl(b.logoUrl);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b)}
              className={[
                "shrink-0 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-blue-50 dark:bg-blue-900/20 text-primary"
                  : "border-[#e7edf3] dark:border-gray-700 bg-white dark:bg-surface-dark text-[#111418] dark:text-white hover:border-primary",
              ].join(" ")}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={b.name}
                  className="h-7 w-7 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <MaterialIcon name="storefront" className="text-[#1980e6] text-sm!" />
                </div>
              )}
              <span className="max-w-[120px] truncate">{b.name}</span>
              {isActive && (
                <MaterialIcon name="check_circle" className="text-primary text-base shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Today's Appointments Widget ──────────────────────────────────────────────

const MAX_VISIBLE = 5;

function TodayScheduleWidget({
  loading,
  appointments,
  businessSlug,
}: {
  loading: boolean;
  appointments: AppointmentDTO[];
  businessSlug: string;
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
      <SectionLabel>{t("ownerHome.todaySchedule.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton rows={3} />
      ) : visible.length > 0 ? (
        <Card className="mx-4 divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
          {visible.map((appt) => (
            <div key={appt.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <MaterialIcon name="person" className="text-[#1980e6] text-base!" />
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
                {t("ownerHome.todaySchedule.more", { count: overflow })}
              </span>
            </div>
          )}

          <div className="px-4 py-3 flex justify-end border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/${businessSlug}`)}
              className="text-xs text-primary font-semibold flex items-center gap-1 group"
            >
              <span className="group-hover:underline">{t("ownerHome.todaySchedule.viewAll")}</span>
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </Card>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="event_available" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("ownerHome.todaySchedule.empty")}{" "}
            <Link
              to={`/business/${businessSlug}/schedule`}
              className="text-primary font-semibold hover:underline"
            >
              {t("ownerHome.todaySchedule.manage")}
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

interface QuickAction {
  icon: string;
  labelKey: string;
  to: string;
}

function QuickActionsSection({ business }: { business: OwnedBusinessDTO }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      icon: "storefront",
      labelKey: "ownerHome.quickActions.businessPage",
      to: `/business/${business.slug}`,
    },
    {
      icon: "build",
      labelKey: "ownerHome.quickActions.services",
      to: `/dashboard/${business.slug}/services`,
    },
    {
      icon: "calendar_month",
      labelKey: "ownerHome.quickActions.schedule",
      to: `/business/${business.slug}/schedule`,
    },
    {
      icon: "bar_chart",
      labelKey: "ownerHome.quickActions.dashboard",
      to: `/dashboard/${business.slug}`,
    },
  ];

  return (
    <section className="pt-6">
      <SectionLabel>{t("ownerHome.quickActions.label")}</SectionLabel>
      <div className="px-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#e7edf3] dark:border-gray-800 bg-white dark:bg-surface-dark px-3 py-4 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-center"
          >
            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <MaterialIcon name={action.icon} className="text-[#1980e6] text-xl!" />
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

export default function OwnerHomePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const firstName = getFirstName(user?.name ?? "");

  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [businesses, setBusinesses] = useState<OwnedBusinessDTO[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<OwnedBusinessDTO | null>(null);

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentDTO[]>([]);

  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Load owner's businesses once
  useEffect(() => {
    getMyBusinesses()
      .then((list) => {
        setBusinesses(list);
        if (list.length > 0) setSelectedBusiness(list[0]);
      })
      .finally(() => setLoadingBusinesses(false));
  }, []);

  // Fetch today's appointments whenever the selected business changes
  useEffect(() => {
    if (!selectedBusiness) return;
    const { start, end } = todayRange();
    setLoadingAppointments(true);
    getBusinessAppointmentsByRange(selectedBusiness.id, start, end)
      .then(setTodaysAppointments)
      .finally(() => setLoadingAppointments(false));
  }, [selectedBusiness]);

  const hasBusiness = businesses.length > 0;
  const hasMultiple = businesses.length > 1;

  const handleConfirmSwitch = async () => {
    setSwitching(true);
    try {
      await demoteToClient();
      const session = await refresh();
      dispatch(setSession({ user: session.user, expiresAt: new Date(session.expiresAt).getTime() }));
      navigate("/");
    } catch {
      setSwitching(false);
      setShowSwitchDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-16">
      {showSwitchDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-lg font-bold text-[#0e141b] dark:text-white">
              {t("ownerHome.switchToCustomerConfirmTitle")}
            </h2>
            <p className="text-sm text-[#4e7397] dark:text-gray-400">
              {t("ownerHome.switchToCustomerConfirmBody")}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowSwitchDialog(false)}
                className="flex-1 h-10 rounded-xl border border-[#d0dce8] dark:border-gray-700 text-sm font-semibold text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t("ownerHome.switchToCustomerCancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={switching}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {switching ? "…" : t("ownerHome.switchToCustomerConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <GreetingSection
        firstName={firstName}
        business={loadingBusinesses ? null : (selectedBusiness ?? null)}
        hasMultiple={hasMultiple}
        onSwitchToCustomer={() => setShowSwitchDialog(true)}
      />

      {/* Show skeleton for initial business load */}
      {loadingBusinesses && (
        <div className="pt-6">
          <WidgetSkeleton rows={1} />
        </div>
      )}

      {!loadingBusinesses && hasBusiness && selectedBusiness && (
        <>
          {hasMultiple && (
            <BusinessPicker
              businesses={businesses}
              selected={selectedBusiness}
              onSelect={setSelectedBusiness}
            />
          )}

          <TodayScheduleWidget
            loading={loadingAppointments}
            appointments={todaysAppointments}
            businessSlug={selectedBusiness.slug}
          />

          <QuickActionsSection business={selectedBusiness} />
        </>
      )}
    </div>
  );
}
