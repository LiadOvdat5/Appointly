import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../UI/Button";
import { MaterialIcon } from "../UI/MaterialIcon";
import { InfoTooltip } from "../UI/InfoTooltip";
import { BlockedDatesCalendar } from "./BlockedDatesCalendar";
import { BlockDateConfirmDialog } from "./BlockDateConfirmDialog";
import {
  createDateException,
  deleteDateException,
  createRecurringRule,
  deleteRecurringRule,
  type DateExceptionDTO,
  type RecurringRuleDTO,
} from "../../services/availabilityService";
import {
  deleteAvailableSlotsInWindow,
  type SlotDTO,
} from "../../services/scheduleService";
import { type AppointmentDTO } from "../../services/appointmentService";
import { toHHMM, countInWindow } from "./scheduleEditorUtils";
import type { DeleteWindowParams } from "./scheduleEditorTypes";

interface ScheduleOverridesSectionProps {
  serviceId: string;
  businessId: string;
  dateExceptions: DateExceptionDTO[];
  onExceptionsChange: React.Dispatch<React.SetStateAction<DateExceptionDTO[]>>;
  recurringRules: RecurringRuleDTO[];
  onRulesChange: React.Dispatch<React.SetStateAction<RecurringRuleDTO[]>>;
  upcomingSlots: SlotDTO[];
  upcomingAppts: AppointmentDTO[];
}

type RecurringImpact = {
  type: "add" | "remove";
  freeCount: number;
  bookedCount: number;
  deletionPlans: DeleteWindowParams[];
  ruleId?: string;
  pendingCreate?: Parameters<typeof createRecurringRule>[0];
};

type ExcImpact = {
  type: "add" | "remove";
  freeCount: number;
  bookedCount: number;
  deletionPlans: DeleteWindowParams[];
  excId?: string;
  pendingCreate?: Parameters<typeof createDateException>[0];
};

export function ScheduleOverridesSection({
  serviceId,
  businessId,
  dateExceptions,
  onExceptionsChange,
  recurringRules,
  onRulesChange,
  upcomingSlots,
  upcomingAppts,
}: ScheduleOverridesSectionProps) {
  const { t } = useTranslation();
  const DAY_SHORT = t("calendar.daysShort", { returnObjects: true }) as string[];
  const today = new Date().toISOString().slice(0, 10);
  const inputCls =
    "flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";
  const scheduleUrl = `/business/${businessId}/schedule`;

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
  const [recurringImpact, setRecurringImpact] = useState<RecurringImpact | null>(null);
  const [recurringActionLoading, setRecurringActionLoading] = useState(false);

  function parseDays(daysJson: string): number[] {
    try { return JSON.parse(daysJson) as number[]; } catch { return []; }
  }

  function toggleDay(d: number) {
    setNewDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
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

    let freeCount = 0;
    for (const slot of upcomingSlots) {
      const d = new Date(slot.startDateTime);
      if (d < from || d > to) continue;
      const ourDay = (d.getDay() + 6) % 7;
      if (!newDays.has(ourDay)) continue;
      const minutes = d.getHours() * 60 + d.getMinutes();
      const [sh, sm] = newStartTime.split(":").map(Number);
      const [eh, em] = newEndTime.split(":").map(Number);
      if (minutes < sh * 60 + sm || minutes >= eh * 60 + em) freeCount++;
    }
    const bookedCount = countInWindow(upcomingAppts, from, to, newDays);

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
    let freeCount = 0;
    for (const slot of upcomingSlots) {
      const d = new Date(slot.startDateTime);
      if (d.toISOString().slice(0, 10) !== excDate) continue;
      const minutes = d.getHours() * 60 + d.getMinutes();
      const [sh, sm] = excStartTime.split(":").map(Number);
      const [eh, em] = excEndTime.split(":").map(Number);
      if (minutes < sh * 60 + sm || minutes >= eh * 60 + em) freeCount++;
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
        const minutes = d.getHours() * 60 + d.getMinutes();
        const [sh, sm] = st.split(":").map(Number);
        const [eh, em] = et.split(":").map(Number);
        if (minutes < sh * 60 + sm || minutes >= eh * 60 + em) return false;
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
      {/* Block date confirmation dialog */}
      {blockDatePending && (
        <BlockDateConfirmDialog
          dateStr={blockDatePending.dateStr}
          reason={blockDatePending.reason}
          freeCount={blockDatePending.freeCount}
          bookedCount={blockDatePending.bookedCount}
          scheduleUrl={scheduleUrl}
          onConfirm={() => {
            const { dateStr, reason } = blockDatePending;
            setBlockDatePending(null);
            handleToggleDate(dateStr, reason);
          }}
          onCancel={() => setBlockDatePending(null)}
        />
      )}

      {/* Recurring rule impact dialog */}
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
                    <span className="font-semibold">{t("scheduleEditor.freeSlotsRule", { count: recurringImpact.freeCount })}</span>{" "}
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
                    <span className="font-semibold">{t("scheduleEditor.appointmentsPeriod", { count: recurringImpact.bookedCount })}</span>{" "}
                    {t("scheduleEditor.inPeriodNotCanceled")}{" "}
                    <a href={scheduleUrl} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {recurringImpact.freeCount > 0 && (
                <button type="button" disabled={recurringActionLoading}
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
              <button type="button" disabled={recurringActionLoading}
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

      {/* Block date booked-appointment warning banner */}
      {blockDateWarning && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
          <MaterialIcon name="warning" className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t("scheduleEditor.appointmentsBookedOn", { count: blockDateWarning.bookedCount, date: blockDateWarning.date })}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {t("scheduleEditor.slotsHiddenCancelFrom")}{" "}
              <a href={scheduleUrl} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
            </p>
          </div>
          <button type="button" onClick={() => setBlockDateWarning(null)}
            className="p-1 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800 transition shrink-0">
            <MaterialIcon name="close" className="text-base" />
          </button>
        </div>
      )}

      {/* Date exception impact dialog */}
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
                    <a href={scheduleUrl} className="underline font-semibold">{t("scheduleEditor.schedulePage")}</a>.
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

      {/* Tab toggle */}
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

      {/* Blocked Dates */}
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

      {/* Date Exception */}
      {mode === "exception" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111418] dark:text-white">{t("scheduleEditor.dateExceptionTitle")}</h2>
            <InfoTooltip text={t("scheduleEditor.dateExceptionTooltip")} />
          </div>

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

      {/* Recurring Rules */}
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
