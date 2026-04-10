import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import {
  getClientAppointments,
  getPendingReviews,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { ReviewModal } from "../components/UI/ReviewModal";
import { formatTime } from "../utils/formatTime";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-[#4e7397] dark:text-gray-500 px-4 mb-2">
      {children}
    </h2>
  );
}

function WidgetSkeleton() {
  return (
    <div className="mx-4 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  );
}

// ─── Greeting Section ─────────────────────────────────────────────────────────

function GreetingSection({
  firstName,
  hasUpcoming,
}: {
  firstName: string;
  hasUpcoming: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="px-4 pt-8 pb-6 bg-white dark:bg-gray-950 border-b border-[#e7edf3] dark:border-gray-800">
      <h1 className="text-2xl font-black text-[#0e141b] dark:text-white tracking-tight">
        {t("customerHome.greeting", { name: firstName })}
      </h1>
      <p className="text-sm text-[#4e7397] dark:text-gray-400 mt-1">
        {hasUpcoming
          ? t("customerHome.greetingSubUpcoming")
          : t("customerHome.greetingSubEmpty")}
      </p>

      {/* Quick-search bar */}
      <button
        type="button"
        onClick={() => navigate("/search")}
        className="mt-4 w-full flex items-center gap-3 rounded-xl border border-[#d0dce8] dark:border-gray-700 bg-[#f0f4f8] dark:bg-gray-900 px-4 h-11 text-[#4e7397] dark:text-gray-400 text-sm hover:border-primary hover:text-primary dark:hover:text-primary transition-colors"
      >
        <MaterialIcon name="search" className="text-xl text-[#4e7397] dark:text-gray-400" />
        {t("customerHome.searchPlaceholder")}
      </button>
    </section>
  );
}

// ─── Next Appointment Widget ──────────────────────────────────────────────────

function NextAppointmentWidget({
  loading,
  next,
}: {
  loading: boolean;
  next: AppointmentDTO | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="pt-6">
      <SectionLabel>{t("customerHome.nextAppointment.label")}</SectionLabel>

      {loading ? (
        <WidgetSkeleton />
      ) : next ? (
        <Card className="mx-4 p-4">
          <div className="flex items-start gap-3">
            {/* Logo or placeholder */}
            {next.businessLogoUrl ? (
              <img
                src={next.businessLogoUrl}
                alt={next.businessName}
                className="h-12 w-12 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <MaterialIcon name="storefront" className="text-[#1980e6] text-xl!" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                {next.businessName}
              </p>
              <p className="text-xs text-[#4e7397] dark:text-gray-400 truncate mt-0.5">
                {next.serviceName}
              </p>
              <p className="text-xs text-[#4e7397] dark:text-gray-400 mt-1 flex items-center gap-1">
                <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                {formatDate(next.startDateTime)}&nbsp;·&nbsp;
                {formatTime(next.startDateTime)}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard/customer")}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              {t("customerHome.nextAppointment.viewAll")}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </Card>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="calendar_today" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("customerHome.nextAppointment.empty")}{" "}
            <Link to="/search" className="text-primary font-semibold hover:underline">
              {t("customerHome.nextAppointment.findBusiness")}
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Recent Businesses Widget ─────────────────────────────────────────────────

interface RecentBusiness {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  lastVisit: string; // ISO
}

function RecentBusinessesWidget({
  loading,
  businesses,
}: {
  loading: boolean;
  businesses: RecentBusiness[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="pt-6">
      <SectionLabel>{t("customerHome.recentBusinesses.label")}</SectionLabel>

      {loading ? (
        <div className="px-4 flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shrink-0 w-28 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="px-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/business/${b.slug}`)}
              className="shrink-0 w-28 flex flex-col items-center gap-2 rounded-2xl border border-[#e7edf3] dark:border-gray-800 bg-white dark:bg-surface-dark p-3 hover:border-primary transition-colors text-center"
            >
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <MaterialIcon name="storefront" className="text-[#1980e6] text-xl!" />
                </div>
              )}
              <p className="text-xs font-semibold text-[#111418] dark:text-white line-clamp-2 leading-tight">
                {b.name}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="mx-4 rounded-2xl border border-dashed border-[#d0dce8] dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="store" className="text-3xl text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-[#4e7397] dark:text-gray-400">
            {t("customerHome.recentBusinesses.empty")}{" "}
            <Link to="/search" className="text-primary font-semibold hover:underline">
              {t("customerHome.recentBusinesses.explore")}
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Pending Reviews Widget ───────────────────────────────────────────────────

function PendingReviewsWidget({
  loading,
  pending,
  onReviewSuccess,
}: {
  loading: boolean;
  pending: AppointmentDTO[];
  onReviewSuccess: (appointmentId: string) => void;
}) {
  const { t } = useTranslation();
  const [reviewing, setReviewing] = useState<AppointmentDTO | null>(null);

  if (!loading && pending.length === 0) return null;

  return (
    <>
      {reviewing && (
        <ReviewModal
          open
          businessId={reviewing.businessId}
          appointmentId={reviewing.id}
          businessName={reviewing.businessName}
          onSuccess={() => {
            onReviewSuccess(reviewing.id);
            setReviewing(null);
          }}
          onCancel={() => setReviewing(null)}
        />
      )}

      <section className="pt-6">
        <SectionLabel>{t("customerHome.pendingReviews.label")}</SectionLabel>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="mx-4 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((appt) => (
              <button
                key={appt.id}
                type="button"
                onClick={() => setReviewing(appt)}
                className="mx-4 flex items-center gap-3 rounded-2xl border border-[#e7edf3] dark:border-gray-800 bg-white dark:bg-surface-dark p-4 hover:border-primary transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <MaterialIcon name="star_border" className="text-amber-500 text-xl!" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                    {appt.businessName}
                  </p>
                  <p className="text-xs text-[#4e7397] dark:text-gray-400 truncate mt-0.5">
                    {appt.serviceName}&nbsp;·&nbsp;{formatDate(appt.startDateTime)}
                  </p>
                </div>
                <MaterialIcon name="chevron_right" className="text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerHomePage() {
  const user = useAppSelector(selectUser);
  const firstName = getFirstName(user?.name ?? "");

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AppointmentDTO[]>([]);

  useEffect(() => {
    Promise.all([
      getClientAppointments(1, 100),
      getPendingReviews(3),
    ])
      .then(([appts, pending]) => {
        setAppointments(appts);
        setPendingReviews(pending);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  // Next upcoming scheduled appointment
  const nextAppointment =
    appointments
      .filter(
        (a) =>
          a.status === AppointmentStatus.Scheduled &&
          new Date(a.startDateTime) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      )[0] ?? null;

  // Distinct recent businesses from past appointments, ordered by most recent
  const recentBusinesses: RecentBusiness[] = (() => {
    const seen = new Set<string>();
    const result: RecentBusiness[] = [];
    const past = appointments
      .filter(
        (a) =>
          a.status !== AppointmentStatus.Scheduled ||
          new Date(a.startDateTime) < now,
      )
      .sort(
        (a, b) =>
          new Date(b.startDateTime).getTime() -
          new Date(a.startDateTime).getTime(),
      );

    for (const appt of past) {
      if (seen.has(appt.businessId)) continue;
      seen.add(appt.businessId);
      result.push({
        id: appt.businessId,
        slug: appt.businessSlug,
        name: appt.businessName,
        logoUrl: appt.businessLogoUrl,
        lastVisit: appt.startDateTime,
      });
      if (result.length === 5) break;
    }
    return result;
  })();

  function handleReviewSuccess(appointmentId: string) {
    setPendingReviews((prev) => prev.filter((a) => a.id !== appointmentId));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-16">
      <GreetingSection
        firstName={firstName}
        hasUpcoming={nextAppointment !== null}
      />

      <NextAppointmentWidget loading={loading} next={nextAppointment} />

      <RecentBusinessesWidget
        loading={loading}
        businesses={recentBusinesses}
      />

      <PendingReviewsWidget
        loading={loading}
        pending={pendingReviews}
        onReviewSuccess={handleReviewSuccess}
      />
    </div>
  );
}
