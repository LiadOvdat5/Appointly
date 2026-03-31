import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getServicesForBusiness } from "../services/businessManagementService";
import { getBusinessAppointments, AppointmentStatus, type AppointmentDTO } from "../services/appointmentService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { MaterialIcon } from "../components/UI/MaterialIcon";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceSelectionPage() {
  const { t } = useTranslation();
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);

    Promise.all([
      getServicesForBusiness(businessId),
      getBusinessAppointments(businessId, 1, 200),
    ])
      .then(([svcs, appts]) => {
        setServices(svcs);
        // Only keep future, non-canceled appointments for the upcoming count
        const now = new Date();
        setAppointments(
          appts.filter(
            (a) =>
              a.status !== AppointmentStatus.Canceled &&
              new Date(a.startDateTime) >= now,
          ),
        );
      })
      .catch(() => setError(t("serviceSelection.error.loadFailed")))
      .finally(() => setLoading(false));
  }, [businessId]);

  function upcomingCountForService(serviceId: string): number {
    return appointments.filter((a) => a.serviceId === serviceId).length;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {t("serviceSelection.title")}
            </h1>
            <p className="text-xs text-gray-500">{t("serviceSelection.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
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
        {!loading && !error && services.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="content_cut" className="text-3xl text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-[#111418] dark:text-white">{t("serviceSelection.empty.title")}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t("serviceSelection.empty.text")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/business/${businessId}?edit=true`)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("serviceSelection.empty.goToBusinessPage")}
            </button>
          </div>
        )}

        {/* Service list */}
        {!loading &&
          services.map((svc) => {
            const upcoming = upcomingCountForService(svc.id);
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => navigate(`/schedule/${businessId}/${svc.id}`)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <MaterialIcon name="content_cut" className="text-xl text-purple-600 dark:text-purple-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#111418] dark:text-white text-sm truncate">
                        {svc.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* Duration */}
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MaterialIcon name="schedule" className="text-sm leading-none" />
                          {svc.duration} min
                        </span>
                        {/* Price */}
                        {svc.price != null && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MaterialIcon name="payments" className="text-sm leading-none" />
                            ${svc.price.toFixed(2)}
                          </span>
                        )}
                        {/* Upcoming appointments badge */}
                        {upcoming > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                            <MaterialIcon name="event" className="text-xs leading-none" />
                            {t("serviceSelection.upcoming", { count: upcoming })}
                          </span>
                        )}
                      </div>
                    </div>

                    <MaterialIcon name="chevron_right" className="text-gray-400 shrink-0" />
                  </div>
                </Card>
              </button>
            );
          })}

        {/* Hint */}
        {!loading && services.length > 0 && (
          <p className="text-center text-xs text-gray-400 pt-2">
            {t("serviceSelection.hint")}
          </p>
        )}
      </div>
    </div>
  );
}
