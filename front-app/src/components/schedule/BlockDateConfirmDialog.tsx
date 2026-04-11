import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";

interface BlockDateConfirmDialogProps {
  dateStr: string;
  reason?: string;
  freeCount: number;
  bookedCount: number;
  scheduleUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BlockDateConfirmDialog({
  dateStr,
  reason,
  freeCount,
  bookedCount,
  scheduleUrl,
  onConfirm,
  onCancel,
}: BlockDateConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <MaterialIcon name="event_busy" className="text-xl text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-[#111418] dark:text-white text-base">
              {t("scheduleEditor.blockDateTitle", { date: dateStr })}
            </h2>
            {reason && (
              <p className="text-xs text-gray-500 mt-0.5">{t("scheduleEditor.reasonPrefix", { reason })}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {freeCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-3 py-2.5">
              <MaterialIcon name="info" className="text-blue-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">{t("scheduleEditor.freeSlotsHidden", { count: freeCount })}</span>{" "}
                {t("scheduleEditor.willBeHiddenAutoRestored")}
              </p>
            </div>
          )}
          {bookedCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2.5">
              <MaterialIcon name="person_alert" className="text-amber-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-semibold">{t("scheduleEditor.appointmentsOnDate", { count: bookedCount })}</span>{" "}
                {t("scheduleEditor.bookedOnDateNotCanceled")}{" "}
                <a href={scheduleUrl} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-danger hover:bg-danger/90 text-white transition-colors"
          >
            {t("scheduleEditor.blockDateConfirm")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            {t("buttons.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
