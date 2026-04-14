import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatTime } from "../utils/formatTime";
import { useTranslation } from "react-i18next";
import type { RootState } from "../redux/store";
import {
  getBusinessAppointments,
  cancelAppointment,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { getServicesForBusiness, getPublicBusinessById } from "../services/businessManagementService";
import { getStaffServices } from "../services/staffService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewViewModal } from "../components/UI/ReviewViewModal";
import { AddToCalendarButton } from "../components/UI/AddToCalendarButton";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function StaffDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [assignedServices, setAssignedServices] = useState<ServiceProfile[]>(
    [],
  );
  const [allAppointments, setAllAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  // Cancel flow
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reviews
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewDTO>>({});
  const [viewingReview, setViewingReview] = useState<ReviewDTO | null>(null);

  const bid = businessId ?? authUser?.businessId ?? "";

  useEffect(() => {
    if (!bid || !authUser) return;
    setLoading(true);

    // Check suspension first, then load data
    getPublicBusinessById(bid)
      .then((biz) => {
        if (biz.isSuspended) {
          setIsSuspended(true);
          setLoading(false);
          return;
        }
        Promise.all([
          getServicesForBusiness(bid),
          getStaffServices(bid, authUser.id).catch(() => [] as string[]),
          getBusinessAppointments(bid, 1, 100).catch(() => [] as AppointmentDTO[]),
        ])
          .then(([allServices, assignedIds, allAppts]) => {
            const myServices = allServices.filter((s) => assignedIds.includes(s.id));
            setAssignedServices(myServices);
            setAllAppointments(allAppts);
          })
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        if (err?.response?.status === 503 || err?.response?.status === 410) setIsSuspended(true);
        setLoading(false);
      });
  }, [bid, authUser]);

  useEffect(() => {
    if (!bid) return;
    getBusinessReviews(bid, 1, 200)
      .then((reviews) => {
        const map: Record<string, ReviewDTO> = {};
        for (const r of reviews) map[r.appointmentId] = r;
        setReviewMap(map);
      })
      .catch(() => {
        /* silently ignore */
      });
  }, [bid]);

  const now = new Date();

  const upcoming = allAppointments
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
    )
    .slice(0, 10);

  const completed = allAppointments
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
      setCancelError(t("staffDashboard.error.voidFailed"));
    } finally {
      setCancelingId(null);
    }
  }

  if (isSuspended) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmCancelId !== null}
        title={t("staffDashboard.cancelDialog.title")}
        message={t("staffDashboard.cancelDialog.message")}
        confirmLabel={t("staffDashboard.cancelDialog.confirm")}
        cancelLabel={t("staffDashboard.cancelDialog.cancel")}
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
          <div className="max-w-2xl mx-auto">
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {t("staffDashboard.title")}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {authUser?.name} · {t("staffDashboard.subtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
          {/* ── Assigned Services ── */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("staffDashboard.myServices")}
            </h2>

            {assignedServices.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-3 text-center">
                <MaterialIcon
                  name="design_services"
                  className="text-3xl text-gray-400"
                />
                <div>
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">
                    {t("staffDashboard.noServices.title")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("staffDashboard.noServices.text")}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {assignedServices.map((svc) => (
                  <Card key={svc.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MaterialIcon
                          name="design_services"
                          className="text-base text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                          {svc.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {svc.duration} min
                          {svc.price != null
                            ? ` · $${svc.price.toFixed(2)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-auto! px-3"
                          onClick={() =>
                            navigate(
                              `/business/${bid}/schedule?serviceId=${svc.id}`,
                            )
                          }
                        >
                          {t("staffDashboard.viewSchedule")}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-auto! px-3"
                          onClick={() => navigate(`/schedule/${bid}/${svc.id}`)}
                        >
                          {t("staffDashboard.editAvailability")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* ── Upcoming Appointments ── */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("staffDashboard.upcoming")}
            </h2>

            {upcoming.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-3 text-center">
                <MaterialIcon
                  name="calendar_today"
                  className="text-3xl text-gray-400"
                />
                <div>
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">
                    {t("staffDashboard.noUpcoming.title")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("staffDashboard.noUpcoming.text")}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
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
                              className="text-xs"
                            />
                            {formatDate(appt.startDateTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MaterialIcon name="schedule" className="text-xs" />
                            {formatTime(appt.startDateTime)} –{" "}
                            {formatTime(appt.endDateTime)}
                          </span>
                        </div>
                      </div>
                      <AddToCalendarButton
                        appointment={{
                          id: appt.id,
                          title: `${appt.serviceName} at ${appt.businessName}`,
                          startDateTime: appt.startDateTime,
                          durationMinutes: appt.serviceDuration,
                          businessName: appt.businessName,
                          businessAddress: appt.businessAddress,
                          serviceName: appt.serviceName,
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* ── Completed Appointments ── */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("staffDashboard.completed")}
            </h2>

            {completed.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-3 text-center">
                <MaterialIcon
                  name="check_circle"
                  className="text-3xl text-gray-400"
                />
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  {t("staffDashboard.noCompleted")}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {completed.map((appt) => {
                  const review = reviewMap[appt.id];
                  return (
                    <Card key={appt.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
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
                                className="text-xs"
                              />
                              {formatDate(appt.startDateTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MaterialIcon
                                name="schedule"
                                className="text-xs"
                              />
                              {formatTime(appt.startDateTime)} –{" "}
                              {formatTime(appt.endDateTime)}
                            </span>
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
                              ? t("staffDashboard.canceling")
                              : t("staffDashboard.didntHappen")}
                          </button>
                        )}
                      </div>

                      {/* Review indicator / voided indicator */}
                      <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800">
                        {appt.status === AppointmentStatus.Canceled ? (
                          <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                            <MaterialIcon name="block" className="text-sm" />
                            {t("staffDashboard.markedNotCompleted")}
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
                                : "View review"}
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
                            {t("staffDashboard.noReview")}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
