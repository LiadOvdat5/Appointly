import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Role } from "../constants/roles";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { Alert } from "../components/UI/Alert";
import { Toggle } from "../components/UI/Toggle";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ImpactDialog } from "../components/schedule/ImpactDialog";
import { ScheduleOverridesSection } from "../components/schedule/ScheduleOverridesSection";
import { buildInitialDayStates, validateDayStates, toHHMMSS } from "../components/schedule/scheduleEditorUtils";
import type { DayState, BreakEntry, ImpactInfo, DeleteWindowParams } from "../components/schedule/scheduleEditorTypes";
import {
  getWeeklyRules,
  createWeeklyRule,
  updateWeeklyRule,
  deleteWeeklyRule,
  getBreakRules,
  createBreakRule,
  deleteBreakRule,
  getDateExceptions,
  getRecurringRules,
  generateSlots,
  type DateExceptionDTO,
  type RecurringRuleDTO,
  type GenerateSlotsResult,
} from "../services/availabilityService";
import { getPublicServicesForBusiness } from "../services/businessManagementService";
import {
  getAvailableSlotsForService,
  getBlockedSlotsForService,
  deleteAvailableSlotsInWindow,
  type SlotDTO,
} from "../services/scheduleService";
import {
  getBusinessAppointments,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";

const STAFF_SCHEDULE_EDITOR_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='schedule-day-selector']",
    titleKey: "tutorials.staff-schedule-editor.step1.title",
    bodyKey: "tutorials.staff-schedule-editor.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='schedule-breaks']",
    titleKey: "tutorials.staff-schedule-editor.step2.title",
    bodyKey: "tutorials.staff-schedule-editor.step2.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='schedule-overrides']",
    titleKey: "tutorials.staff-schedule-editor.step3.title",
    bodyKey: "tutorials.staff-schedule-editor.step3.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='schedule-save']",
    titleKey: "tutorials.staff-schedule-editor.step4.title",
    bodyKey: "tutorials.staff-schedule-editor.step4.body",
    placement: "top",
  },
];

const SCHEDULE_EDITOR_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='schedule-day-selector']",
    titleKey: "tutorials.schedule-editor.step1.title",
    bodyKey: "tutorials.schedule-editor.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='schedule-breaks']",
    titleKey: "tutorials.schedule-editor.step2.title",
    bodyKey: "tutorials.schedule-editor.step2.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='schedule-overrides']",
    titleKey: "tutorials.schedule-editor.step3.title",
    bodyKey: "tutorials.schedule-editor.step3.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='schedule-save']",
    titleKey: "tutorials.schedule-editor.step4.title",
    bodyKey: "tutorials.schedule-editor.step4.body",
    placement: "top",
  },
];

