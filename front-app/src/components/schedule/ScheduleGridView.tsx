import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";
import { SlotChip } from "./SlotChip";
import type { ReviewDTO } from "../../services/reviewService";
import type { ServiceProfile } from "../../types/business";
import type { MergedSlot, RangePreset } from "./schedulePageTypes";

function formatDateHeading(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

interface ScheduleGridViewProps {
  services: ServiceProfile[];
  gridServiceId: string;
  gridPreset: RangePreset;
  gridDays: { dateStr: string; date: Date; slots: MergedSlot[] }[];
  loading: boolean;
  error: string | null;
  expandedSlotKey: string | null;
  cancelingId: string | null;
  reviewMap: Record<string, ReviewDTO>;
  onServiceChange: (id: string) => void;
  onPresetChange: (p: RangePreset) => void;
  onRefresh: () => void;
  onToggleExpand: (key: string) => void;
  onRequestCancel: (id: string) => void;
  onRequestDidntHappen: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
}

export function ScheduleGridView({
  services,
  gridServiceId,
  gridPreset,
  gridDays,
  loading,
  error,
  expandedSlotKey,
  cancelingId,
  reviewMap,
  onServiceChange,
  onPresetChange,
  onRefresh,
  onToggleExpand,
  onRequestCancel,
  onRequestDidntHappen,
  onViewReview,
}: ScheduleGridViewProps) {
  const { t } = useTranslation();

  const totalBooked = gridDays.reduce((s, d) => s + d.slots.filter((sl) => sl.isBooked).length, 0);
  const totalFree = gridDays.reduce((s, d) => s + d.slots.filter((sl) => !sl.isBooked).length, 0);

  const presets: { value: RangePreset; label: string }[] = [
    { value: "week", label: t("businessSchedule.thisWeek") },
    { value: "next-week", label: t("businessSchedule.nextWeek") },
    { value: "month", label: t("businessSchedule.next30Days") },
  ];

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <select
            value={gridServiceId}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {services.length === 0 && <option value="">{t("businessSchedule.noServices")}</option>}
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPresetChange(p.value)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                gridPreset === p.value
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary transition-colors"
          title={t("businessSchedule.refresh")}
        >
          <MaterialIcon name="refresh" className="text-base" />
        </button>
      </div>

      {!loading && !error && (
        <div className="flex items-center gap-4 px-1">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
            {t("businessSchedule.bookedCount", { count: totalBooked })}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
            {t("businessSchedule.freeCount", { count: totalFree })}
          </span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MaterialIcon name="content_cut" className="text-3xl text-gray-400" />
          <p className="text-sm text-gray-500">{t("businessSchedule.noServicesConfigured")}</p>
        </div>
      )}

      {!loading && !error && services.length > 0 && gridDays.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MaterialIcon name="calendar_today" className="text-2xl text-gray-400" />
          </div>
          <p className="font-semibold text-[#111418] dark:text-white text-sm">{t("businessSchedule.noSlotsInRange")}</p>
          <p className="text-xs text-gray-500">{t("businessSchedule.generateSlotsHint")}</p>
        </div>
      )}

      {!loading &&
        !error &&
        gridDays.map((day) => {
          const bookedCount = day.slots.filter((s) => s.isBooked).length;
          const freeCount = day.slots.filter((s) => !s.isBooked).length;

          return (
            <div key={day.dateStr} className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-[#111418] dark:text-white">
                  {formatDateHeading(day.date)}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  {bookedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                      {t("businessSchedule.bookedCount", { count: bookedCount })}
                    </span>
                  )}
                  {freeCount > 0 && <span className="text-gray-300 dark:text-gray-600">·</span>}
                  {freeCount > 0 && <span>{t("businessSchedule.freeCount", { count: freeCount })}</span>}
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="flex flex-wrap gap-2">
                {day.slots.map((slot) => (
                  <SlotChip
                    key={slot.key}
                    slot={slot}
                    isExpanded={expandedSlotKey === slot.key}
                    cancelingId={cancelingId}
                    review={slot.appointment ? reviewMap[slot.appointment.id] : undefined}
                    onToggle={() => slot.isBooked && onToggleExpand(slot.key)}
                    onRequestCancel={onRequestCancel}
                    onRequestDidntHappen={onRequestDidntHappen}
                    onViewReview={onViewReview}
                  />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
