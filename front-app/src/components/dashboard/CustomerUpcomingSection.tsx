import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../../utils/formatTime";
import { Card } from "../UI/Card";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { MaterialIcon } from "../UI/MaterialIcon";
import { PriceDisplay } from "../UI/PriceDisplay";
import type { AppointmentDTO } from "../../services/appointmentService";
import type { CurrencyCode } from "../../hooks/useCurrency";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface CustomerUpcomingSectionProps {
  appointments: AppointmentDTO[];
  loading: boolean;
}

export function CustomerUpcomingSection({
  appointments,
  loading,
}: CustomerUpcomingSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
          {t("customerDashboard.upcomingAppointments")}
        </h2>
        <button
          type="button"
          onClick={() => navigate("/dashboard/customer")}
          className="text-xs text-primary font-semibold flex items-center gap-1 group"
        >
          <span className="group-hover:underline">{t("customerDashboard.viewAll")}</span>
          <MaterialIcon name="chevron_right" className="text-sm" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="p-6 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MaterialIcon name="calendar_today" className="text-2xl text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-[#111418] dark:text-white text-sm">
              {t("customerDashboard.noUpcoming.title")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("customerDashboard.noUpcoming.text")}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate("/search")}>
            {t("customerDashboard.findBusiness")}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                    {appt.businessName}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {appt.serviceName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MaterialIcon name="calendar_today" className="text-sm leading-none" />
                      {formatDate(appt.startDateTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MaterialIcon name="schedule" className="text-sm leading-none" />
                      {formatTime(appt.startDateTime)} – {formatTime(appt.endDateTime)}
                    </span>
                    {appt.servicePrice != null && (
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <MaterialIcon name="payments" className="text-sm leading-none" />
                        <PriceDisplay
                          amount={appt.servicePrice}
                          businessCurrency={(appt.businessCurrency as CurrencyCode) ?? "ILS"}
                        />
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="confirmed">{t("customerDashboard.confirmed")}</Badge>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={() => navigate("/dashboard/customer")}
            className="w-full text-center text-sm text-primary font-semibold py-2 hover:underline"
          >
            {t("customerDashboard.manageAll")}
          </button>
        </div>
      )}
    </section>
  );
}
