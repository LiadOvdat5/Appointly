import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTime } from "../utils/formatTime";
import {
  getClientAppointments,
  cancelAppointment,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Button } from "../components/UI/Button";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewModal } from "../components/UI/ReviewModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadgeVariant(
  status: number,
): "confirmed" | "cancelled" | "pending" {
  if (status === AppointmentStatus.Scheduled) return "confirmed";
  if (status === AppointmentStatus.Canceled) return "cancelled";
  return "pending"; // completed
}

type Tab = "upcoming" | "past";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [all, setAll] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");

  // Cancel flow
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Review flow
  const [reviewingAppt, setReviewingAppt] = useState<AppointmentDTO | null>(
    null,
  );
  // Track which appointment IDs have been reviewed this session
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    getClientAppointments(1, 100)
      .then((appointments) => {
        setAll(appointments);
        // If navigated from a review prompt notification, auto-open the modal
        const reviewId = searchParams.get("review");
        if (reviewId) {
          const target = appointments.find((a) => a.id === reviewId);
          if (target) {
            setTab("past");
            setReviewingAppt(target);
          }
        }
      })
      .catch(() => setError(t("customerAppointments.error.loadFailed")))
      .finally(() => setLoading(false));
  // searchParams intentionally excluded — only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const now = new Date();

  const upcoming = all
    .filter(
      (a) =>
        a.status !== AppointmentStatus.Canceled &&
        a.status !== AppointmentStatus.Completed &&
        new Date(a.startDateTime) >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  const past = all
    .filter(
      (a) =>
        a.status === AppointmentStatus.Completed ||
        a.status === AppointmentStatus.Canceled ||
        new Date(a.endDateTime) < now,
    )
    .sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime(),
    );

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    const id = confirmCancelId;
    setConfirmCancelId(null);
    setCancelingId(id);
    try {
      const updated = await cancelAppointment(id);
      setAll((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      // silently ignore
    } finally {
      setCancelingId(null);
    }
  }

  function handleReviewSuccess() {
    if (!reviewingAppt) return;
    setReviewedIds((prev) => new Set(prev).add(reviewingAppt.id));
    setReviewingAppt(null);
  }

  function statusLabel(status: number): string {
    if (status === AppointmentStatus.Scheduled)
      return t("customerAppointments.status.confirmed");
    if (status === AppointmentStatus.Canceled)
      return t("customerAppointments.status.canceled");
    return t("customerAppointments.status.completed");
  }

  const appointments = tab === "upcoming" ? upcoming : past;

  return (
    <>
      {/* Cancel confirm */}
      <ConfirmDialog
        open={confirmCancelId !== null}
        title={t("customerAppointments.cancelDialog.title")}
        message={t("customerAppointments.cancelDialog.message")}
        confirmLabel={t("customerAppointments.cancelDialog.confirm")}
        cancelLabel={t("customerAppointments.cancelDialog.cancel")}
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelId(null)}
      />

      {/* Review modal */}
      {reviewingAppt && (
        <ReviewModal
          open
          businessId={reviewingAppt.businessId}
          appointmentId={reviewingAppt.id}
          businessName={reviewingAppt.businessName}
          onSuccess={handleReviewSuccess}
          onCancel={() => setReviewingAppt(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        {/* Header */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="font-bold text-[#111418] dark:text-white text-base">
              {t("customerAppointments.title")}
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 flex">
          {(["upcoming", "past"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={[
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                tab === tabKey
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {tabKey === "upcoming"
                ? t("customerAppointments.tabs.upcoming")
                : t("customerAppointments.tabs.past")}
              {tabKey === "upcoming" && upcoming.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/10 text-primary text-[10px] px-1.5 py-0.5">
                  {upcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <MaterialIcon
                name="error_outline"
                className="text-red-500 shrink-0"
              />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && appointments.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MaterialIcon
                  name="calendar_today"
                  className="text-3xl text-gray-400"
                />
              </div>
              <div>
                <p className="font-semibold text-[#111418] dark:text-white">
                  {tab === "upcoming"
                    ? t("customerAppointments.empty.upcoming")
                    : t("customerAppointments.empty.past")}
                </p>
                {tab === "upcoming" && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t("customerAppointments.empty.text")}
                  </p>
                )}
              </div>
              {tab === "upcoming" && (
                <Button variant="primary" onClick={() => navigate("/search")}>
                  {t("customerAppointments.findBusiness")}
                </Button>
              )}
            </div>
          )}

          {/* Appointment list */}
          {!loading &&
            appointments.map((appt) => {
              const alreadyReviewed = reviewedIds.has(appt.id);
              return (
                <Card key={appt.id} className="p-4 space-y-3">
                  {/* Top row: business + badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                        {appt.businessName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {appt.serviceName}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(appt.status)}>
                      {statusLabel(appt.status)}
                    </Badge>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
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
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <MaterialIcon
                          name="payments"
                          className="text-sm leading-none"
                        />
                        ${appt.servicePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Footer: code + actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-mono text-gray-400">
                      #{appt.confirmationCode}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Cancel — upcoming scheduled only */}
                      {appt.status === AppointmentStatus.Scheduled && (
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(appt.id)}
                          disabled={cancelingId === appt.id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {cancelingId === appt.id
                            ? t("customerAppointments.canceling")
                            : t("customerAppointments.cancel")}
                        </button>
                      )}

                      {/* Canceled by business (didn't happen) */}
                      {appt.status === AppointmentStatus.Canceled &&
                        appt.notes?.includes("Service did not take place") && (
                          <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                            <MaterialIcon name="info" className="text-sm" />
                            {t("customerAppointments.notCompleted")}
                          </span>
                        )}

                      {/* Review — completed appointments */}
                      {appt.status === AppointmentStatus.Completed &&
                        (alreadyReviewed ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <MaterialIcon
                              name="check_circle"
                              className="text-sm"
                            />
                            {t("customerAppointments.reviewed")}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewingAppt(appt)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <MaterialIcon
                              name="star_border"
                              className="text-sm"
                            />
                            {t("customerAppointments.leaveReview")}
                          </button>
                        ))}
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}
