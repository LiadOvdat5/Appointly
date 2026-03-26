import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientAppointments,
  cancelAppointment,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { Card } from "../components/UI/Card";
import { Badge } from "../components/UI/Badge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Button } from "../components/UI/Button";
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

function statusBadgeVariant(
  status: number,
): "confirmed" | "cancelled" | "pending" {
  if (status === AppointmentStatus.Scheduled) return "confirmed";
  if (status === AppointmentStatus.Canceled) return "cancelled";
  return "pending"; // completed
}

function statusLabel(status: number): string {
  if (status === AppointmentStatus.Scheduled) return "Confirmed";
  if (status === AppointmentStatus.Canceled) return "Canceled";
  return "Completed";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getClientAppointments()
      .then((all) => {
        const now = new Date();
        const upcoming = all
          .filter(
            (a) =>
              a.status !== AppointmentStatus.Canceled &&
              new Date(a.startDateTime) >= now,
          )
          .sort(
            (a, b) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          );
        setAppointments(upcoming);
      })
      .catch(() => setError("Failed to load appointments."))
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    const id = confirmCancelId;
    setConfirmCancelId(null);
    setCancelingId(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently ignore
    } finally {
      setCancelingId(null);
    }
  }

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
        <div>
          <h1 className="font-bold text-[#111418] dark:text-white text-base">
            My Appointments
          </h1>
          <p className="text-xs text-gray-500">Upcoming bookings</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon
                name="calendar_today"
                className="text-3xl text-gray-400"
              />
            </div>
            <div>
              <p className="font-semibold text-[#111418] dark:text-white">
                No upcoming appointments
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Book a service to get started.
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate("/search")}>
              Find a business
            </Button>
          </div>
        )}

        {/* Appointment list */}
        {!loading &&
          appointments.map((appt) => (
            <Card key={appt.id} className="p-4 space-y-3">
              {/* Top row: business + badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                    {appt.businessName}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {appt.serviceName}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(appt.status)}>
                  {statusLabel(appt.status)}
                </Badge>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                  {formatDate(appt.startDateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="schedule" className="text-sm leading-none" />
                  {formatTime(appt.startDateTime)} –{" "}
                  {formatTime(appt.endDateTime)}
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
