import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { Alert } from "../components/UI/Alert";
import { Toggle } from "../components/UI/Toggle";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import {
  getWeeklyRules,
  createWeeklyRule,
  updateWeeklyRule,
  deleteWeeklyRule,
  getBreakRules,
  createBreakRule,
  deleteBreakRule,
  getDateExceptions,
  createDateException,
  deleteDateException,
  getRecurringRules,
  createRecurringRule,
  deleteRecurringRule,
  generateSlots,
  type WeeklyRuleDTO,
  type BreakRuleDTO,
  type DateExceptionDTO,
  type RecurringRuleDTO,
  type GenerateSlotsResult,
} from "../services/availabilityService";
import { getPublicServicesForBusiness } from "../services/businessManagementService";
import {
  getAvailableSlotsForService,
  deleteAvailableSlotsInWindow,
  type SlotDTO,
} from "../services/scheduleService";
import {
  getBusinessAppointments,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";

// ─── Impact analysis types ────────────────────────────────────────────────────

interface DeleteWindowParams {
  fromDate: Date;
  toDate: Date;
  dayOfWeek?: number; // 0=Mon … 6=Sun
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
}

interface ImpactInfo {
  freeSlotCount: number;
  bookedCount: number;
  deletionPlans: DeleteWindowParams[];
  infoMessages: string[];
}

// ─── State types ──────────────────────────────────────────────────────────────

interface BreakEntry {
  id: string | null;   // null = new (not yet saved)
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  deleted: boolean;    // true = pending deletion on next save
}

interface DayState {
  dayOfWeek: number;    // 0 = Monday … 6 = Sunday
  ruleId: string | null;
  isOpen: boolean;
  hasHours: boolean;    // whether a time range has been entered
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  breaks: BreakEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "09:00:00" → "09:00" */
function toHHMM(ts: string): string {
  return ts.slice(0, 5);
}

/** "09:00" → "09:00:00" */
function toHHMMSS(hhmm: string): string {
  return `${hhmm}:00`;
}

function buildInitialDayStates(rules: WeeklyRuleDTO[], breaks: BreakRuleDTO[]): DayState[] {
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

function validateDayStates(
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScheduleEditorPage() {
  const { t } = useTranslation();
  const { businessId, serviceId } = useParams<{ businessId: string; serviceId: string }>();
  const navigate = useNavigate();
  const DAY_SHORT = t("calendar.daysShort", { returnObjects: true }) as string[];
  const DAY_FULL = t("calendar.daysFull", { returnObjects: true }) as string[];

  // ── Page status ──────────────────────────────────────────────────────────
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "error">("loading");
  const [serviceName, setServiceName] = useState("");

  // ── Schedule state ───────────────────────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState(0);
  const [dayStates, setDayStates] = useState<DayState[]>([]);

  // ── Save state ───────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ── Recurring rules state ─────────────────────────────────────────────────
  const [recurringRules, setRecurringRules] = useState<RecurringRuleDTO[]>([]);

  // ── Date exceptions state ────────────────────────────────────────────────
  const [dateExceptions, setDateExceptions] = useState<DateExceptionDTO[]>([]);

  // ── Impact analysis state ─────────────────────────────────────────────────
  /** Snapshot of dayStates as they were when last loaded from the server */
  const originalDayStatesRef = useRef<DayState[]>([]);
  /** Upcoming AVAILABLE slots for this service (next 90 days) — for conflict counting */
  const [upcomingSlots, setUpcomingSlots] = useState<SlotDTO[]>([]);
  /** Upcoming non-canceled appointments for this service (next 90 days) */
  const [upcomingAppts, setUpcomingAppts] = useState<AppointmentDTO[]>([]);
  /** Populated when impact is detected; triggers the impact dialog */
  const [pendingImpact, setPendingImpact] = useState<ImpactInfo | null>(null);

  // ── Generate slots state ─────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateSlotsResult | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [genStartDate, setGenStartDate] = useState(today);
  const [genEndDate, setGenEndDate] = useState(defaultEnd);

  // ── Load data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!businessId || !serviceId) return;
    try {
      const now = new Date();
      const future90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const [services, rules, breaks, exceptions, recurring, slots, allAppts] = await Promise.all([
        getPublicServicesForBusiness(businessId),
        getWeeklyRules(serviceId),
        getBreakRules(serviceId),
        getDateExceptions(serviceId),
        getRecurringRules(serviceId),
        getAvailableSlotsForService(serviceId, now, future90),
        getBusinessAppointments(businessId, 1, 500),
      ]);

      const svc = services.find((s) => s.id === serviceId);
      setServiceName(svc?.name ?? t("scheduleEditor.serviceDefault"));

      const initialDayStates = buildInitialDayStates(rules, breaks);
      originalDayStatesRef.current = initialDayStates;
      setDayStates(initialDayStates);
      setDateExceptions(exceptions);
      setRecurringRules(recurring);
      setUpcomingSlots(slots);
      setUpcomingAppts(
        allAppts.filter(
          (a) =>
            a.serviceId === serviceId &&
            a.status !== AppointmentStatus.Canceled &&
            new Date(a.startDateTime) >= now,
        ),
      );
      setPageStatus("ready");
    } catch {
      setPageStatus("error");
    }
  }, [businessId, serviceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Day state helpers ────────────────────────────────────────────────────

  function clearFeedback() {
    setSaveSuccess(false);
    setSaveError(null);
    setValidationErrors([]);
  }

  function updateDay(dayOfWeek: number, patch: Partial<DayState>) {
    setDayStates((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    );
    clearFeedback();
  }

  function addBreak(dayOfWeek: number) {
    setDayStates((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              breaks: [
                ...d.breaks,
                { id: null, startTime: "", endTime: "", deleted: false },
              ],
            }
          : d,
      ),
    );
    clearFeedback();
  }

  function updateBreak(dayOfWeek: number, idx: number, patch: Partial<BreakEntry>) {
    setDayStates((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, breaks: d.breaks.map((b, i) => (i === idx ? { ...b, ...patch } : b)) }
          : d,
      ),
    );
    clearFeedback();
  }

  function removeBreak(dayOfWeek: number, idx: number) {
    setDayStates((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        const brk = d.breaks[idx];
        if (brk.id) {
          // Existing saved break → mark deleted, remove on next save
          return {
            ...d,
            breaks: d.breaks.map((b, i) => (i === idx ? { ...b, deleted: true } : b)),
          };
        } else {
          // New unsaved break → remove immediately
          return { ...d, breaks: d.breaks.filter((_, i) => i !== idx) };
        }
      }),
    );
    clearFeedback();
  }

  // ── Impact analysis ───────────────────────────────────────────────────────

  function analyzeImpact(): ImpactInfo {
    const original = originalDayStatesRef.current;
    const now = new Date();
    const future90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const deletionPlans: DeleteWindowParams[] = [];
    const infoMessages: string[] = [];

    for (const day of dayStates) {
      const orig = original.find((d) => d.dayOfWeek === day.dayOfWeek);
      const wasOpen = !!(orig?.isOpen && orig.hasHours && orig.startTime && orig.endTime);
      const shouldBeOpen = !!(day.isOpen && day.hasHours && day.startTime && day.endTime);

      if (!wasOpen && shouldBeOpen) {
        // Newly enabled — additive only
        infoMessages.push(
          t("scheduleEditor.dayAddedAsWorking", { day: DAY_FULL[day.dayOfWeek] }),
        );
      } else if (wasOpen && !shouldBeOpen) {
        // Day disabled — remove all future slots on this DOW
        deletionPlans.push({ fromDate: now, toDate: future90, dayOfWeek: day.dayOfWeek });
      } else if (wasOpen && shouldBeOpen && orig) {
        // Hours may have narrowed
        if (day.startTime > orig.startTime) {
          // Start moved later — slots before new start are now outside window
          deletionPlans.push({
            fromDate: now, toDate: future90,
            dayOfWeek: day.dayOfWeek,
            startTime: orig.startTime, endTime: day.startTime,
          });
        }
        if (day.endTime < orig.endTime) {
          // End moved earlier — slots at/after new end are now outside window
          deletionPlans.push({
            fromDate: now, toDate: future90,
            dayOfWeek: day.dayOfWeek,
            startTime: day.endTime, endTime: orig.endTime,
          });
        }
        if (day.startTime < orig.startTime || day.endTime > orig.endTime) {
          // Hours expanded — additive only
          infoMessages.push(
            t("scheduleEditor.dayHoursExpanded", { day: DAY_FULL[day.dayOfWeek] }),
          );
        }
      }

      // New breaks being added
      for (const brk of day.breaks) {
        if (!brk.deleted && !brk.id && brk.startTime && brk.endTime) {
          deletionPlans.push({
            fromDate: now, toDate: future90,
            dayOfWeek: day.dayOfWeek,
            startTime: brk.startTime, endTime: brk.endTime,
          });
        }
        // Breaks being removed — additive, info only
        if (brk.deleted && brk.id) {
          infoMessages.push(
            t("scheduleEditor.breakRemovedFrom", { day: DAY_FULL[day.dayOfWeek] }),
          );
        }
      }
    }

    // Count affected free slots and booked appointments from cached data
    let freeSlotCount = 0;
    let bookedCount = 0;

    // JS getDay → our DOW: (jsDay + 6) % 7  (0=Sun→6=Sun, 1=Mon→0=Mon, …)
    for (const plan of deletionPlans) {
      for (const slot of upcomingSlots) {
        const d = new Date(slot.startDateTime);
        if (d < plan.fromDate || d >= plan.toDate) continue;
        if (plan.dayOfWeek !== undefined) {
          const ourDay = (d.getDay() + 6) % 7;
          if (ourDay !== plan.dayOfWeek) continue;
        }
        if (plan.startTime && plan.endTime) {
          const t = d.getHours() * 60 + d.getMinutes();
          const [sh, sm] = plan.startTime.split(":").map(Number);
          const [eh, em] = plan.endTime.split(":").map(Number);
          if (t < sh * 60 + sm || t >= eh * 60 + em) continue;
        }
        freeSlotCount++;
      }

      for (const appt of upcomingAppts) {
        const d = new Date(appt.startDateTime);
        if (d < plan.fromDate || d >= plan.toDate) continue;
        if (plan.dayOfWeek !== undefined) {
          const ourDay = (d.getDay() + 6) % 7;
          if (ourDay !== plan.dayOfWeek) continue;
        }
        if (plan.startTime && plan.endTime) {
          const t = d.getHours() * 60 + d.getMinutes();
          const [sh, sm] = plan.startTime.split(":").map(Number);
          const [eh, em] = plan.endTime.split(":").map(Number);
          if (t < sh * 60 + sm || t >= eh * 60 + em) continue;
        }
        bookedCount++;
      }
    }

    return { freeSlotCount, bookedCount, deletionPlans, infoMessages };
  }

  // ── Save all ─────────────────────────────────────────────────────────────

  async function handleSaveAll() {
    const errors = validateDayStates(dayStates, t, DAY_FULL);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const impact = analyzeImpact();

    // If there is any destructive impact or info to show, pause and show the dialog
    if (
      impact.freeSlotCount > 0 ||
      impact.bookedCount > 0 ||
      impact.infoMessages.length > 0
    ) {
      setPendingImpact(impact);
      return;
    }

    // No impact — save directly
    await performSave([]);
  }

  async function performSave(deletionPlans: DeleteWindowParams[]) {
    setPendingImpact(null);
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setValidationErrors([]);

    try {
      // Delete free slots first if owner chose to
      for (const plan of deletionPlans) {
        await deleteAvailableSlotsInWindow(
          serviceId!,
          plan.fromDate,
          plan.toDate,
          plan.dayOfWeek,
          plan.startTime,
          plan.endTime,
        );
      }

      // Save weekly rules and breaks
      for (const day of dayStates) {
        const shouldBeOpen = day.isOpen && day.hasHours && day.startTime && day.endTime;

        if (shouldBeOpen) {
          if (day.ruleId) {
            await updateWeeklyRule(day.ruleId, {
              isWorkingDay: true,
              startTime: toHHMMSS(day.startTime),
              endTime: toHHMMSS(day.endTime),
            });
          } else {
            await createWeeklyRule({
              serviceId: serviceId!,
              dayOfWeek: day.dayOfWeek,
              isWorkingDay: true,
              startTime: toHHMMSS(day.startTime),
              endTime: toHHMMSS(day.endTime),
            });
          }
        } else if (!shouldBeOpen && day.ruleId) {
          await deleteWeeklyRule(day.ruleId);
        }

        // Handle breaks
        for (const brk of day.breaks) {
          if (brk.deleted && brk.id) {
            await deleteBreakRule(brk.id);
          } else if (!brk.deleted && !brk.id && brk.startTime && brk.endTime) {
            await createBreakRule({
              serviceId: serviceId!,
              dayOfWeek: day.dayOfWeek,
              startTime: toHHMMSS(brk.startTime),
              endTime: toHHMMSS(brk.endTime),
            });
          }
        }
      }

      setSaveSuccess(true);
      await loadData(); // Refresh to get authoritative IDs from backend
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("common.unknownError");
      setSaveError(t("scheduleEditor.failedSave", { msg }));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Generate slots ────────────────────────────────────────────────────────

  async function handleGenerateSlots() {
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateResult(null);
    try {
      const result = await generateSlots(serviceId!, genStartDate, genEndDate);
      setGenerateResult(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("common.unknownError");
      setGenerateError(t("scheduleEditor.failedGenerate", { msg }));
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (pageStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="error">{t("scheduleEditor.loadError")}</Alert>
      </div>
    );
  }

  const activeDay = dayStates[selectedDay];
  const visibleBreaks = activeDay.breaks.filter((b) => !b.deleted);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* ── Impact dialog ── */}
      {pendingImpact && (
        <ImpactDialog
          impact={pendingImpact}
          onKeepSlots={() => performSave([])}
          onDeleteFreeSlots={() => performSave(pendingImpact.deletionPlans)}
          onCancel={() => setPendingImpact(null)}
          scheduleUrl={`/business/${businessId}/schedule`}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/business/${businessId}`)}
          className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={t("scheduleEditor.backAriaLabel")}
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111418] dark:text-white">
            {t("scheduleEditor.title")}
          </h1>
          <p className="text-sm text-gray-500">{serviceName}</p>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div className="flex gap-1.5">
        {DAY_SHORT.map((label, i) => {
          const ds = dayStates[i];
          const isActive = selectedDay === i;
          const isConfigured = ds.isOpen && ds.hasHours;

          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedDay(i)}
              className={[
                "flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : isConfigured
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700",
              ].join(" ")}
            >
              <span>{label}</span>
              {isConfigured && !isActive && (
                <span className="text-[9px] leading-tight mt-0.5 opacity-75">
                  {ds.startTime}
                </span>
              )}
              {isConfigured && isActive && (
                <span className="text-[9px] leading-tight mt-0.5 opacity-80">
                  {ds.startTime}
                </span>
              )}
              {!isConfigured && (
                <span className="text-[9px] leading-tight mt-0.5 opacity-50">
                  {ds.isOpen ? t("scheduleEditor.noHrs") : t("scheduleEditor.closedShort")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Day editor card ── */}
      <Card className="p-5 flex flex-col gap-5">

        {/* Day header: name + open/closed toggle */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#111418] dark:text-white text-base">
            {DAY_FULL[selectedDay]}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {activeDay.isOpen ? t("scheduleEditor.open") : t("scheduleEditor.closedLabel")}
            </span>
            <Toggle
              checked={activeDay.isOpen}
              onChange={(val) => updateDay(selectedDay, { isOpen: val })}
            />
          </div>
        </div>

        {activeDay.isOpen ? (
          <>
            {/* Working hours */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t("scheduleEditor.workingHoursLabel")}
              </p>

              {activeDay.hasHours ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={activeDay.startTime}
                    onChange={(e) =>
                      updateDay(selectedDay, { startTime: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                      px-3 py-2 text-sm text-[#111418] dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <input
                    type="time"
                    value={activeDay.endTime}
                    onChange={(e) =>
                      updateDay(selectedDay, { endTime: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                      px-3 py-2 text-sm text-[#111418] dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(selectedDay, {
                        hasHours: false,
                        startTime: "",
                        endTime: "",
                        breaks: [],
                      })
                    }
                    className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                    aria-label={t("scheduleEditor.removeHoursAriaLabel")}
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    updateDay(selectedDay, { hasHours: true, startTime: "", endTime: "" })
                  }
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors self-start"
                >
                  <MaterialIcon name="add_circle_outline" className="text-base" />
                  {t("scheduleEditor.addHours")}
                </button>
              )}
            </div>

            {/* Break times — only shown once hours exist */}
            {activeDay.hasHours && (
              <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t("scheduleEditor.breaksLabel")}
                </p>

                {visibleBreaks.length === 0 && (
                  <p className="text-sm text-gray-400 italic">{t("scheduleEditor.noBreaks")}</p>
                )}

                {activeDay.breaks.map((brk, idx) => {
                  if (brk.deleted) return null;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={brk.startTime}
                        onChange={(e) =>
                          updateBreak(selectedDay, idx, { startTime: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                          px-3 py-2 text-sm text-[#111418] dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <span className="text-gray-400 text-sm">—</span>
                      <input
                        type="time"
                        value={brk.endTime}
                        onChange={(e) =>
                          updateBreak(selectedDay, idx, { endTime: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                          px-3 py-2 text-sm text-[#111418] dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="button"
                        onClick={() => removeBreak(selectedDay, idx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                        aria-label={t("scheduleEditor.removeBreakAriaLabel")}
                      >
                        <MaterialIcon name="close" className="text-base" />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => addBreak(selectedDay)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors self-start"
                >
                  <MaterialIcon name="add_circle_outline" className="text-base" />
                  {t("scheduleEditor.addBreak")}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {t("scheduleEditor.markedClosed")}
          </p>
        )}
      </Card>

      {/* ── Validation errors ── */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg p-4 bg-danger/10 border border-danger/20 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-danger flex items-center gap-2">
            <MaterialIcon name="error" className="text-base" />
            {t("scheduleEditor.fixIssues")}
          </p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-sm text-danger/90 ml-6">• {err}</p>
          ))}
        </div>
      )}

      {/* ── Save feedback ── */}
      {saveSuccess && (
        <Alert variant="success">{t("scheduleEditor.savedSuccess")}</Alert>
      )}
      {saveError && (
        <Alert variant="error">{saveError}</Alert>
      )}

      {/* ── Save button ── */}
      <Button
        variant="primary"
        onClick={handleSaveAll}
        disabled={isSaving}
        isLoading={isSaving}
      >
        {t("scheduleEditor.saveAll")}
      </Button>

      {/* ── Divider ── */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* ── Schedule Overrides (Blocked Dates + Recurring Rules) ── */}
      <ScheduleOverridesSection
        serviceId={serviceId!}
        businessId={businessId!}
        dateExceptions={dateExceptions}
        onExceptionsChange={setDateExceptions}
        recurringRules={recurringRules}
        onRulesChange={setRecurringRules}
        upcomingSlots={upcomingSlots}
        upcomingAppts={upcomingAppts}
      />

      {/* ── Divider ── */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* ── Generate slots ── */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#111418] dark:text-white">
            {t("scheduleEditor.generateTitle")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("scheduleEditor.generateDesc")}
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">{t("scheduleEditor.from")}</label>
            <input
              type="date"
              value={genStartDate}
              min={today}
              onChange={(e) => {
                setGenStartDate(e.target.value);
                setGenerateResult(null);
                setGenerateError(null);
              }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                px-3 py-2 text-sm text-[#111418] dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-gray-400 pb-2">—</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">{t("scheduleEditor.to")}</label>
            <input
              type="date"
              value={genEndDate}
              min={genStartDate || today}
              onChange={(e) => {
                setGenEndDate(e.target.value);
                setGenerateResult(null);
                setGenerateError(null);
              }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                px-3 py-2 text-sm text-[#111418] dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {generateResult && (
          <Alert variant="success">{generateResult.message}</Alert>
        )}
        {generateError && (
          <Alert variant="error">{generateError}</Alert>
        )}

        <Button
          variant="secondary"
          onClick={handleGenerateSlots}
          disabled={isGenerating || !genStartDate || !genEndDate}
          isLoading={isGenerating}
        >
          {t("scheduleEditor.generateButton")}
        </Button>
      </div>

    </div>
  );
}

// ─── BlockedDatesCalendar ─────────────────────────────────────────────────────

interface BlockedEntry { dateStr: string; reason: string | null; }

interface BlockedDatesCalendarProps {
  year: number;
  month: number; // 0-indexed
  blockedDates: BlockedEntry[];
  togglingDate: string | null;
  error: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleDate: (dateStr: string, reason?: string) => void; // unblock
  onPrepareBlock: (dateStr: string, reason?: string) => void; // block (with impact check)
}

function BlockedDatesCalendar({
  year, month, blockedDates, togglingDate, error,
  onPrevMonth, onNextMonth, onToggleDate, onPrepareBlock,
}: BlockedDatesCalendarProps) {
  const { t } = useTranslation();
  const monthNames = t("calendar.months", { returnObjects: true }) as string[];
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);

  // Build calendar grid: weeks × 7 days (Mon-first), null = padding
  const firstDayOfMonth = new Date(year, month, 1);
  // getDay() returns 0=Sun…6=Sat; convert to Mon-first (0=Mon…6=Sun)
  const startPad = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const blockedSet = new Set(blockedDates.map((b) => b.dateStr));

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleCellClick(day: number) {
    const ds = dateStr(day);
    if (ds <= todayStr) return; // past dates not allowed
    if (blockedSet.has(ds)) {
      // Unblock immediately
      onToggleDate(ds);
    } else {
      // Ask for reason before blocking
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
      <div>
        <p className="text-sm text-gray-500">
          {t("scheduleEditor.clickToBlock")}
        </p>
      </div>

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

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => (
          <div key={d} className="text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />;
          const ds = dateStr(day);
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
                <span className="text-[8px] leading-none mt-0.5 text-danger/70">{t("scheduleEditor.blockedCellLabel")}</span>
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
                    {b.reason && (
                      <span className="text-xs text-gray-500">{b.reason}</span>
                    )}
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
                onKeyDown={(e) => { if (e.key === "Enter") confirmBlock(); if (e.key === "Escape") setPendingDate(null); }}
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

// ─── ImpactDialog ─────────────────────────────────────────────────────────────

interface ImpactDialogProps {
  impact: ImpactInfo;
  onKeepSlots: () => void;
  onDeleteFreeSlots: () => void;
  onCancel: () => void;
  scheduleUrl: string;
}

function ImpactDialog({
  impact,
  onKeepSlots,
  onDeleteFreeSlots,
  onCancel,
  scheduleUrl,
}: ImpactDialogProps) {
  const { t } = useTranslation();
  const hasDestructive = impact.freeSlotCount > 0 || impact.bookedCount > 0;
  const hasInfoOnly = !hasDestructive && impact.infoMessages.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
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

        {/* Impact rows */}
        <div className="flex flex-col gap-2">

          {/* Free slots to be removed */}
          {impact.freeSlotCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-3 py-2.5">
              <MaterialIcon name="event_busy" className="text-red-500 text-base shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-semibold">{t("scheduleEditor.freeSlots", { count: impact.freeSlotCount })}</span>{" "}
                {t("scheduleEditor.willBeRemovedIfDelete")}
              </p>
            </div>
          )}

          {/* Booked appointments warning */}
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

          {/* Info-only messages (additive changes, break removals) */}
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

        {/* Actions */}
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
            // Info-only — just confirm
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

// ─── InfoTooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center">
      <MaterialIcon
        name="info"
        className="text-sm text-gray-400 hover:text-primary cursor-help transition-colors"
      />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 text-xs bg-gray-900 dark:bg-gray-700 text-white rounded-xl px-3 py-2 z-20 shadow-xl leading-relaxed">
        {text}
      </span>
    </span>
  );
}

// ─── BlockDateConfirmDialog ───────────────────────────────────────────────────

function BlockDateConfirmDialog({
  dateStr,
  reason,
  freeCount,
  bookedCount,
  scheduleUrl,
  onConfirm,
  onCancel,
}: {
  dateStr: string;
  reason?: string;
  freeCount: number;
  bookedCount: number;
  scheduleUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
        {/* Title */}
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

        {/* Impact rows */}
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

        {/* Actions */}
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

// ─── ScheduleOverridesSection ────────────────────────────────────────────────

// Helper: count items in a date+day+time window (partial time bounds OK)
function countInWindow<T extends { startDateTime: string }>(
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
    const t = d.getHours() * 60 + d.getMinutes();
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      if (t < h * 60 + m) return false;
    }
    if (endTime) {
      const [h, m] = endTime.split(":").map(Number);
      if (t >= h * 60 + m) return false;
    }
    return true;
  }).length;
}

function ScheduleOverridesSection({
  serviceId,
  businessId,
  dateExceptions,
  onExceptionsChange,
  recurringRules,
  onRulesChange,
  upcomingSlots,
  upcomingAppts,
}: {
  serviceId: string;
  businessId: string;
  dateExceptions: DateExceptionDTO[];
  onExceptionsChange: React.Dispatch<React.SetStateAction<DateExceptionDTO[]>>;
  recurringRules: RecurringRuleDTO[];
  onRulesChange: React.Dispatch<React.SetStateAction<RecurringRuleDTO[]>>;
  upcomingSlots: SlotDTO[];
  upcomingAppts: AppointmentDTO[];
}) {
  const { t } = useTranslation();
  const DAY_SHORT = t("calendar.daysShort", { returnObjects: true }) as string[];
  const today = new Date().toISOString().slice(0, 10);
  const inputCls =
    "flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

  // ── Tab mode ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"blocked" | "exception" | "recurring">("blocked");

  // ── Blocked Dates state ───────────────────────────────────────────────────
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [exceptionsError, setExceptionsError] = useState<string | null>(null);
  const [blockDateWarning, setBlockDateWarning] = useState<{ date: string; bookedCount: number } | null>(null);
  const [blockDatePending, setBlockDatePending] = useState<{
    dateStr: string; reason?: string; freeCount: number; bookedCount: number;
  } | null>(null);

  async function handleToggleDate(dateStr: string, reason?: string) {
    setTogglingDate(dateStr);
    setExceptionsError(null);
    setBlockDateWarning(null);
    try {
      const existing = dateExceptions.find(
        (e) => e.date.slice(0, 10) === dateStr && !e.isWorkingDay,
      );
      if (existing) {
        await deleteDateException(existing.id);
        onExceptionsChange((prev) => prev.filter((e) => e.id !== existing.id));
      } else {
        const bookedOnDate = upcomingAppts.filter(
          (a) => a.startDateTime.slice(0, 10) === dateStr,
        ).length;
        const created = await createDateException({
          serviceId,
          date: `${dateStr}T00:00:00`,
          isWorkingDay: false,
          reason,
        });
        onExceptionsChange((prev) => [...prev, created]);
        if (bookedOnDate > 0) {
          setBlockDateWarning({ date: dateStr, bookedCount: bookedOnDate });
        }
      }
    } catch {
      setExceptionsError(t("scheduleEditor.failedUpdateBlocked"));
    } finally {
      setTogglingDate(null);
    }
  }

  function handlePrepareBlock(dateStr: string, reason?: string) {
    const freeCount = upcomingSlots.filter(
      (s) => s.startDateTime.slice(0, 10) === dateStr,
    ).length;
    const bookedCount = upcomingAppts.filter(
      (a) => a.startDateTime.slice(0, 10) === dateStr,
    ).length;
    if (freeCount === 0 && bookedCount === 0) {
      handleToggleDate(dateStr, reason);
    } else {
      setBlockDatePending({ dateStr, reason, freeCount, bookedCount });
    }
  }

  // ── Recurring Rules state ─────────────────────────────────────────────────
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDays, setNewDays] = useState<Set<number>>(new Set());
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  type RecurringImpact = {
    type: "add" | "remove";
    freeCount: number;
    bookedCount: number;
    deletionPlans: DeleteWindowParams[];
    ruleId?: string;
    pendingCreate?: Parameters<typeof createRecurringRule>[0];
  };
  const [recurringImpact, setRecurringImpact] = useState<RecurringImpact | null>(null);
  const [recurringActionLoading, setRecurringActionLoading] = useState(false);

  function parseDays(daysJson: string): number[] {
    try { return JSON.parse(daysJson) as number[]; } catch { return []; }
  }

  function toggleDay(d: number) {
    setNewDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function prepareAdd() {
    if (!newStart || !newEnd || newDays.size === 0 || !newStartTime || !newEndTime) {
      setAddFormError(t("scheduleEditor.fillAllFieldsDay"));
      return;
    }
    if (newStart > newEnd) { setAddFormError(t("scheduleEditor.startBeforeEnd")); return; }
    if (newStartTime >= newEndTime) { setAddFormError(t("scheduleEditor.startTimeBeforeEndTime")); return; }
    setAddFormError(null);

    const from = new Date(`${newStart}T00:00:00`);
    const to = new Date(`${newEnd}T23:59:59`);

    // Free slots OUTSIDE the new rule's hours in this date range + days
    let freeCount = 0;
    for (const slot of upcomingSlots) {
      const d = new Date(slot.startDateTime);
      if (d < from || d > to) continue;
      const ourDay = (d.getDay() + 6) % 7;
      if (!newDays.has(ourDay)) continue;
      const t = d.getHours() * 60 + d.getMinutes();
      const [sh, sm] = newStartTime.split(":").map(Number);
      const [eh, em] = newEndTime.split(":").map(Number);
      if (t < sh * 60 + sm || t >= eh * 60 + em) freeCount++;
    }
    const bookedCount = countInWindow(upcomingAppts, from, to, newDays);

    // Build deletion plans: one pair per selected day (before-start and after-end)
    const deletionPlans: DeleteWindowParams[] = [];
    for (const d of newDays) {
      if (newStartTime > "00:00") {
        deletionPlans.push({ fromDate: from, toDate: to, dayOfWeek: d, endTime: newStartTime });
      }
      deletionPlans.push({ fromDate: from, toDate: to, dayOfWeek: d, startTime: newEndTime });
    }

    const pendingCreate: Parameters<typeof createRecurringRule>[0] = {
      serviceId,
      startDate: `${newStart}T00:00:00`,
      endDate: `${newEnd}T23:59:59`,
      daysOfWeek: JSON.stringify(Array.from(newDays).sort()),
      startTime: `${newStartTime}:00`,
      endTime: `${newEndTime}:00`,
    };

    if (freeCount === 0 && bookedCount === 0) {
      doAddRule(pendingCreate, []);
    } else {
      setRecurringImpact({ type: "add", freeCount, bookedCount, deletionPlans, pendingCreate });
    }
  }

  async function doAddRule(dto: Parameters<typeof createRecurringRule>[0], plans: DeleteWindowParams[]) {
    setRecurringActionLoading(true);
    setRecurringImpact(null);
    try {
      for (const plan of plans) {
        await deleteAvailableSlotsInWindow(serviceId, plan.fromDate, plan.toDate, plan.dayOfWeek, plan.startTime, plan.endTime);
      }
      const created = await createRecurringRule(dto);
      onRulesChange((prev) => [...prev, created]);
      setNewStart(""); setNewEnd(""); setNewDays(new Set()); setNewStartTime(""); setNewEndTime("");
    } catch {
      setAddFormError(t("scheduleEditor.failedCreateRule"));
    } finally {
      setRecurringActionLoading(false);
    }
  }

  function prepareDelete(rule: RecurringRuleDTO) {
    const from = new Date(rule.startDate);
    const to = new Date(rule.endDate);
    const days = new Set(parseDays(rule.daysOfWeek));
    const st = toHHMM(rule.startTime);
    const et = toHHMM(rule.endTime);
    const freeCount = countInWindow(upcomingSlots, from, to, days, st, et);
    const bookedCount = countInWindow(upcomingAppts, from, to, days, st, et);
    const deletionPlans: DeleteWindowParams[] = Array.from(days).map((d) => ({
      fromDate: from, toDate: to, dayOfWeek: d, startTime: st, endTime: et,
    }));
    if (freeCount === 0 && bookedCount === 0) {
      doDeleteRule(rule.id, []);
    } else {
      setRecurringImpact({ type: "remove", freeCount, bookedCount, deletionPlans, ruleId: rule.id });
    }
  }

  async function doDeleteRule(ruleId: string, plans: DeleteWindowParams[]) {
    setRecurringActionLoading(true);
    setDeleting(ruleId);
    setRecurringImpact(null);
    try {
      for (const plan of plans) {
        await deleteAvailableSlotsInWindow(serviceId, plan.fromDate, plan.toDate, plan.dayOfWeek, plan.startTime, plan.endTime);
      }
      await deleteRecurringRule(ruleId);
      onRulesChange((prev) => prev.filter((r) => r.id !== ruleId));
    } catch {
      setAddFormError(t("scheduleEditor.failedDeleteRule"));
    } finally {
      setRecurringActionLoading(false);
      setDeleting(null);
    }
  }

  // ── Date Exception state ─────────────────────────────────────────────────
  const [excDate, setExcDate] = useState("");
  const [excStartTime, setExcStartTime] = useState("");
  const [excEndTime, setExcEndTime] = useState("");
  const [excFormError, setExcFormError] = useState<string | null>(null);
  const [excDeleting, setExcDeleting] = useState<string | null>(null);
  const [excActionLoading, setExcActionLoading] = useState(false);

  type ExcImpact = {
    type: "add" | "remove";
    freeCount: number;
    bookedCount: number;
    deletionPlans: DeleteWindowParams[];
    excId?: string;
    pendingCreate?: Parameters<typeof createDateException>[0];
  };
  const [excImpact, setExcImpact] = useState<ExcImpact | null>(null);

  function prepareAddException() {
    if (!excDate || !excStartTime || !excEndTime) {
      setExcFormError(t("scheduleEditor.fillDateAndTime"));
      return;
    }
    if (excStartTime >= excEndTime) {
      setExcFormError(t("scheduleEditor.startTimeBeforeEndTime"));
      return;
    }
    setExcFormError(null);

    const from = new Date(`${excDate}T00:00:00`);
    const to = new Date(`${excDate}T23:59:59`);
    // Free slots on this date OUTSIDE the exception's hours
    let freeCount = 0;
    for (const slot of upcomingSlots) {
      const d = new Date(slot.startDateTime);
      if (d.toISOString().slice(0, 10) !== excDate) continue;
      const t = d.getHours() * 60 + d.getMinutes();
      const [sh, sm] = excStartTime.split(":").map(Number);
      const [eh, em] = excEndTime.split(":").map(Number);
      if (t < sh * 60 + sm || t >= eh * 60 + em) freeCount++;
    }
    const bookedCount = upcomingAppts.filter(
      (a) => a.startDateTime.slice(0, 10) === excDate,
    ).length;
    const deletionPlans: DeleteWindowParams[] = [];
    if (excStartTime > "00:00") deletionPlans.push({ fromDate: from, toDate: to, endTime: excStartTime });
    deletionPlans.push({ fromDate: from, toDate: to, startTime: excEndTime });

    const pendingCreate: Parameters<typeof createDateException>[0] = {
      serviceId,
      date: `${excDate}T00:00:00`,
      isWorkingDay: true,
      startTime: `${excStartTime}:00`,
      endTime: `${excEndTime}:00`,
    };
    if (freeCount === 0 && bookedCount === 0) {
      doAddException(pendingCreate, []);
    } else {
      setExcImpact({ type: "add", freeCount, bookedCount, deletionPlans, pendingCreate });
    }
  }

  async function doAddException(dto: Parameters<typeof createDateException>[0], plans: DeleteWindowParams[]) {
    setExcActionLoading(true);
    setExcImpact(null);
    try {
      for (const plan of plans) {
        await deleteAvailableSlotsInWindow(serviceId, plan.fromDate, plan.toDate, plan.dayOfWeek, plan.startTime, plan.endTime);
      }
      const created = await createDateException(dto);
      onExceptionsChange((prev) => [...prev, created]);
      setExcDate(""); setExcStartTime(""); setExcEndTime("");
    } catch {
      setExcFormError(t("scheduleEditor.failedCreateException"));
    } finally {
      setExcActionLoading(false);
    }
  }

  function prepareRemoveException(exc: DateExceptionDTO) {
    const dateStr = exc.date.slice(0, 10);
    const from = new Date(`${dateStr}T00:00:00`);
    const to = new Date(`${dateStr}T23:59:59`);
    const st = exc.startTime ? toHHMM(exc.startTime) : undefined;
    const et = exc.endTime ? toHHMM(exc.endTime) : undefined;
    const freeCount = upcomingSlots.filter((s) => {
      const d = new Date(s.startDateTime);
      if (d.toISOString().slice(0, 10) !== dateStr) return false;
      if (st && et) {
        const t = d.getHours() * 60 + d.getMinutes();
        const [sh, sm] = st.split(":").map(Number);
        const [eh, em] = et.split(":").map(Number);
        if (t < sh * 60 + sm || t >= eh * 60 + em) return false;
      }
      return true;
    }).length;
    const bookedCount = upcomingAppts.filter((a) => a.startDateTime.slice(0, 10) === dateStr).length;
    const deletionPlans: DeleteWindowParams[] = [{ fromDate: from, toDate: to, startTime: st, endTime: et }];
    if (freeCount === 0 && bookedCount === 0) {
      doRemoveException(exc.id, []);
    } else {
      setExcImpact({ type: "remove", freeCount, bookedCount, deletionPlans, excId: exc.id });
    }
  }

  async function doRemoveException(excId: string, plans: DeleteWindowParams[]) {
    setExcActionLoading(true);
    setExcDeleting(excId);
    setExcImpact(null);
    try {
      for (const plan of plans) {
        await deleteAvailableSlotsInWindow(serviceId, plan.fromDate, plan.toDate, plan.dayOfWeek, plan.startTime, plan.endTime);
      }
      await deleteDateException(excId);
      onExceptionsChange((prev) => prev.filter((e) => e.id !== excId));
    } catch {
      setExcFormError(t("scheduleEditor.failedDeleteException"));
    } finally {
      setExcActionLoading(false);
      setExcDeleting(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* ── Block date impact dialog ── */}
      {blockDatePending && (
        <BlockDateConfirmDialog
          dateStr={blockDatePending.dateStr}
          reason={blockDatePending.reason}
          freeCount={blockDatePending.freeCount}
          bookedCount={blockDatePending.bookedCount}
          scheduleUrl={`/business/${businessId}/schedule`}
          onConfirm={() => {
            const { dateStr, reason } = blockDatePending;
            setBlockDatePending(null);
            handleToggleDate(dateStr, reason);
          }}
          onCancel={() => setBlockDatePending(null)}
        />
      )}

      {/* ── Recurring rule impact dialog ── */}
      {recurringImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setRecurringImpact(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <MaterialIcon name="warning" className="text-xl text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-[#111418] dark:text-white text-base">
                  {recurringImpact.type === "add" ? t("scheduleEditor.addRecurringRuleTitle") : t("scheduleEditor.removeRecurringRuleTitle")}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{t("scheduleEditor.reviewImpact")}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {recurringImpact.freeCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-3 py-2.5">
                  <MaterialIcon name="event_busy" className="text-red-500 text-base shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <span className="font-semibold">
                      {t("scheduleEditor.freeSlotsRule", { count: recurringImpact.freeCount })}
                    </span>{" "}
                    {recurringImpact.type === "add"
                      ? t("scheduleEditor.fallOutsideNewRuleHours", { count: recurringImpact.freeCount })
                      : t("scheduleEditor.existWithinRulePeriod", { count: recurringImpact.freeCount })}
                  </p>
                </div>
              )}
              {recurringImpact.bookedCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2.5">
                  <MaterialIcon name="person_alert" className="text-amber-500 text-base shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">
                      {t("scheduleEditor.appointmentsPeriod", { count: recurringImpact.bookedCount })}
                    </span>{" "}
                    {t("scheduleEditor.inPeriodNotCanceled")}{" "}
                    <a href={`/business/${businessId}/schedule`} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {recurringImpact.freeCount > 0 && (
                <button type="button"
                  disabled={recurringActionLoading}
                  onClick={() => {
                    if (recurringImpact.type === "add" && recurringImpact.pendingCreate) {
                      doAddRule(recurringImpact.pendingCreate, recurringImpact.deletionPlans);
                    } else if (recurringImpact.type === "remove" && recurringImpact.ruleId) {
                      doDeleteRule(recurringImpact.ruleId, recurringImpact.deletionPlans);
                    }
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60">
                  {recurringImpact.type === "add"
                    ? t("scheduleEditor.deleteAndAddRule", { count: recurringImpact.freeCount })
                    : t("scheduleEditor.deleteAndRemoveRule", { count: recurringImpact.freeCount })}
                </button>
              )}
              <button type="button"
                disabled={recurringActionLoading}
                onClick={() => {
                  if (recurringImpact.type === "add" && recurringImpact.pendingCreate) {
                    doAddRule(recurringImpact.pendingCreate, []);
                  } else if (recurringImpact.type === "remove" && recurringImpact.ruleId) {
                    doDeleteRule(recurringImpact.ruleId, []);
                  }
                }}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-60">
                {recurringImpact.freeCount > 0
                  ? (recurringImpact.type === "add" ? t("scheduleEditor.keepSlotsAndAddRule") : t("scheduleEditor.keepSlotsAndRemoveRule"))
                  : (recurringImpact.type === "add" ? t("scheduleEditor.understoodAddRule") : t("scheduleEditor.understoodRemoveRule"))}
              </button>
              <button type="button" onClick={() => setRecurringImpact(null)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                {t("scheduleEditor.goBack")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Block date booked-appointment warning banner ── */}
      {blockDateWarning && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
          <MaterialIcon name="warning" className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t("scheduleEditor.appointmentsBookedOn", { count: blockDateWarning.bookedCount, date: blockDateWarning.date })}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {t("scheduleEditor.slotsHiddenCancelFrom")}{" "}
              <a href={`/business/${businessId}/schedule`} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
            </p>
          </div>
          <button type="button" onClick={() => setBlockDateWarning(null)}
            className="p-1 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800 transition shrink-0">
            <MaterialIcon name="close" className="text-base" />
          </button>
        </div>
      )}

      {/* ── Date exception impact dialog ── */}
      {excImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setExcImpact(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <MaterialIcon name="warning" className="text-xl text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-[#111418] dark:text-white text-base">
                  {excImpact.type === "add" ? t("scheduleEditor.addExceptionTitle") : t("scheduleEditor.removeExceptionTitle")}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{t("scheduleEditor.reviewImpact")}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {excImpact.freeCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-3 py-2.5">
                  <MaterialIcon name="event_busy" className="text-red-500 text-base shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <span className="font-semibold">{t("scheduleEditor.freeSlotsExc", { count: excImpact.freeCount })}</span>{" "}
                    {excImpact.type === "add"
                      ? t("scheduleEditor.fallOutsideExcHours", { count: excImpact.freeCount })
                      : t("scheduleEditor.existWithinExcPeriod", { count: excImpact.freeCount })}
                  </p>
                </div>
              )}
              {excImpact.bookedCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2.5">
                  <MaterialIcon name="person_alert" className="text-amber-500 text-base shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">{t("scheduleEditor.appointmentsExc", { count: excImpact.bookedCount })}</span>{" "}
                    {t("scheduleEditor.bookedNotCanceledCancelFrom")}{" "}
                    <a href={`/business/${businessId}/schedule`} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {excImpact.freeCount > 0 && (
                <button type="button" disabled={excActionLoading}
                  onClick={() => {
                    if (excImpact.type === "add" && excImpact.pendingCreate) doAddException(excImpact.pendingCreate, excImpact.deletionPlans);
                    else if (excImpact.type === "remove" && excImpact.excId) doRemoveException(excImpact.excId, excImpact.deletionPlans);
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60">
                  {excImpact.type === "add"
                    ? t("scheduleEditor.deleteAndAddException", { count: excImpact.freeCount })
                    : t("scheduleEditor.deleteAndRemoveException", { count: excImpact.freeCount })}
                </button>
              )}
              <button type="button" disabled={excActionLoading}
                onClick={() => {
                  if (excImpact.type === "add" && excImpact.pendingCreate) doAddException(excImpact.pendingCreate, []);
                  else if (excImpact.type === "remove" && excImpact.excId) doRemoveException(excImpact.excId, []);
                }}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-60">
                {excImpact.freeCount > 0
                  ? (excImpact.type === "add" ? t("scheduleEditor.keepSlotsAndAddException") : t("scheduleEditor.keepSlotsAndRemoveException"))
                  : (excImpact.type === "add" ? t("scheduleEditor.understoodAddException") : t("scheduleEditor.understoodRemoveException"))}
              </button>
              <button type="button" onClick={() => setExcImpact(null)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                {t("scheduleEditor.goBack")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab toggle (left-aligned, no outer header) ── */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1 self-start">
        {(([
          ["blocked",   "event_busy",    t("scheduleEditor.blockedDatesTab")],
          ["exception", "edit_calendar", t("scheduleEditor.dateExceptionTab")],
          ["recurring", "loop",          t("scheduleEditor.recurringRulesTab")],
        ] as Array<["blocked" | "exception" | "recurring", string, string]>)).map(([key, icon, label]) => (
          <button key={key} type="button" onClick={() => setMode(key)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
              mode === key
                ? "bg-white dark:bg-gray-900 text-[#111418] dark:text-white shadow-sm"
                : "text-gray-500 hover:text-[#111418] dark:hover:text-white",
            ].join(" ")}>
            <MaterialIcon name={icon} className="text-sm leading-none" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Blocked Dates content ── */}
      {mode === "blocked" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111418] dark:text-white">{t("scheduleEditor.blockedDatesTitle")}</h2>
            <InfoTooltip text={t("scheduleEditor.blockedDatesTooltip")} />
          </div>
          <BlockedDatesCalendar
            year={calYear}
            month={calMonth}
            blockedDates={dateExceptions
              .filter((e) => !e.isWorkingDay)
              .map((e) => ({ dateStr: e.date.slice(0, 10), reason: e.reason }))}
            togglingDate={togglingDate}
            error={exceptionsError}
            onPrevMonth={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
              else setCalMonth((m) => m - 1);
            }}
            onNextMonth={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
              else setCalMonth((m) => m + 1);
            }}
            onToggleDate={handleToggleDate}
            onPrepareBlock={handlePrepareBlock}
          />
        </div>
      )}

      {/* ── Date Exception content ── */}
      {mode === "exception" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111418] dark:text-white">{t("scheduleEditor.dateExceptionTitle")}</h2>
            <InfoTooltip text={t("scheduleEditor.dateExceptionTooltip")} />
          </div>

          {/* Existing working-day exceptions */}
          {dateExceptions.filter((e) => e.isWorkingDay).length > 0 ? (
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...dateExceptions.filter((e) => e.isWorkingDay)]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((exc) => (
                    <li key={exc.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-sm font-semibold text-[#111418] dark:text-white">
                          {exc.date.slice(0, 10)}
                        </p>
                        {exc.startTime && exc.endTime && (
                          <p className="text-sm text-[#111418] dark:text-white">
                            {toHHMM(exc.startTime)} – {toHHMM(exc.endTime)}
                          </p>
                        )}
                        {exc.reason && <p className="text-xs text-gray-500">{exc.reason}</p>}
                      </div>
                      <button type="button"
                        disabled={excDeleting === exc.id || excActionLoading}
                        onClick={() => prepareRemoveException(exc)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40 shrink-0">
                        {excDeleting === exc.id ? (
                          <span className="w-4 h-4 rounded-full border-2 border-danger border-t-transparent animate-spin inline-block" />
                        ) : (
                          <MaterialIcon name="delete_outline" className="text-base" />
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">{t("scheduleEditor.noDateExceptions")}</p>
          )}

          {/* Add form */}
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("scheduleEditor.addExceptionHeader")}</p>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.dateLabel")}</label>
              <input type="date" value={excDate} min={today} onChange={(e) => setExcDate(e.target.value)} className={inputCls} />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.startTimeLabel")}</label>
                <input type="time" value={excStartTime} onChange={(e) => setExcStartTime(e.target.value)} className={inputCls} />
              </div>
              <span className="text-gray-400 pb-2">—</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.endTimeLabel")}</label>
                <input type="time" value={excEndTime} onChange={(e) => setExcEndTime(e.target.value)} className={inputCls} />
              </div>
            </div>
            {excFormError && (
              <p className="text-xs text-danger flex items-center gap-1">
                <MaterialIcon name="error" className="text-sm" />{excFormError}
              </p>
            )}
            <Button variant="secondary" onClick={prepareAddException} disabled={excActionLoading} isLoading={excActionLoading}>
              {t("scheduleEditor.addDateExceptionButton")}
            </Button>
          </div>
        </div>
      )}

      {/* ── Recurring Rules content ── */}
      {mode === "recurring" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111418] dark:text-white">{t("scheduleEditor.recurringRulesTitle")}</h2>
            <InfoTooltip text={t("scheduleEditor.recurringRulesTooltip")} />
          </div>

          {recurringRules.length > 0 ? (
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...recurringRules]
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                  .map((rule) => {
                    const days = parseDays(rule.daysOfWeek);
                    return (
                      <li key={rule.id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap gap-1">
                            {days.map((d) => (
                              <span key={d} className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                                {DAY_SHORT[d]}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-[#111418] dark:text-white">
                            {toHHMM(rule.startTime)} – {toHHMM(rule.endTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rule.startDate.slice(0, 10)} → {rule.endDate.slice(0, 10)}
                          </p>
                        </div>
                        <button type="button"
                          disabled={deleting === rule.id || recurringActionLoading}
                          onClick={() => prepareDelete(rule)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40 shrink-0">
                          {deleting === rule.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-danger border-t-transparent animate-spin inline-block" />
                          ) : (
                            <MaterialIcon name="delete_outline" className="text-base" />
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">{t("scheduleEditor.noRecurringRules")}</p>
          )}

          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("scheduleEditor.addRuleHeader")}</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.from")}</label>
                <input type="date" value={newStart} min={today} onChange={(e) => setNewStart(e.target.value)} className={inputCls} />
              </div>
              <span className="text-gray-400 pb-2">—</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.to")}</label>
                <input type="date" value={newEnd} min={newStart || today} onChange={(e) => setNewEnd(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t("scheduleEditor.daysOfWeekLabel")}</label>
              <div className="flex gap-1">
                {DAY_SHORT.map((label, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={["flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      newDays.has(i) ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-primary/10 hover:text-primary"].join(" ")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.startTimeLabel")}</label>
                <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className={inputCls} />
              </div>
              <span className="text-gray-400 pb-2">—</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t("scheduleEditor.endTimeLabel")}</label>
                <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className={inputCls} />
              </div>
            </div>
            {addFormError && (
              <p className="text-xs text-danger flex items-center gap-1">
                <MaterialIcon name="error" className="text-sm" />{addFormError}
              </p>
            )}
            <Button variant="secondary" onClick={prepareAdd} disabled={recurringActionLoading} isLoading={recurringActionLoading}>
              {t("scheduleEditor.addRecurringRuleButton")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
