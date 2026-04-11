import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "../UI/Alert";
import { Button } from "../UI/Button";
import { MaterialIcon } from "../UI/MaterialIcon";

export interface BlockedEntry {
  dateStr: string;
  reason: string | null;
}

interface BlockedDatesCalendarProps {
  year: number;
  month: number; // 0-indexed
  blockedDates: BlockedEntry[];
  togglingDate: string | null;
  error: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleDate: (dateStr: string, reason?: string) => void;
  onPrepareBlock: (dateStr: string, reason?: string) => void;
}

export function BlockedDatesCalendar({
  year, month, blockedDates, togglingDate, error,
  onPrevMonth, onNextMonth, onToggleDate, onPrepareBlock,
}: BlockedDatesCalendarProps) {
  const { t } = useTranslation();
  const monthNames = t("calendar.months", { returnObjects: true }) as string[];
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);

  const firstDayOfMonth = new Date(year, month, 1);
  const startPad = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const blockedSet = new Set(blockedDates.map((b) => b.dateStr));

  function makeDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleCellClick(day: number) {
    const ds = makeDateStr(day);
    if (ds <= todayStr) return;
    if (blockedSet.has(ds)) {
      onToggleDate(ds);
    } else {
      setPendingDate(ds);
      setReasonInput("");
    }
  }

  function confirmBlock() {
    if (!pendingDate) return;
    const reason = reasonInput.trim() || undefined;
    setPendingDate(null);
    setReasonInput("");
    onPrepareBlock(pendingDate, reason);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">{t("scheduleEditor.clickToBlock")}</p>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={t("calendar.prevMonth")}
        >
          <MaterialIcon name="chevron_left" />
        </button>
        <span className="text-sm font-semibold text-[#111418] dark:text-white">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={t("calendar.nextMonth")}
        >
          <MaterialIcon name="chevron_right" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => (
          <div key={d} className="text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />;
          const ds = makeDateStr(day);
          const isPast = ds <= todayStr;
          const isBlocked = blockedSet.has(ds);
          const isToggling = togglingDate === ds;
          const blockedEntry = blockedDates.find((b) => b.dateStr === ds);

          return (
            <button
              key={ds}
              type="button"
              disabled={isPast || isToggling}
              onClick={() => handleCellClick(day)}
              title={isBlocked && blockedEntry?.reason ? blockedEntry.reason : undefined}
              className={[
                "relative flex flex-col items-center justify-center rounded-lg py-1.5 text-sm transition-all",
                isPast
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : isBlocked
                  ? "bg-danger/15 text-danger font-semibold hover:bg-danger/25 ring-1 ring-danger/30"
                  : "text-[#111418] dark:text-white hover:bg-primary/10 hover:text-primary",
                isToggling ? "opacity-50 cursor-wait" : "",
              ].join(" ")}
            >
              <span className={isBlocked ? "line-through" : ""}>{day}</span>
              {isBlocked && (
                <span className="text-[8px] leading-none mt-0.5 text-danger/70">
                  {t("scheduleEditor.blockedCellLabel")}
                </span>
              )}
              {isToggling && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full border-2 border-danger border-t-transparent animate-spin" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Blocked dates list */}
      {blockedDates.length > 0 && (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-900">
            {t("scheduleEditor.blockedDatesListHeader")}
          </p>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...blockedDates]
              .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
              .map((b) => (
                <li key={b.dateStr} className="flex items-center justify-between px-3 py-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#111418] dark:text-white">{b.dateStr}</span>
                    {b.reason && <span className="text-xs text-gray-500">{b.reason}</span>}
                  </div>
                  <button
                    type="button"
                    disabled={togglingDate === b.dateStr || b.dateStr <= todayStr}
                    onClick={() => onToggleDate(b.dateStr)}
                    className="p-1 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                    aria-label={t("scheduleEditor.unblockAriaLabel")}
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Reason dialog */}
      {pendingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#111418] dark:text-white">
              {t("scheduleEditor.blockTitle", { date: pendingDate })}
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">{t("scheduleEditor.reasonLabel")}</label>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmBlock();
                  if (e.key === "Escape") setPendingDate(null);
                }}
                placeholder={t("scheduleEditor.reasonPlaceholder")}
                maxLength={255}
                autoFocus
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                  px-3 py-2 text-sm text-[#111418] dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPendingDate(null)}>{t("buttons.cancel")}</Button>
              <Button variant="primary" onClick={confirmBlock}>{t("scheduleEditor.blockDateButton")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
