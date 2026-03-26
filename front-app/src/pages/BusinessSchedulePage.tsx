import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBusinessAppointments,
  getBusinessAppointmentsByRange,
  cancelAppointment,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { getServicesForBusiness } from "../services/businessManagementService";
import { getPublicBusinessById } from "../services/businessManagementService";
import type { ServiceProfile, BusinessProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "HH:mm" → minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** ISO datetime → minutes since midnight */
function isoToMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusinessSchedulePage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

  // Meta
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<ServiceProfile[]>([]);

  // All appointments from API
  const [allAppointments, setAllAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range filter
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const [startDate, setStartDate] = useState(toDateInputValue(today));
  const [endDate, setEndDate] = useState(toDateInputValue(thirtyDaysLater));
  const [isRangeApplied, setIsRangeApplied] = useState(false);

  // Service filter (empty = all)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Time filter
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  // Show canceled toggle
  const [showCanceled, setShowCanceled] = useState(false);

  // Cancel flow
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // ── Load meta + initial appointments ────────────────────────────────────────
  useEffect(() => {
    if (!businessId) return;

    Promise.all([
      getPublicBusinessById(businessId),
      getServicesForBusiness(businessId),
    ]).then(([biz, svcs]) => {
      setBusiness(biz);
      setServices(svcs);
    });

    fetchAppointments(businessId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  function fetchAppointments(bizId: string, withRange: boolean) {
    setLoading(true);
    setError(null);

    const req = withRange
      ? getBusinessAppointmentsByRange(
          bizId,
          new Date(startDate),
          new Date(endDate + "T23:59:59"),
        )
      : getBusinessAppointments(bizId);

    req
      .then(setAllAppointments)
      .catch(() => setError("Failed to load appointments."))
      .finally(() => setLoading(false));
  }

  function handleApplyDateRange() {
    if (!businessId || !startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    setIsRangeApplied(true);
    fetchAppointments(businessId, true);
  }

  function handleClearDateRange() {
    if (!businessId) return;
    const t = new Date();
    const ahead = new Date(t);
    ahead.setDate(t.getDate() + 30);
    setStartDate(toDateInputValue(t));
    setEndDate(toDateInputValue(ahead));
    setIsRangeApplied(false);
    fetchAppointments(businessId, false);
  }

  // ── Client-side filtering ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allAppointments;

    // Exclude canceled unless toggled
    if (!showCanceled) {
      list = list.filter((a) => a.status !== AppointmentStatus.Canceled);
    }

    // Service filter
    if (selectedServiceId) {
      list = list.filter((a) => a.serviceId === selectedServiceId);
    }

    // Time filter
    if (timeFrom) {
      const fromMin = timeToMinutes(timeFrom);
      list = list.filter((a) => isoToMinutes(a.startDateTime) >= fromMin);
    }
    if (timeTo) {
      const toMin = timeToMinutes(timeTo);
      list = list.filter((a) => isoToMinutes(a.startDateTime) <= toMin);
    }

    // Sort ascending
    return [...list].sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );
  }, [allAppointments, showCanceled, selectedServiceId, timeFrom, timeTo]);

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    const id = confirmCancelId;
    setConfirmCancelId(null);
    setCancelingId(id);
    try {
      await cancelAppointment(id);
      setAllAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: AppointmentStatus.Canceled } : a,
        ),
      );
    } catch {
      // silently ignore
    } finally {
      setCancelingId(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
    <ConfirmDialog
      open={confirmCancelId !== null}
      title="Cancel appointment?"
      message="Are you sure you want to cancel this appointment? This action cannot be undone."
      confirmLabel="Yes, cancel it"
      cancelLabel="Keep it"
      destructive
      onConfirm={handleConfirmCancel}
      onCancel={() => setConfirmCancelId(null)}
    />
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Back"
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[#111418] dark:text-white text-base truncate">
            {business?.name ?? "Business"} — Schedule
          </h1>
          <p className="text-xs text-gray-500">All appointments</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/business/${businessId}`)}
          className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          View page
          <MaterialIcon name="open_in_new" className="text-xs" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ── Filter panel ─────────────────────────────────────────────── */}
        <Card className="p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Filters
          </p>

          {/* Date range */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Date range</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-32">
                <label className="block text-[11px] text-gray-400 mb-1">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-32">
                <label className="block text-[11px] text-gray-400 mb-1">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="primary" onClick={handleApplyDateRange}>
                  Apply
                </Button>
                {isRangeApplied && (
                  <Button variant="ghost" onClick={handleClearDateRange}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Service + Time row */}
          <div className="flex flex-wrap gap-3">
            {/* Service filter */}
            <div className="flex-1 min-w-40">
              <label className="block text-[11px] text-gray-400 mb-1">Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time from */}
            <div className="flex-1 min-w-28">
              <label className="block text-[11px] text-gray-400 mb-1">
                Time from
              </label>
              <Input
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
              />
            </div>

            {/* Time to */}
            <div className="flex-1 min-w-28">
              <label className="block text-[11px] text-gray-400 mb-1">
                Time to
              </label>
              <Input
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
              />
            </div>
          </div>

          {/* Show canceled toggle */}
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={showCanceled}
              onChange={(e) => setShowCanceled(e.target.checked)}
              className="rounded accent-primary"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Include canceled appointments
            </span>
          </label>
        </Card>

        {/* ── Result count ──────────────────────────────────────────────── */}
        {!loading && !error && (
          <p className="text-xs text-gray-500 px-1">
            {filtered.length === 0
              ? "No appointments found"
              : `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`}
          </p>
        )}

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-12">
            <span className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="event_busy" className="text-2xl text-gray-400" />
            </div>
            <p className="font-semibold text-[#111418] dark:text-white text-sm">
              No appointments
            </p>
            <p className="text-xs text-gray-500">
              Try adjusting your filters or expanding the date range.
            </p>
          </div>
        )}

        {/* ── Appointment list ──────────────────────────────────────────── */}
        {!loading &&
          filtered.map((appt) => (
            <Card key={appt.id} className="p-4 space-y-3">
              {/* Top row: customer + status badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm">
                    {appt.clientName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{appt.serviceName}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>

              {/* Date / time / price */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                  {formatDate(appt.startDateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="schedule" className="text-sm leading-none" />
                  {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
                </span>
                {appt.servicePrice != null && (
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <MaterialIcon name="payments" className="text-sm leading-none" />
                    ${appt.servicePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Confirmation code + cancel */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-mono text-gray-400">
                  #{appt.confirmationCode}
                </span>
                {appt.status === AppointmentStatus.Scheduled && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelId(appt.id)}
                    disabled={cancelingId === appt.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {cancelingId === appt.id ? "Canceling…" : "Cancel"}
                  </button>
                )}
              </div>
            </Card>
          ))}
      </div>
    </div>
    </>
  );
}

// ── Status badge helper ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: number }) {
  if (status === AppointmentStatus.Canceled)
    return <Badge variant="cancelled">Canceled</Badge>;
  if (status === AppointmentStatus.Completed)
    return <Badge variant="confirmed">Completed</Badge>;
  return <Badge variant="active">Scheduled</Badge>;
}
