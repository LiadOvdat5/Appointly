import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import { Card } from "../UI/Card";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { MaterialIcon } from "../UI/MaterialIcon";
import { StatusBadge } from "./StatusBadge";
import { AppointmentStatus, type AppointmentDTO } from "../../services/appointmentService";
import type { SlotDTO } from "../../services/scheduleService";
import type { ReviewDTO } from "../../services/reviewService";
import type { ServiceProfile } from "../../types/business";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ScheduleListViewProps {
  services: ServiceProfile[];
  filtered: AppointmentDTO[];
  blockedSlots?: SlotDTO[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  isRangeApplied: boolean;
  selectedServiceId: string;
  timeFrom: string;
  timeTo: string;
  showCanceled: boolean;
  cancelingId: string | null;
  reviewMap: Record<string, ReviewDTO>;
  timezone?: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onApplyRange: () => void;
  onClearRange: () => void;
  onServiceChange: (v: string) => void;
  onTimeFromChange: (v: string) => void;
  onTimeToChange: (v: string) => void;
  onShowCanceledChange: (v: boolean) => void;
  onRequestCancel: (id: string) => void;
  onRequestDidntHappen: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
  onUnblockSlot?: (slotId: string) => Promise<void>;
}

export function ScheduleListView({
  services,
  filtered,
  blockedSlots = [],
  loading,
  error,
  startDate,
  endDate,
  isRangeApplied,
  selectedServiceId,
  timeFrom,
  timeTo,
  showCanceled,
  cancelingId,
  reviewMap,
  timezone,
  onStartDateChange,
  onEndDateChange,
  onApplyRange,
  onClearRange,
  onServiceChange,
  onTimeFromChange,
  onTimeToChange,
  onShowCanceledChange,
  onRequestCancel,
  onRequestDidntHappen,
  onViewReview,
  onUnblockSlot,
}: ScheduleListViewProps) {
  const { t } = useTranslation();

  // Build merged list: appointments + manually-blocked slots, sorted by time
  type ListItem =
    | { type: "appointment"; appt: AppointmentDTO }
    | { type: "blocked"; slot: SlotDTO };

  const mergedItems: ListItem[] = [
    ...filtered.map((appt): ListItem => ({ type: "appointment", appt })),
    // Only show manually-blocked slots (no blockingAppointmentId = manual block)
    ...blockedSlots
      .filter((s) => !s.blockingAppointmentId)
      .map((slot): ListItem => ({ type: "blocked", slot })),
  ].sort((a, b) => {
    const aTime = a.type === "appointment"
      ? new Date(a.appt.startDateTime).getTime()
      : new Date(a.slot.startDateTime).getTime();
    const bTime = b.type === "appointment"
      ? new Date(b.appt.startDateTime).getTime()
      : new Date(b.slot.startDateTime).getTime();
    return aTime - bTime;
  });

  return (
    <div className="space-y-5">
      {/* Filter panel */}
      <Card className="p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t("businessSchedule.filters")}
        </p>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">{t("businessSchedule.dateRange")}</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-32">
              <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.from")}</label>
              <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
            </div>
            <div className="flex-1 min-w-32">
              <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.to")}</label>
              <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="primary" onClick={onApplyRange}>{t("businessSchedule.apply")}</Button>
              {isRangeApplied && (
                <Button variant="ghost" onClick={onClearRange}>{t("businessSchedule.clear")}</Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-40">
            <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.service")}</label>
            <select
              value={selectedServiceId}
              onChange={(e) => onServiceChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{t("businessSchedule.allServices")}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-28">
            <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.timeFrom")}</label>
            <Input type="time" value={timeFrom} onChange={(e) => onTimeFromChange(e.target.value)} />
          </div>
          <div className="flex-1 min-w-28">
            <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.timeTo")}</label>
            <Input type="time" value={timeTo} onChange={(e) => onTimeToChange(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showCanceled}
            onChange={(e) => onShowCanceledChange(e.target.checked)}
            className="rounded accent-primary"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{t("businessSchedule.includeCanceled")}</span>
        </label>
      </Card>

      {!loading && !error && (
        <p className="text-xs text-gray-500 px-1">
          {mergedItems.length === 0
            ? t("businessSchedule.noAppointmentsFound")
            : t("businessSchedule.appointmentCount", { count: filtered.length })}
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && mergedItems.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MaterialIcon name="event_busy" className="text-2xl text-gray-400" />
          </div>
          <p className="font-semibold text-[#111418] dark:text-white text-sm">{t("businessSchedule.noAppointments")}</p>
          <p className="text-xs text-gray-500">{t("businessSchedule.tryAdjusting")}</p>
        </div>
      )}

      {!loading &&
        mergedItems.map((item) => {
          if (item.type === "blocked") {
            const slot = item.slot;
            return (
              <Card key={`blocked-${slot.id}`} className="p-4 space-y-2 border-l-4 border-l-red-400">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon name="lock" className="text-red-400 text-sm shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-red-500">{t("businessSchedule.blockedLabel")}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(slot.startDateTime)}
                        {" · "}
                        {formatTime(slot.startDateTime, timezone)} – {formatTime(slot.endDateTime, timezone)}
                      </p>
                    </div>
                  </div>
                  {onUnblockSlot && (
                    <button
                      type="button"
                      onClick={() => onUnblockSlot(slot.id)}
                      className="text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      {t("businessSchedule.unblockSlot")}
                    </button>
                  )}
                </div>
                {slot.blockNote && (
                  <p className="text-xs text-gray-500 italic pl-6">&ldquo;{slot.blockNote}&rdquo;</p>
                )}
              </Card>
            );
          }

          const appt = item.appt;
          const review = reviewMap[appt.id];
          const isCompleted = appt.status === AppointmentStatus.Completed;
          const isVoided =
            appt.status === AppointmentStatus.Canceled &&
            appt.notes?.includes("Service did not take place");

          return (
            <Card key={appt.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">{appt.clientName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{appt.serviceName} · {appt.partnerName}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                  {formatDate(appt.startDateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="schedule" className="text-sm leading-none" />
                  {formatTime(appt.startDateTime, timezone)} – {formatTime(appt.endDateTime, timezone)}
                </span>
                {appt.servicePrice != null && (
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <MaterialIcon name="payments" className="text-sm leading-none" />
                    ${appt.servicePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {isCompleted && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                  {review ? (
                    <button
                      type="button"
                      onClick={() => onViewReview(review)}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors w-full"
                    >
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <MaterialIcon
                            key={s}
                            name={review.rating >= s ? "star" : "star_border"}
                            className={`text-sm ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium truncate">
                        {review.comment
                          ? `"${review.comment.slice(0, 50)}${review.comment.length > 50 ? "…" : ""}"`
                          : t("businessSchedule.viewReview")}
                      </span>
                      <MaterialIcon name="open_in_new" className="text-xs ml-auto shrink-0" />
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MaterialIcon name="rate_review" className="text-sm" />
                      {t("businessSchedule.noReviewLeft")}
                    </p>
                  )}
                </div>
              )}

              {isVoided && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                  <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                    <MaterialIcon name="block" className="text-sm" />
                    {t("businessSchedule.markedNotCompleted")}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-mono text-gray-400">#{appt.confirmationCode}</span>
                {appt.status === AppointmentStatus.Scheduled && (
                  <button
                    type="button"
                    onClick={() => onRequestCancel(appt.id)}
                    disabled={cancelingId === appt.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {cancelingId === appt.id ? t("businessSchedule.canceling") : t("businessSchedule.cancel")}
                  </button>
                )}
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => onRequestDidntHappen(appt.id)}
                    disabled={cancelingId === appt.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {cancelingId === appt.id ? t("businessSchedule.voiding") : t("businessSchedule.didntHappen")}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
    </div>
  );
}
