import type { WeeklyRuleDTO, BreakRuleDTO } from "../../services/availabilityService";
import type { DayState } from "./scheduleEditorTypes";

/** "09:00:00" → "09:00" */
export function toHHMM(ts: string): string {
  return ts.slice(0, 5);
}

/** "09:00" → "09:00:00" */
export function toHHMMSS(hhmm: string): string {
  return `${hhmm}:00`;
}

export function buildInitialDayStates(rules: WeeklyRuleDTO[], breaks: BreakRuleDTO[]): DayState[] {
  const states: DayState[] = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    ruleId: null,
    isOpen: false,
    hasHours: false,
    startTime: "",
    endTime: "",
    breaks: [],
  }));

  for (const rule of rules) {
    const d = rule.dayOfWeek;
    if (d < 0 || d > 6) continue;
    states[d] = {
      dayOfWeek: d,
      ruleId: rule.id,
      isOpen: rule.isWorkingDay,
      hasHours: rule.isWorkingDay,
      startTime: rule.isWorkingDay ? toHHMM(rule.startTime) : "",
      endTime: rule.isWorkingDay ? toHHMM(rule.endTime) : "",
      breaks: [],
    };
  }

  for (const brk of breaks) {
    if (brk.dayOfWeek == null || brk.dayOfWeek < 0 || brk.dayOfWeek > 6) continue;
    states[brk.dayOfWeek].breaks.push({
      id: brk.id,
      startTime: toHHMM(brk.startTime),
      endTime: toHHMM(brk.endTime),
      deleted: false,
    });
  }

  return states;
}

export function validateDayStates(
  states: DayState[],
  t: (key: string, opts?: Record<string, unknown>) => string,
  dayFull: string[],
): string[] {
  const errors: string[] = [];

  for (const day of states) {
    if (!day.isOpen || !day.hasHours) continue;

    if (!day.startTime || !day.endTime) {
      errors.push(t("scheduleEditor.dayHoursIncomplete", { day: dayFull[day.dayOfWeek] }));
      continue;
    }
    if (day.startTime >= day.endTime) {
      errors.push(t("scheduleEditor.dayStartBeforeEnd", { day: dayFull[day.dayOfWeek] }));
    }

    for (const brk of day.breaks) {
      if (brk.deleted) continue;
      if (!brk.startTime || !brk.endTime) {
        errors.push(t("scheduleEditor.dayBreakIncomplete", { day: dayFull[day.dayOfWeek] }));
        continue;
      }
      if (brk.startTime >= brk.endTime) {
        errors.push(t("scheduleEditor.dayBreakStartBeforeEnd", { day: dayFull[day.dayOfWeek] }));
      }
      if (brk.startTime < day.startTime || brk.endTime > day.endTime) {
        errors.push(t("scheduleEditor.dayBreakWithinHours", { day: dayFull[day.dayOfWeek] }));
      }
    }
  }

  return errors;
}

/** Count items in a date+day+time window (partial time bounds OK) */
export function countInWindow<T extends { startDateTime: string }>(
  items: T[],
  fromDate: Date,
  toDate: Date,
  days: Set<number>, // 0=Mon…6=Sun
  startTime?: string,
  endTime?: string,
): number {
  return items.filter((item) => {
    const d = new Date(item.startDateTime);
    if (d < fromDate || d > toDate) return false;
    const ourDay = (d.getDay() + 6) % 7;
    if (!days.has(ourDay)) return false;
    const minutes = d.getHours() * 60 + d.getMinutes();
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      if (minutes < h * 60 + m) return false;
    }
    if (endTime) {
      const [h, m] = endTime.split(":").map(Number);
      if (minutes >= h * 60 + m) return false;
    }
    return true;
  }).length;
}
