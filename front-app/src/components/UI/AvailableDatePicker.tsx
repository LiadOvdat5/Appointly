import { useCallback, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./MaterialIcon";
import { getAvailableDatesForMonth } from "../../services/scheduleService";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  serviceId: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
};

type CalendarState = {
  year: number;
  month: number; // 0-indexed
  availableDates: Set<string>; // "YYYY-MM-DD"
  loading: boolean;
  error: string | null;
};

type CalendarAction =
  | { type: "NAVIGATE"; year: number; month: number }
  | { type: "LOADING" }
  | { type: "LOADED"; dates: Set<string> }
  | { type: "ERROR"; message: string };

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, year: action.year, month: action.month, availableDates: new Set(), loading: true, error: null };
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "LOADED":
      return { ...state, availableDates: action.dates, loading: false };
    case "ERROR":
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Returns an array of {day, isCurrentMonth} objects for the calendar grid (6 weeks × 7 days).
 *  weekStartsOn: 0 = Sunday (Israeli standard), 1 = Monday (international default) */
function buildCalendarGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1) {
  const firstDay = new Date(year, month, 1);
  // Convert JS getDay() (0=Sun) to offset relative to week start
  const startOffset =
    weekStartsOn === 0
      ? firstDay.getDay()            // 0=Sun is already correct
      : (firstDay.getDay() + 6) % 7; // shift so 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; year: number; month: number }[] = [];

  // Days from prev month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ day: d, year: prevYear, month: prevMonth });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, year, month });
  }

  // Days from next month to fill remainder
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, year: nextYear, month: nextMonth });
  }

  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AvailableDatePicker({ serviceId, selectedDate, onDateSelect }: Props) {
  const { t, i18n } = useTranslation();
  const MONTHS = t("calendar.months", { returnObjects: true }) as string[];
  const DAYS = t("calendar.days", { returnObjects: true }) as string[];
  const weekStartsOn: 0 | 1 = i18n.language === "he" ? 0 : 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [state, dispatch] = useReducer(calendarReducer, {
    year: today.getFullYear(),
    month: today.getMonth(),
    availableDates: new Set<string>(),
    loading: true,
    error: null,
  });

  const loadMonth = useCallback(
    async (year: number, month: number) => {
      dispatch({ type: "LOADING" });
      try {
        const dates = await getAvailableDatesForMonth(serviceId, year, month);
        dispatch({ type: "LOADED", dates });
      } catch {
        dispatch({ type: "ERROR", message: t("calendar.error") });
      }
    },
    [serviceId, t],
  );

  useEffect(() => {
    loadMonth(state.year, state.month);
  }, [state.year, state.month, loadMonth]);

  function prevMonth() {
    const m = state.month === 0 ? 11 : state.month - 1;
    const y = state.month === 0 ? state.year - 1 : state.year;
    dispatch({ type: "NAVIGATE", year: y, month: m });
  }

  function nextMonth() {
    const m = state.month === 11 ? 0 : state.month + 1;
    const y = state.month === 11 ? state.year + 1 : state.year;
    dispatch({ type: "NAVIGATE", year: y, month: m });
  }

  // Disable prev-month nav when we're already on the current month
  const isCurrentMonth =
    state.year === today.getFullYear() && state.month === today.getMonth();

  const cells = buildCalendarGrid(state.year, state.month, weekStartsOn);

  const selectedKey =
    selectedDate != null
      ? toDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      : null;

  return (
    <div className="w-full select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isCurrentMonth || state.loading}
          aria-label={t("calendar.prevMonth")}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <MaterialIcon name="chevron_left" className="text-xl" />
        </button>

        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
          {MONTHS[state.month]} {state.year}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          disabled={state.loading}
          aria-label={t("calendar.nextMonth")}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <MaterialIcon name="chevron_right" className="text-xl" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          const isCurrentMonthCell = cell.month === state.month;
          const cellDate = new Date(cell.year, cell.month, cell.day);
          cellDate.setHours(0, 0, 0, 0);
          const isPast = cellDate < today;
          const dateKey = toDateKey(cell.year, cell.month, cell.day);
          const hasSlots = state.availableDates.has(dateKey);
          const isDisabled = !isCurrentMonthCell || isPast || (!state.loading && !hasSlots);
          const isSelected = dateKey === selectedKey;
          const isToday =
            cell.day === today.getDate() &&
            cell.month === today.getMonth() &&
            cell.year === today.getFullYear();

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onDateSelect(new Date(cell.year, cell.month, cell.day))}
              className={[
                "relative h-9 w-full rounded-lg text-sm font-medium transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                !isCurrentMonthCell
                  ? "text-gray-300 dark:text-gray-700 cursor-default"
                  : isDisabled
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : isSelected
                  ? "bg-primary text-on-primary shadow"
                  : "text-gray-800 dark:text-gray-100 hover:bg-primary/10 cursor-pointer",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${cell.day} ${MONTHS[cell.month]} ${cell.year}${isSelected ? ` ${t("calendar.selected")}` : ""}${isDisabled && isCurrentMonthCell ? ` ${t("calendar.unavailable")}` : ""}`}
              aria-pressed={isSelected}
            >
              {cell.day}
              {/* Today indicator dot */}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Loading / error feedback */}
      {state.loading && (
        <p className="text-center text-xs text-gray-400 mt-3">{t("calendar.loading")}</p>
      )}
      {state.error && !state.loading && (
        <p className="text-center text-xs text-red-500 mt-3">{state.error}</p>
      )}
    </div>
  );
}
