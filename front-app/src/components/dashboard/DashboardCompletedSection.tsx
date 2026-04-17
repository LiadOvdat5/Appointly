import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";
import { AppointmentStatus, type AppointmentDTO } from "../../services/appointmentService";
import type { ReviewDTO } from "../../services/reviewService";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const PREVIEW_COUNT = 3;

interface DashboardCompletedSectionProps {
  appointments: AppointmentDTO[];
  loading: boolean;
  cancelingId: string | null;
  reviewMap: Record<string, ReviewDTO>;
  onRequestVoid: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
  viewAllHref: string;
}

export function DashboardCompletedSection({
  appointments,
  loading,
  cancelingId,
  reviewMap,
  onRequestVoid,
  onViewReview,
  viewAllHref,
}: DashboardCompletedSectionProps) {
  const { t } = useTranslation();
  const preview = appointments.slice(0, PREVIEW_COUNT);
  const hasMore = appointments.length > PREVIEW_COUNT;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
          {t("dashboard.completedAppointments")}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="p-6 flex flex-col items-center gap-3 text-center">
          <MaterialIcon name="check_circle" className="text-3xl text-gray-400" />
          <p className="font-semibold text-[#111418] dark:text-white text-sm">
            {t("dashboard.noCompleted")}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {preview.map((appt) => {
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
                        <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                        {formatDate(appt.startDateTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MaterialIcon name="schedule" className="text-sm leading-none" />
                        {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
                      </span>
                      {appt.servicePrice != null && (
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <MaterialIcon name="payments" className="text-sm leading-none" />
                          ${appt.servicePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {appt.status === AppointmentStatus.Completed && (
                    <button
                      type="button"
                      onClick={() => onRequestVoid(appt.id)}
                      disabled={cancelingId === appt.id}
                      className="shrink-0 text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      {cancelingId === appt.id
                        ? t("dashboard.canceling")
                        : t("dashboard.didntHappen")}
                    </button>
                  )}
                </div>

                <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800">
                  {appt.status === AppointmentStatus.Canceled ? (
                    <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                      <MaterialIcon name="block" className="text-sm" />
                      {t("dashboard.markedNotCompleted")}
                    </p>
                  ) : review ? (
                    <button
                      type="button"
                      onClick={() => onViewReview(review)}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <MaterialIcon
                            key={s}
                            name={review.rating >= s ? "star" : "star_border"}
                            className={`text-sm ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">
                        {review.comment
                          ? `"${review.comment.slice(0, 40)}${review.comment.length > 40 ? "…" : ""}"`
                          : t("reviews.viewModal.title")}
                      </span>
                      <MaterialIcon name="open_in_new" className="text-xs ml-auto" />
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MaterialIcon name="rate_review" className="text-sm" />
                      {t("dashboard.noReview")}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
          {hasMore && (
            <a
              href={viewAllHref}
              className="flex items-center justify-center gap-1 py-3 text-xs font-semibold text-primary group"
            >
              <span className="group-hover:underline">{t("dashboard.viewAllAppointments", { count: appointments.length - PREVIEW_COUNT })}</span>
              <MaterialIcon name="chevron_right" className="text-sm leading-none" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
