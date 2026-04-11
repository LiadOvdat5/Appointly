import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";
import type { ImpactInfo } from "./scheduleEditorTypes";

interface ImpactDialogProps {
  impact: ImpactInfo;
  onKeepSlots: () => void;
  onDeleteFreeSlots: () => void;
  onCancel: () => void;
  scheduleUrl: string;
}

export function ImpactDialog({
  impact,
  onKeepSlots,
  onDeleteFreeSlots,
  onCancel,
  scheduleUrl,
}: ImpactDialogProps) {
  const { t } = useTranslation();
  const hasDestructive = impact.freeSlotCount > 0 || impact.bookedCount > 0;

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
            <MaterialIcon name="warning" className="text-xl text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-[#111418] dark:text-white text-base">
              {t("scheduleEditor.scheduleChangeTitle")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("scheduleEditor.reviewBeforeSaving")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {impact.freeSlotCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-3 py-2.5">
              <MaterialIcon name="event_busy" className="text-red-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-semibold">{t("scheduleEditor.freeSlots", { count: impact.freeSlotCount })}</span>{" "}
                {t("scheduleEditor.willBeRemovedIfDelete")}
              </p>
            </div>
          )}

          {impact.bookedCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2.5">
              <MaterialIcon name="person_alert" className="text-amber-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-semibold">{t("scheduleEditor.appointmentsBooked", { count: impact.bookedCount })}</span>{" "}
                {t("scheduleEditor.duringAffectedHours")} <strong>{t("scheduleEditor.notCanceled")}</strong>{" "}
                {t("scheduleEditor.cancelIndividuallyFrom")}{" "}
                <a href={scheduleUrl} className="underline font-semibold">
                  {t("scheduleEditor.schedulePage")}
                </a>
                .
              </p>
            </div>
          )}

          {impact.infoMessages.map((msg, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-3 py-2.5"
            >
              <MaterialIcon name="info" className="text-blue-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">{msg}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {hasDestructive ? (
            <>
              {impact.freeSlotCount > 0 && (
                <button
                  type="button"
                  onClick={onDeleteFreeSlots}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  {t("scheduleEditor.deleteAndSave", { count: impact.freeSlotCount })}
                </button>
              )}
              <button
                type="button"
                onClick={onKeepSlots}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-colors"
              >
                {impact.freeSlotCount > 0 ? t("scheduleEditor.keepSlotsAndSave") : t("scheduleEditor.understoodSave")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                {t("scheduleEditor.goBack")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onKeepSlots}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-colors"
              >
                {t("scheduleEditor.gotItSave")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                {t("scheduleEditor.goBack")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
