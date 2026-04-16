import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import { MaterialIcon } from "../UI/MaterialIcon";
import { AppointmentStatus } from "../../services/appointmentService";
import { StatusBadge } from "./StatusBadge";
import type { ReviewDTO } from "../../services/reviewService";
import type { MergedSlot } from "./schedulePageTypes";

interface SlotChipProps {
  slot: MergedSlot;
  isExpanded: boolean;
  cancelingId: string | null;
  review?: ReviewDTO;
  onToggle: () => void;
  onRequestCancel: (id: string) => void;
  onRequestDidntHappen: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
}

export function SlotChip({
  slot,
  isExpanded,
  cancelingId,
  review,
  onToggle,
  onRequestCancel,
  onRequestDidntHappen,
  onViewReview,
}: SlotChipProps) {
  const { t } = useTranslation();
  const time = formatTime(slot.startISO);
  const appt = slot.appointment;

  if (slot.isBlocked) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onToggle}
          className={[
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all",
            isExpanded
              ? "bg-red-500 text-white border-red-500 shadow-md"
              : "bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40",
          ].join(" ")}
        >
          <MaterialIcon name="block" className="text-xs leading-none" />
          {time}
          <MaterialIcon
            name={isExpanded ? "expand_less" : "expand_more"}
            className="text-xs leading-none opacity-70"
          />
        </button>
        {isExpanded && (
          <div className="mt-2 w-64 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-lg p-3 space-y-2 z-10">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <MaterialIcon name="block" className="text-sm" />
              {t("businessSchedule.blockedSlot")}
            </p>
            <p className="text-xs text-gray-500">
              {slot.blockingServiceName
                ? t("businessSchedule.blockedByService", { serviceName: slot.blockingServiceName })
                : t("businessSchedule.blockedByConflict")}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!slot.isBooked) {
    return (
      <div className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 font-medium select-none">
        {time}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all",
          isExpanded
            ? "bg-primary text-white border-primary shadow-md"
            : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
        ].join(" ")}
      >
        <MaterialIcon name="person" className="text-xs leading-none" />
        {time}
        {appt && (
          <span className="max-w-20 truncate opacity-80">{appt.clientName.split(" ")[0]}</span>
        )}
        <MaterialIcon
          name={isExpanded ? "expand_less" : "expand_more"}
          className="text-xs leading-none opacity-70"
        />
      </button>

      {isExpanded && appt && (
        <div className="mt-2 w-72 rounded-xl border border-primary/20 bg-white dark:bg-gray-900 shadow-lg p-4 space-y-3 z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">{appt.clientName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{appt.serviceName}</p>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <MaterialIcon name="schedule" className="text-sm leading-none" />
              {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
            </span>
            {appt.clientEmail && (
              <span className="flex items-center gap-1.5">
                <MaterialIcon name="mail" className="text-sm leading-none" />
                {appt.clientEmail}
              </span>
            )}
            {appt.servicePrice != null && (
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <MaterialIcon name="payments" className="text-sm leading-none" />
                ${appt.servicePrice.toFixed(2)}
              </span>
            )}
            {appt.notes && (
              <span className="flex items-start gap-1.5">
                <MaterialIcon name="notes" className="text-sm leading-none mt-0.5" />
                <span className="italic">{appt.notes}</span>
              </span>
            )}
          </div>

          {appt.status === AppointmentStatus.Canceled &&
            appt.notes?.includes("Service did not take place") && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                  <MaterialIcon name="block" className="text-sm" />
                  {t("businessSchedule.markedNotCompleted")}
                </p>
              </div>
            )}

          {appt.status === AppointmentStatus.Completed && (
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
                      ? `"${review.comment.slice(0, 35)}${review.comment.length > 35 ? "…" : ""}"`
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

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-mono text-gray-400">#{appt.confirmationCode}</span>
            {appt.status === AppointmentStatus.Scheduled && (
              <button
                type="button"
                onClick={() => onRequestCancel(appt.id)}
                disabled={cancelingId === appt.id}
                className="text-xs text-red-500 hover:underline disabled:opacity-50 font-semibold"
              >
                {cancelingId === appt.id ? t("businessSchedule.canceling") : t("businessSchedule.cancelAppointment")}
              </button>
            )}
            {appt.status === AppointmentStatus.Completed && (
              <button
                type="button"
                onClick={() => onRequestDidntHappen(appt.id)}
                disabled={cancelingId === appt.id}
                className="text-xs text-red-500 hover:underline disabled:opacity-50 font-semibold"
              >
                {cancelingId === appt.id ? t("businessSchedule.voiding") : t("businessSchedule.didntHappen")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
