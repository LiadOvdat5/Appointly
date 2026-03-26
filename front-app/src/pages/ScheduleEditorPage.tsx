import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  generateSlots,
  type WeeklyRuleDTO,
  type BreakRuleDTO,
  type GenerateSlotsResult,
} from "../services/availabilityService";
import { getPublicServicesForBusiness } from "../services/businessManagementService";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

function validateDayStates(states: DayState[]): string[] {
  const errors: string[] = [];

  for (const day of states) {
    if (!day.isOpen || !day.hasHours) continue;

    if (!day.startTime || !day.endTime) {
      errors.push(`${DAY_FULL[day.dayOfWeek]}: Working hours are incomplete.`);
      continue;
    }
    if (day.startTime >= day.endTime) {
      errors.push(`${DAY_FULL[day.dayOfWeek]}: Start time must be before end time.`);
    }

    for (const brk of day.breaks) {
      if (brk.deleted) continue;
      if (!brk.startTime || !brk.endTime) {
        errors.push(`${DAY_FULL[day.dayOfWeek]}: A break has incomplete times.`);
        continue;
      }
      if (brk.startTime >= brk.endTime) {
        errors.push(`${DAY_FULL[day.dayOfWeek]}: Break start must be before its end.`);
      }
      if (brk.startTime < day.startTime || brk.endTime > day.endTime) {
        errors.push(`${DAY_FULL[day.dayOfWeek]}: Break must fall within working hours.`);
      }
    }
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScheduleEditorPage() {
  const { businessId, serviceId } = useParams<{ businessId: string; serviceId: string }>();
  const navigate = useNavigate();

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
      const [services, rules, breaks] = await Promise.all([
        getPublicServicesForBusiness(businessId),
        getWeeklyRules(serviceId),
        getBreakRules(serviceId),
      ]);
      const svc = services.find((s) => s.id === serviceId);
      setServiceName(svc?.name ?? "Service");
      setDayStates(buildInitialDayStates(rules, breaks));
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

  // ── Save all ─────────────────────────────────────────────────────────────

  async function handleSaveAll() {
    const errors = validateDayStates(dayStates);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setValidationErrors([]);

    try {
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
      const msg = e instanceof Error ? e.message : "Unknown error";
      setSaveError(`Failed to save schedule. ${msg}`);
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
      const msg = e instanceof Error ? e.message : "Unknown error";
      setGenerateError(`Failed to generate slots. ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (pageStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="error">Could not load schedule data. Please try again.</Alert>
      </div>
    );
  }

  const activeDay = dayStates[selectedDay];
  const visibleBreaks = activeDay.breaks.filter((b) => !b.deleted);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/business/${businessId}`)}
          className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Back to business page"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111418] dark:text-white">
            Working Hours
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
                  {ds.isOpen ? "no hrs" : "closed"}
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
              {activeDay.isOpen ? "Open" : "Closed"}
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
                Working Hours
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
                    aria-label="Remove hours"
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
                  Add hours
                </button>
              )}
            </div>

            {/* Break times — only shown once hours exist */}
            {activeDay.hasHours && (
              <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Breaks
                </p>

                {visibleBreaks.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No breaks added</p>
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
                        aria-label="Remove break"
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
                  Add break
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Marked as closed — no slots will be generated for this day.
          </p>
        )}
      </Card>

      {/* ── Validation errors ── */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg p-4 bg-danger/10 border border-danger/20 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-danger flex items-center gap-2">
            <MaterialIcon name="error" className="text-base" />
            Please fix the following issues:
          </p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-sm text-danger/90 ml-6">• {err}</p>
          ))}
        </div>
      )}

      {/* ── Save feedback ── */}
      {saveSuccess && (
        <Alert variant="success">Schedule saved successfully.</Alert>
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
        Save All Changes
      </Button>

      {/* ── Divider ── */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* ── Generate slots ── */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#111418] dark:text-white">
            Generate Available Slots
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            After saving your working hours, generate bookable slots for a date range.
            Rule priority: Date Exceptions &gt; Recurring Rules &gt; Weekly Hours, then breaks subtracted.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">From</label>
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
            <label className="block text-xs text-gray-500 mb-1.5">To</label>
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
          Generate Slots
        </Button>
      </div>

    </div>
  );
}
