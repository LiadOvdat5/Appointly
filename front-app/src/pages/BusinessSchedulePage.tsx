import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatTime } from "../utils/formatTime";
import {
  getBusinessAppointments,
  getBusinessAppointmentsByRange,
  cancelAppointment,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import {
  getAvailableSlotsForService,
  type SlotDTO,
} from "../services/scheduleService";
import {
  getServicesForBusiness,
  getPublicBusinessById,
} from "../services/businessManagementService";
import type { ServiceProfile, BusinessProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewViewModal } from "../components/UI/ReviewViewModal";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateHeading(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isoToMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "grid";
type RangePreset = "week" | "next-week" | "month";

interface MergedSlot {
  key: string; // unique key for rendering
  startISO: string;
  endISO: string;
  isBooked: boolean;
  appointment?: AppointmentDTO;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusinessSchedulePage() {
  const { t } = useTranslation();
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId") ?? "";

  // Meta
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<ServiceProfile[]>([]);

  // View toggle
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // ── LIST VIEW state ───────────────────────────────────────────────────────
  const [allAppointments, setAllAppointments] = useState<AppointmentDTO[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const [startDate, setStartDate] = useState(toDateInputValue(today));
  const [endDate, setEndDate] = useState(toDateInputValue(thirtyDaysLater));
  const [isRangeApplied, setIsRangeApplied] = useState(false);
  const [selectedServiceId, setSelectedServiceId] =
    useState<string>(preselectedServiceId);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [showCanceled, setShowCanceled] = useState(false);

  // Cancel flow (shared between views)
  // cancelMode: 'cancel' = standard cancel, 'didnt-happen' = business voids a completed appt
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelMode, setCancelMode] = useState<"cancel" | "didnt-happen">(
    "cancel",
  );
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reviews
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewDTO>>({});
  const [viewingReview, setViewingReview] = useState<ReviewDTO | null>(null);

  // ── GRID VIEW state ───────────────────────────────────────────────────────
  const [gridServiceId, setGridServiceId] =
    useState<string>(preselectedServiceId);
  const [gridPreset, setGridPreset] = useState<RangePreset>("week");
  const [gridSlots, setGridSlots] = useState<SlotDTO[]>([]);
  const [gridAppts, setGridAppts] = useState<AppointmentDTO[]>([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [expandedSlotKey, setExpandedSlotKey] = useState<string | null>(null);

  // Compute grid date range from preset
  const gridRange = useMemo((): [Date, Date] => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (gridPreset === "week") {
      const end = new Date(t);
      end.setDate(t.getDate() + 7);
      return [t, end];
    }
    if (gridPreset === "next-week") {
      const start = new Date(t);
      start.setDate(t.getDate() + 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return [start, end];
    }
    // month
    const end = new Date(t);
    end.setDate(t.getDate() + 30);
    return [t, end];
  }, [gridPreset]);

  // ── Load meta ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    Promise.all([
      getPublicBusinessById(businessId),
      getServicesForBusiness(businessId),
    ]).then(([biz, svcs]) => {
      setBusiness(biz);
      setServices(svcs);
      if (svcs.length > 0 && !preselectedServiceId)
        setGridServiceId(svcs[0].id);
    });

    fetchListAppointments(businessId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // ── Load reviews ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    getBusinessReviews(businessId, 1, 500)
      .then((reviews) => {
        const map: Record<string, ReviewDTO> = {};
        for (const r of reviews) map[r.appointmentId] = r;
        setReviewMap(map);
      })
      .catch(() => {
        /* silently ignore */
      });
  }, [businessId]);

  // ── Load grid data when service/preset/view changes ───────────────────────
  useEffect(() => {
    if (viewMode !== "grid" || !businessId || !gridServiceId) return;
    loadGridData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, businessId, gridServiceId, gridPreset]);

  async function loadGridData() {
    if (!businessId || !gridServiceId) return;
    setGridLoading(true);
    setGridError(null);
    setExpandedSlotKey(null);
    try {
      const [from, to] = gridRange;
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59);

      const [slots, appts] = await Promise.all([
        getAvailableSlotsForService(gridServiceId, from, toEnd),
        getBusinessAppointmentsByRange(businessId, from, toEnd),
      ]);
      setGridSlots(slots);
      setGridAppts(
        appts.filter(
          (a) =>
            a.serviceId === gridServiceId &&
            a.status !== AppointmentStatus.Canceled,
        ),
      );
    } catch {
      setGridError(t("businessSchedule.failedLoadSlots"));
    } finally {
      setGridLoading(false);
    }
  }

  // ── LIST fetching ─────────────────────────────────────────────────────────
  function fetchListAppointments(bizId: string, withRange: boolean) {
    setListLoading(true);
    setListError(null);
    const req = withRange
      ? getBusinessAppointmentsByRange(
          bizId,
          new Date(startDate),
          new Date(endDate + "T23:59:59"),
        )
      : getBusinessAppointments(bizId);
    req
      .then(setAllAppointments)
      .catch(() => setListError(t("businessSchedule.failedLoadAppointments")))
      .finally(() => setListLoading(false));
  }

  function handleApplyDateRange() {
    if (!businessId || !startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    setIsRangeApplied(true);
    fetchListAppointments(businessId, true);
  }

  function handleClearDateRange() {
    if (!businessId) return;
    const t = new Date();
    const ahead = new Date(t);
    ahead.setDate(t.getDate() + 30);
    setStartDate(toDateInputValue(t));
    setEndDate(toDateInputValue(ahead));
    setIsRangeApplied(false);
    fetchListAppointments(businessId, false);
  }

  // ── List filtering ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allAppointments;
    if (!showCanceled)
      list = list.filter(
        (a) =>
          a.status !== AppointmentStatus.Canceled ||
          a.notes?.includes("Service did not take place"),
      );
    if (selectedServiceId)
      list = list.filter((a) => a.serviceId === selectedServiceId);
    if (timeFrom) {
      const fromMin = timeToMinutes(timeFrom);
      list = list.filter((a) => isoToMinutes(a.startDateTime) >= fromMin);
    }
    if (timeTo) {
      const toMin = timeToMinutes(timeTo);
      list = list.filter((a) => isoToMinutes(a.startDateTime) <= toMin);
    }
    return [...list].sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );
  }, [allAppointments, showCanceled, selectedServiceId, timeFrom, timeTo]);

  // ── Grid merge: available slots + booked appointments, grouped by day ─────
  const gridDays = useMemo(() => {
    // Build a map from date string → merged slots
    const byDay = new Map<string, MergedSlot[]>();

    // Available slots
    for (const slot of gridSlots) {
      const key = dateKey(slot.startDateTime);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push({
        key: `avail-${slot.id}`,
        startISO: slot.startDateTime,
        endISO: slot.endDateTime,
        isBooked: false,
      });
    }

    // Booked appointments — create pseudo-slots
    for (const appt of gridAppts) {
      const key = dateKey(appt.startDateTime);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push({
        key: `booked-${appt.id}`,
        startISO: appt.startDateTime,
        endISO: appt.endDateTime,
        isBooked: true,
        appointment: appt,
      });
    }

    // Sort each day's slots by time, then sort days
    const days = Array.from(byDay.entries())
      .map(([dateStr, slots]) => ({
        dateStr,
        date: new Date(dateStr),
        slots: slots.sort(
          (a, b) =>
            new Date(a.startISO).getTime() - new Date(b.startISO).getTime(),
        ),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return days;
  }, [gridSlots, gridAppts]);

  // ── Cancel helpers ────────────────────────────────────────────────────────
  function requestCancel(id: string) {
    setCancelMode("cancel");
    setConfirmCancelId(id);
  }

  function requestDidntHappen(id: string) {
    setCancelMode("didnt-happen");
    setConfirmCancelId(id);
  }

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    const id = confirmCancelId;
    const reason =
      cancelMode === "didnt-happen" ? "Service did not take place" : undefined;
    setConfirmCancelId(null);
    setCancelingId(id);
    setCancelError(null);
    try {
      await cancelAppointment(id, reason);
      setAllAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: AppointmentStatus.Canceled } : a,
        ),
      );
      setGridAppts((prev) => prev.filter((a) => a.id !== id));
      setExpandedSlotKey(null);
    } catch {
      setCancelError(t("businessSchedule.failedVoid"));
    } finally {
      setCancelingId(null);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <ConfirmDialog
        open={confirmCancelId !== null}
        title={
          cancelMode === "didnt-happen"
            ? t("businessSchedule.markDidntHappenTitle")
            : t("businessSchedule.cancelTitle")
        }
        message={
          cancelMode === "didnt-happen"
            ? t("businessSchedule.markDidntHappenMsg")
            : t("businessSchedule.cancelMsg")
        }
        confirmLabel={
          cancelMode === "didnt-happen" ? t("businessSchedule.yesVoidIt") : t("businessSchedule.yesCancelIt")
        }
        cancelLabel={t("businessSchedule.keepIt")}
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelId(null)}
      />
      {viewingReview && (
        <ReviewViewModal
          open
          review={viewingReview}
          onClose={() => setViewingReview(null)}
        />
      )}
      {cancelError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 shadow-lg">
          <MaterialIcon
            name="error_outline"
            className="text-red-500 shrink-0"
          />
          <p className="text-sm text-red-600 dark:text-red-400">
            {cancelError}
          </p>
          <button
            type="button"
            onClick={() => setCancelError(null)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            <MaterialIcon name="close" className="text-base" />
          </button>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        {/* ── Header ── */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label={t("common.back")}
            >
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-[#111418] dark:text-white text-base truncate">
                {business?.name ?? t("business.title")} — {t("businessSchedule.scheduleLabel")}
              </h1>
              <p className="text-xs text-gray-500">{t("businessSchedule.appointmentsSlots")}</p>
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                ].join(" ")}
              >
                <MaterialIcon name="view_list" className="text-sm" />
                {t("businessSchedule.listView")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                ].join(" ")}
              >
                <MaterialIcon name="grid_view" className="text-sm" />
                {t("businessSchedule.slotsView")}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/business/${businessId}`)}
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              {t("businessSchedule.viewPage")}
              <MaterialIcon name="open_in_new" className="text-xs" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {viewMode === "list" ? (
            <ListView
              services={services}
              filtered={filtered}
              loading={listLoading}
              error={listError}
              startDate={startDate}
              endDate={endDate}
              isRangeApplied={isRangeApplied}
              selectedServiceId={selectedServiceId}
              timeFrom={timeFrom}
              timeTo={timeTo}
              showCanceled={showCanceled}
              cancelingId={cancelingId}
              reviewMap={reviewMap}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApplyRange={handleApplyDateRange}
              onClearRange={handleClearDateRange}
              onServiceChange={setSelectedServiceId}
              onTimeFromChange={setTimeFrom}
              onTimeToChange={setTimeTo}
              onShowCanceledChange={setShowCanceled}
              onRequestCancel={requestCancel}
              onRequestDidntHappen={requestDidntHappen}
              onViewReview={setViewingReview}
            />
          ) : (
            <GridView
              services={services}
              gridServiceId={gridServiceId}
              gridPreset={gridPreset}
              gridDays={gridDays}
              loading={gridLoading}
              error={gridError}
              expandedSlotKey={expandedSlotKey}
              cancelingId={cancelingId}
              reviewMap={reviewMap}
              onServiceChange={(id) => {
                setGridServiceId(id);
              }}
              onPresetChange={(p) => {
                setGridPreset(p);
              }}
              onRefresh={loadGridData}
              onToggleExpand={(key) =>
                setExpandedSlotKey((prev) => (prev === key ? null : key))
              }
              onRequestCancel={requestCancel}
              onRequestDidntHappen={requestDidntHappen}
              onViewReview={setViewingReview}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({
  services,
  filtered,
  loading,
  error,
  startDate,
  endDate,
  isRangeApplied,
  selectedServiceId,
  timeFrom,
  timeTo,
  showCanceled,
  cancelingId,
  reviewMap,
  onStartDateChange,
  onEndDateChange,
  onApplyRange,
  onClearRange,
  onServiceChange,
  onTimeFromChange,
  onTimeToChange,
  onShowCanceledChange,
  onRequestCancel,
  onRequestDidntHappen,
  onViewReview,
}: {
  services: ServiceProfile[];
  filtered: AppointmentDTO[];
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  isRangeApplied: boolean;
  selectedServiceId: string;
  timeFrom: string;
  timeTo: string;
  showCanceled: boolean;
  cancelingId: string | null;
  reviewMap: Record<string, ReviewDTO>;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onApplyRange: () => void;
  onClearRange: () => void;
  onServiceChange: (v: string) => void;
  onTimeFromChange: (v: string) => void;
  onTimeToChange: (v: string) => void;
  onShowCanceledChange: (v: boolean) => void;
  onRequestCancel: (id: string) => void;
  onRequestDidntHappen: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      {/* Filter panel */}
      <Card className="p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t("businessSchedule.filters")}
        </p>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">{t("businessSchedule.dateRange")}</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-32">
              <label className="block text-[11px] text-gray-400 mb-1">
                {t("businessSchedule.from")}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-32">
              <label className="block text-[11px] text-gray-400 mb-1">{t("businessSchedule.to")}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="primary" onClick={onApplyRange}>
                {t("businessSchedule.apply")}
              </Button>
              {isRangeApplied && (
                <Button variant="ghost" onClick={onClearRange}>
                  {t("businessSchedule.clear")}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-40">
            <label className="block text-[11px] text-gray-400 mb-1">
              {t("businessSchedule.service")}
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => onServiceChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{t("businessSchedule.allServices")}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-28">
            <label className="block text-[11px] text-gray-400 mb-1">
              {t("businessSchedule.timeFrom")}
            </label>
            <Input
              type="time"
              value={timeFrom}
              onChange={(e) => onTimeFromChange(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-28">
            <label className="block text-[11px] text-gray-400 mb-1">
              {t("businessSchedule.timeTo")}
            </label>
            <Input
              type="time"
              value={timeTo}
              onChange={(e) => onTimeToChange(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showCanceled}
            onChange={(e) => onShowCanceledChange(e.target.checked)}
            className="rounded accent-primary"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {t("businessSchedule.includeCanceled")}
          </span>
        </label>
      </Card>

      {!loading && !error && (
        <p className="text-xs text-gray-500 px-1">
          {filtered.length === 0
            ? t("businessSchedule.noAppointmentsFound")
            : t("businessSchedule.appointmentCount", { count: filtered.length })}
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <MaterialIcon
            name="error_outline"
            className="text-red-500 shrink-0"
          />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MaterialIcon
              name="event_busy"
              className="text-2xl text-gray-400"
            />
          </div>
          <p className="font-semibold text-[#111418] dark:text-white text-sm">
            {t("businessSchedule.noAppointments")}
          </p>
          <p className="text-xs text-gray-500">
            {t("businessSchedule.tryAdjusting")}
          </p>
        </div>
      )}

      {!loading &&
        filtered.map((appt) => {
          const review = reviewMap[appt.id];
          const isCompleted = appt.status === AppointmentStatus.Completed;
          const isVoided =
            appt.status === AppointmentStatus.Canceled &&
            appt.notes?.includes("Service did not take place");
          return (
            <Card key={appt.id} className="p-4 space-y-3">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">
                    {appt.clientName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {appt.serviceName} · {appt.partnerName}
                  </p>
                </div>
                <StatusBadge status={appt.status} />
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MaterialIcon
                    name="calendar_today"
                    className="text-sm leading-none"
                  />
                  {formatDate(appt.startDateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon
                    name="schedule"
                    className="text-sm leading-none"
                  />
                  {formatTime(appt.startDateTime)} –{" "}
                  {formatTime(appt.endDateTime)}
                </span>
                {appt.servicePrice != null && (
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <MaterialIcon
                      name="payments"
                      className="text-sm leading-none"
                    />
                    ${appt.servicePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Review row — completed only */}
              {isCompleted && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                  {review ? (
                    <button
                      type="button"
                      onClick={() => onViewReview(review)}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors w-full"
                    >
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <MaterialIcon
                            key={s}
                            name={review.rating >= s ? "star" : "star_border"}
                            className={`text-sm ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium truncate">
                        {review.comment
                          ? `"${review.comment.slice(0, 50)}${review.comment.length > 50 ? "…" : ""}"`
                          : t("businessSchedule.viewReview")}
                      </span>
                      <MaterialIcon
                        name="open_in_new"
                        className="text-xs ml-auto shrink-0"
                      />
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MaterialIcon name="rate_review" className="text-sm" />
                      {t("businessSchedule.noReviewLeft")}
                    </p>
                  )}
                </div>
              )}

              {/* Voided indicator */}
              {isVoided && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                  <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                    <MaterialIcon name="block" className="text-sm" />
                    {t("businessSchedule.markedNotCompleted")}
                  </p>
                </div>
              )}

              {/* Footer: code + action */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-mono text-gray-400">
                  #{appt.confirmationCode}
                </span>
                {appt.status === AppointmentStatus.Scheduled && (
                  <button
                    type="button"
                    onClick={() => onRequestCancel(appt.id)}
                    disabled={cancelingId === appt.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {cancelingId === appt.id ? t("businessSchedule.canceling") : t("businessSchedule.cancel")}
                  </button>
                )}
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => onRequestDidntHappen(appt.id)}
                    disabled={cancelingId === appt.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {cancelingId === appt.id ? t("businessSchedule.voiding") : t("businessSchedule.didntHappen")}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
    </div>
  );
}

