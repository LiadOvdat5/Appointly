import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  getPublicBusinessBySlug,
} from "../services/businessManagementService";
import type { ServiceProfile, BusinessProfile } from "../types/business";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { ReviewViewModal } from "../components/UI/ReviewViewModal";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";
import { ScheduleListView } from "../components/schedule/ScheduleListView";
import { ScheduleGridView } from "../components/schedule/ScheduleGridView";
import type { MergedSlot, RangePreset } from "../components/schedule/schedulePageTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusinessSchedulePage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId") ?? "";

  // Meta
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<ServiceProfile[]>([]);

  // Derived UUID — only available after business is loaded
  const businessId = business?.id;

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
    if (!slug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const loadBiz = isUUID ? getPublicBusinessById(slug) : getPublicBusinessBySlug(slug);
    loadBiz.then(async (biz) => {
      if (isUUID && biz.slug) {
        navigate(`/business/${biz.slug}/schedule`, { replace: true });
        return;
      }
      const svcs = await getServicesForBusiness(biz.id);
      setBusiness(biz);
      setServices(svcs);
      if (svcs.length > 0 && !preselectedServiceId)
        setGridServiceId(svcs[0].id);
      fetchListAppointments(biz.id, false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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
              onClick={() => navigate(`/business/${business?.slug ?? slug}`)}
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
            <ScheduleListView
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
            <ScheduleGridView
              services={services}
              gridServiceId={gridServiceId}
              gridPreset={gridPreset}
              gridDays={gridDays}
              loading={gridLoading}
              error={gridError}
              expandedSlotKey={expandedSlotKey}
              cancelingId={cancelingId}
              reviewMap={reviewMap}
              onServiceChange={setGridServiceId}
              onPresetChange={setGridPreset}
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