export default function ScheduleEditorPage() {
  const { t } = useTranslation();
  const { businessId, serviceId } = useParams<{ businessId: string; serviceId: string }>();
  const navigate = useNavigate();
  const DAY_SHORT = t("calendar.daysShort", { returnObjects: true }) as string[];
  const DAY_FULL = t("calendar.daysFull", { returnObjects: true }) as string[];
  const authUser = useSelector((s: RootState) => s.auth.user);
  const isPartner = authUser?.role === Role.Partner;
  const tutorialKey = isPartner ? "staff-schedule-editor" : "schedule-editor";
  const tutorialSteps = isPartner ? STAFF_SCHEDULE_EDITOR_TUTORIAL_STEPS : SCHEDULE_EDITOR_TUTORIAL_STEPS;
  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial(tutorialKey);

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

  // ── Overrides state (passed down to ScheduleOverridesSection) ────────────
  const [recurringRules, setRecurringRules] = useState<RecurringRuleDTO[]>([]);
  const [dateExceptions, setDateExceptions] = useState<DateExceptionDTO[]>([]);

  // ── Impact analysis state ─────────────────────────────────────────────────
  const originalDayStatesRef = useRef<DayState[]>([]);
  const [upcomingSlots, setUpcomingSlots] = useState<SlotDTO[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<SlotDTO[]>([]);
  const [expandedBlockedSlotId, setExpandedBlockedSlotId] = useState<string | null>(null);
  const [upcomingAppts, setUpcomingAppts] = useState<AppointmentDTO[]>([]);
  const [pendingImpact, setPendingImpact] = useState<ImpactInfo | null>(null);

  // ── Generate slots state ─────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateSlotsResult | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [genStartDate, setGenStartDate] = useState(today);
  const [genEndDate, setGenEndDate] = useState(defaultEnd);

  // ── Load data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!businessId || !serviceId) return;
    try {
      const now = new Date();
      const future90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const [services, rules, breaks, exceptions, recurring, slots, blocked, allAppts] = await Promise.all([
        getPublicServicesForBusiness(businessId),
        getWeeklyRules(serviceId),
        getBreakRules(serviceId),
        getDateExceptions(serviceId),
        getRecurringRules(serviceId),
        getAvailableSlotsForService(serviceId, now, future90),
        getBlockedSlotsForService(serviceId, now, future90).catch(() => [] as SlotDTO[]),
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
      setBlockedSlots(blocked);
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
  }, [businessId, serviceId, t]);

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
    setDayStates((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    clearFeedback();
  }

  function addBreak(dayOfWeek: number) {
    setDayStates((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, breaks: [...d.breaks, { id: null, startTime: "", endTime: "", deleted: false }] }
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
          return { ...d, breaks: d.breaks.map((b, i) => (i === idx ? { ...b, deleted: true } : b)) };
        }
        return { ...d, breaks: d.breaks.filter((_, i) => i !== idx) };
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
        infoMessages.push(t("scheduleEditor.dayAddedAsWorking", { day: DAY_FULL[day.dayOfWeek] }));
      } else if (wasOpen && !shouldBeOpen) {
        deletionPlans.push({ fromDate: now, toDate: future90, dayOfWeek: day.dayOfWeek });
      } else if (wasOpen && shouldBeOpen && orig) {
        if (day.startTime > orig.startTime) {
          deletionPlans.push({ fromDate: now, toDate: future90, dayOfWeek: day.dayOfWeek, startTime: orig.startTime, endTime: day.startTime });
        }
        if (day.endTime < orig.endTime) {
          deletionPlans.push({ fromDate: now, toDate: future90, dayOfWeek: day.dayOfWeek, startTime: day.endTime, endTime: orig.endTime });
        }
        if (day.startTime < orig.startTime || day.endTime > orig.endTime) {
          infoMessages.push(t("scheduleEditor.dayHoursExpanded", { day: DAY_FULL[day.dayOfWeek] }));
        }
      }

      for (const brk of day.breaks) {
        if (!brk.deleted && !brk.id && brk.startTime && brk.endTime) {
          deletionPlans.push({ fromDate: now, toDate: future90, dayOfWeek: day.dayOfWeek, startTime: brk.startTime, endTime: brk.endTime });
        }
        if (brk.deleted && brk.id) {
          infoMessages.push(t("scheduleEditor.breakRemovedFrom", { day: DAY_FULL[day.dayOfWeek] }));
        }
      }
    }

    let freeSlotCount = 0;
    let bookedCount = 0;

    for (const plan of deletionPlans) {
      for (const slot of upcomingSlots) {
        const d = new Date(slot.startDateTime);
        if (d < plan.fromDate || d >= plan.toDate) continue;
        if (plan.dayOfWeek !== undefined) {
          const ourDay = (d.getDay() + 6) % 7;
          if (ourDay !== plan.dayOfWeek) continue;
        }
        if (plan.startTime && plan.endTime) {
          const minutes = d.getHours() * 60 + d.getMinutes();
          const [sh, sm] = plan.startTime.split(":").map(Number);
          const [eh, em] = plan.endTime.split(":").map(Number);
          if (minutes < sh * 60 + sm || minutes >= eh * 60 + em) continue;
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
          const minutes = d.getHours() * 60 + d.getMinutes();
          const [sh, sm] = plan.startTime.split(":").map(Number);
          const [eh, em] = plan.endTime.split(":").map(Number);
          if (minutes < sh * 60 + sm || minutes >= eh * 60 + em) continue;
        }
        bookedCount++;
      }
    }

    return { freeSlotCount, bookedCount, deletionPlans, infoMessages };
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSaveAll() {
    const errors = validateDayStates(dayStates, t, DAY_FULL);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const impact = analyzeImpact();
    if (impact.freeSlotCount > 0 || impact.bookedCount > 0 || impact.infoMessages.length > 0) {
      setPendingImpact(impact);
      return;
    }

    await performSave([]);
  }

  async function performSave(deletionPlans: DeleteWindowParams[]) {
    setPendingImpact(null);
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setValidationErrors([]);

    try {
      for (const plan of deletionPlans) {
        await deleteAvailableSlotsInWindow(serviceId!, plan.fromDate, plan.toDate, plan.dayOfWeek, plan.startTime, plan.endTime);
      }

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
      await loadData();
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
      {tutorialActive && (
        <Tutorial
          tutorialKey={tutorialKey}
          steps={tutorialSteps}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}

      {pendingImpact && (
        <ImpactDialog
          impact={pendingImpact}
          onKeepSlots={() => performSave([])}
          onDeleteFreeSlots={() => performSave(pendingImpact.deletionPlans)}
          onCancel={() => setPendingImpact(null)}
          scheduleUrl={`/business/${businessId}/schedule`}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/${businessId}/services`)}
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

      {/* Day selector */}
      <div data-tutorial="schedule-day-selector" className="flex gap-1.5">
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
              {isConfigured && (
                <span className="text-[9px] leading-tight mt-0.5 opacity-80">{ds.startTime}</span>
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

      {/* Day editor card */}
      <Card className="p-5 flex flex-col gap-5">
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
                    onChange={(e) => updateDay(selectedDay, { startTime: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <input
                    type="time"
                    value={activeDay.endTime}
                    onChange={(e) => updateDay(selectedDay, { endTime: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => updateDay(selectedDay, { hasHours: false, startTime: "", endTime: "", breaks: [] })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                    aria-label={t("scheduleEditor.removeHoursAriaLabel")}
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => updateDay(selectedDay, { hasHours: true, startTime: "", endTime: "" })}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors self-start"
                >
                  <MaterialIcon name="add_circle_outline" className="text-base" />
                  {t("scheduleEditor.addHours")}
                </button>
              )}
            </div>

            {/* Break times */}
            {activeDay.hasHours && (
              <div data-tutorial="schedule-breaks" className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
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
                        onChange={(e) => updateBreak(selectedDay, idx, { startTime: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <span className="text-gray-400 text-sm">—</span>
                      <input
                        type="time"
                        value={brk.endTime}
                        onChange={(e) => updateBreak(selectedDay, idx, { endTime: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
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
          <p className="text-sm text-gray-400 italic">{t("scheduleEditor.markedClosed")}</p>
        )}
      </Card>

      {/* Validation errors */}
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

      {saveSuccess && <Alert variant="success">{t("scheduleEditor.savedSuccess")}</Alert>}
      {saveError && <Alert variant="error">{saveError}</Alert>}

      <Button data-tutorial="schedule-save" variant="primary" onClick={handleSaveAll} disabled={isSaving} isLoading={isSaving}>
        {t("scheduleEditor.saveAll")}
      </Button>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      <div data-tutorial="schedule-overrides">
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
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Generate slots */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#111418] dark:text-white">
            {t("scheduleEditor.generateTitle")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t("scheduleEditor.generateDesc")}</p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">{t("scheduleEditor.from")}</label>
            <input
              type="date"
              value={genStartDate}
              min={today}
              onChange={(e) => { setGenStartDate(e.target.value); setGenerateResult(null); setGenerateError(null); }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-gray-400 pb-2">—</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">{t("scheduleEditor.to")}</label>
            <input
              type="date"
              value={genEndDate}
              min={genStartDate || today}
              onChange={(e) => { setGenEndDate(e.target.value); setGenerateResult(null); setGenerateError(null); }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {generateResult && <Alert variant="success">{generateResult.message}</Alert>}
        {generateError && <Alert variant="error">{generateError}</Alert>}

        <Button
          variant="secondary"
          onClick={handleGenerateSlots}
          disabled={isGenerating || !genStartDate || !genEndDate}
          isLoading={isGenerating}
        >
          {t("scheduleEditor.generateButton")}
        </Button>
      </div>

      {/* Conflict-blocked slots (US-02-G-03) */}
      {blockedSlots.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#111418] dark:text-white flex items-center gap-2">
                <MaterialIcon name="block" className="text-base text-red-500" />
                {t("scheduleEditor.blockedByConflict.title")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{t("scheduleEditor.blockedByConflict.desc")}</p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
              {blockedSlots.map((slot) => {
                const start = new Date(slot.startDateTime);
                const end = new Date(slot.endDateTime);
                const isExpanded = expandedBlockedSlotId === slot.id;
                const dateLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
                const timeLabel = `${start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <div key={slot.id} className="border-b border-red-100 dark:border-red-900 last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpandedBlockedSlotId(isExpanded ? null : slot.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <MaterialIcon name="cancel" className="text-base text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{dateLabel}</p>
                        <p className="text-xs text-red-500">{timeLabel}</p>
                      </div>
                      <MaterialIcon
                        name={isExpanded ? "expand_less" : "expand_more"}
                        className="text-base text-red-400 shrink-0"
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-0">
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5">
                          <MaterialIcon name="info" className="text-red-500 text-sm shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {slot.blockingServiceName
                              ? t("scheduleEditor.blockedByConflict.reason", { serviceName: slot.blockingServiceName })
                              : t("scheduleEditor.blockedByConflict.reasonUnknown")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