// ─── GridView ─────────────────────────────────────────────────────────────────

function GridView({
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
}: {
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
}) {
  const { t } = useTranslation();
  const totalBooked = gridDays.reduce(
    (s, d) => s + d.slots.filter((sl) => sl.isBooked).length,
    0,
  );
  const totalFree = gridDays.reduce(
    (s, d) => s + d.slots.filter((sl) => !sl.isBooked).length,
    0,
  );

  const presets: { value: RangePreset; label: string }[] = [
    { value: "week", label: t("businessSchedule.thisWeek") },
    { value: "next-week", label: t("businessSchedule.nextWeek") },
    { value: "month", label: t("businessSchedule.next30Days") },
  ];

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Service selector */}
        <div className="flex-1 min-w-48">
          <select
            value={gridServiceId}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {services.length === 0 && <option value="">{t("businessSchedule.noServices")}</option>}
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Range preset pills */}
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

        {/* Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary transition-colors"
          title={t("businessSchedule.refresh")}
        >
          <MaterialIcon name="refresh" className="text-base" />
        </button>
      </div>

      {/* Summary row */}
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <MaterialIcon
            name="error_outline"
            className="text-red-500 shrink-0"
          />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* No service */}
      {!loading && !error && services.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MaterialIcon name="content_cut" className="text-3xl text-gray-400" />
          <p className="text-sm text-gray-500">{t("businessSchedule.noServicesConfigured")}</p>
        </div>
      )}

      {/* Empty days */}
      {!loading && !error && services.length > 0 && gridDays.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MaterialIcon
              name="calendar_today"
              className="text-2xl text-gray-400"
            />
          </div>
          <p className="font-semibold text-[#111418] dark:text-white text-sm">
            {t("businessSchedule.noSlotsInRange")}
          </p>
          <p className="text-xs text-gray-500">
            {t("businessSchedule.generateSlotsHint")}
          </p>
        </div>
      )}

      {/* Day sections */}
      {!loading &&
        !error &&
        gridDays.map((day) => {
          const bookedCount = day.slots.filter((s) => s.isBooked).length;
          const freeCount = day.slots.filter((s) => !s.isBooked).length;

          return (
            <div key={day.dateStr} className="space-y-2">
              {/* Day header */}
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
                  {freeCount > 0 && (
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                  )}
                  {freeCount > 0 && <span>{t("businessSchedule.freeCount", { count: freeCount })}</span>}
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Slot chips grid */}
              <div className="flex flex-wrap gap-2">
                {day.slots.map((slot) => (
                  <SlotChip
                    key={slot.key}
                    slot={slot}
                    isExpanded={expandedSlotKey === slot.key}
                    cancelingId={cancelingId}
                    review={
                      slot.appointment
                        ? reviewMap[slot.appointment.id]
                        : undefined
                    }
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

// ─── SlotChip ─────────────────────────────────────────────────────────────────

function SlotChip({
  slot,
  isExpanded,
  cancelingId,
  review,
  onToggle,
  onRequestCancel,
  onRequestDidntHappen,
  onViewReview,
}: {
  slot: MergedSlot;
  isExpanded: boolean;
  cancelingId: string | null;
  review?: ReviewDTO;
  onToggle: () => void;
  onRequestCancel: (id: string) => void;
  onRequestDidntHappen: (id: string) => void;
  onViewReview: (r: ReviewDTO) => void;
}) {
  const { t } = useTranslation();
  const time = formatTime(slot.startISO);
  const appt = slot.appointment;

  if (!slot.isBooked) {
    // Available slot — non-interactive chip
    return (
      <div className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 font-medium select-none">
        {time}
      </div>
    );
  }

  // Booked slot chip + optional expanded detail
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all",
          isExpanded
            ? "bg-primary text-white border-primary shadow-md"
            : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
        ].join(" ")}
      >
        <MaterialIcon name="person" className="text-xs leading-none" />
        {time}
        {appt && (
          <span className="max-w-20 truncate opacity-80">
            {appt.clientName.split(" ")[0]}
          </span>
        )}
        <MaterialIcon
          name={isExpanded ? "expand_less" : "expand_more"}
          className="text-xs leading-none opacity-70"
        />
      </button>

      {/* Expanded appointment detail */}
      {isExpanded && appt && (
        <div className="mt-2 w-72 rounded-xl border border-primary/20 bg-white dark:bg-gray-900 shadow-lg p-4 space-y-3 z-10">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                {appt.clientName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {appt.serviceName}
              </p>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <MaterialIcon name="schedule" className="text-sm leading-none" />
              {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
            </span>
            {appt.clientEmail && (
              <span className="flex items-center gap-1.5">
                <MaterialIcon name="mail" className="text-sm leading-none" />
                {appt.clientEmail}
              </span>
            )}
            {appt.servicePrice != null && (
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <MaterialIcon
                  name="payments"
                  className="text-sm leading-none"
                />
                ${appt.servicePrice.toFixed(2)}
              </span>
            )}
            {appt.notes && (
              <span className="flex items-start gap-1.5">
                <MaterialIcon
                  name="notes"
                  className="text-sm leading-none mt-0.5"
                />
                <span className="italic">{appt.notes}</span>
              </span>
            )}
          </div>

          {/* Voided indicator */}
          {appt.status === AppointmentStatus.Canceled &&
            appt.notes?.includes("Service did not take place") && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                  <MaterialIcon name="block" className="text-sm" />
                  {t("businessSchedule.markedNotCompleted")}
                </p>
              </div>
            )}

          {/* Review row — completed only */}
          {appt.status === AppointmentStatus.Completed && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
              {review ? (
                <button
                  type="button"
                  onClick={() => onViewReview(review)}
                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors w-full"
                >
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialIcon
                        key={s}
                        name={review.rating >= s ? "star" : "star_border"}
                        className={`text-sm ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium truncate">
                    {review.comment
                      ? `"${review.comment.slice(0, 35)}${review.comment.length > 35 ? "…" : ""}"`
                      : t("businessSchedule.viewReview")}
                  </span>
                  <MaterialIcon
                    name="open_in_new"
                    className="text-xs ml-auto shrink-0"
                  />
                </button>
              ) : (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MaterialIcon name="rate_review" className="text-sm" />
                  {t("businessSchedule.noReviewLeft")}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-mono text-gray-400">
              #{appt.confirmationCode}
            </span>
            {appt.status === AppointmentStatus.Scheduled && (
              <button
                type="button"
                onClick={() => onRequestCancel(appt.id)}
                disabled={cancelingId === appt.id}
                className="text-xs text-red-500 hover:underline disabled:opacity-50 font-semibold"
              >
                {cancelingId === appt.id ? t("businessSchedule.canceling") : t("businessSchedule.cancelAppointment")}
              </button>
            )}
            {appt.status === AppointmentStatus.Completed && (
              <button
                type="button"
                onClick={() => onRequestDidntHappen(appt.id)}
                disabled={cancelingId === appt.id}
                className="text-xs text-red-500 hover:underline disabled:opacity-50 font-semibold"
              >
                {cancelingId === appt.id ? t("businessSchedule.voiding") : t("businessSchedule.didntHappen")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: number }) {
  const { t } = useTranslation();
  if (status === AppointmentStatus.Canceled)
    return <Badge variant="cancelled">{t("businessSchedule.canceled")}</Badge>;
  if (status === AppointmentStatus.Completed)
    return <Badge variant="confirmed">{t("businessSchedule.completed")}</Badge>;
  return <Badge variant="active">{t("businessSchedule.scheduled")}</Badge>;
}
