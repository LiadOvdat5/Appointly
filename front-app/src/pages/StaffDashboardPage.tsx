import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  getBusinessAppointments,
  AppointmentStatus,
  type AppointmentDTO,
} from "../services/appointmentService";
import { getServicesForBusiness } from "../services/businessManagementService";
import { getStaffServices } from "../services/staffService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [assignedServices, setAssignedServices] = useState<ServiceProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const bid = businessId ?? authUser?.businessId ?? "";

  useEffect(() => {
    if (!bid || !authUser) return;
    setLoading(true);

    Promise.all([
      getServicesForBusiness(bid),
      getStaffServices(bid, authUser.id).catch(() => [] as string[]),
      getBusinessAppointments(bid, 1, 50).catch(() => [] as AppointmentDTO[]),
    ])
      .then(([allServices, assignedIds, allAppts]) => {
        // Filter services to only the ones assigned to this staff member
        const myServices = allServices.filter((s) => assignedIds.includes(s.id));
        setAssignedServices(myServices);

        // Filter appointments: only this partner's upcoming non-cancelled ones
        const upcoming = allAppts
          .filter(
            (a) =>
              a.status !== AppointmentStatus.Canceled &&
              new Date(a.startDateTime) >= new Date(),
          )
          .sort(
            (a, b) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )
          .slice(0, 10);
        setAppointments(upcoming);
      })
      .finally(() => setLoading(false));
  }, [bid, authUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
            Staff Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {authUser?.name} · Staff member
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* ── Assigned Services ── */}
        <section>
          <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
            My Services
          </h2>

          {assignedServices.length === 0 ? (
            <Card className="p-6 flex flex-col items-center gap-3 text-center">
              <MaterialIcon name="design_services" className="text-3xl text-gray-400" />
              <div>
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  No services assigned yet
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your business owner will assign services to you.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignedServices.map((svc) => (
                <Card key={svc.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MaterialIcon name="design_services" className="text-base text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                        {svc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {svc.duration} min
                        {svc.price != null ? ` · $${svc.price.toFixed(2)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-auto! px-3"
                        onClick={() => navigate(`/business/${bid}/schedule?serviceId=${svc.id}`)}
                      >
                        View Schedule
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-auto! px-3"
                        onClick={() => navigate(`/schedule/${bid}/${svc.id}`)}
                      >
                        Edit Availability
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Upcoming Appointments ── */}
        <section>
          <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
            Upcoming Appointments
          </h2>

          {appointments.length === 0 ? (
            <Card className="p-6 flex flex-col items-center gap-3 text-center">
              <MaterialIcon name="calendar_today" className="text-3xl text-gray-400" />
              <div>
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  No upcoming appointments
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  New bookings will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <Card key={appt.id} className="p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                      {appt.clientName}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {appt.serviceName}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MaterialIcon name="calendar_today" className="text-xs" />
                        {formatDate(appt.startDateTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MaterialIcon name="schedule" className="text-xs" />
                        {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
