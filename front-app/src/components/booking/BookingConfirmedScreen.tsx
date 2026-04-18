import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import type { AppointmentDTO } from "../../services/appointmentService";
import type { BusinessProfile } from "../../types/business";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";
import { AddToCalendarButton } from "../UI/AddToCalendarButton";

interface BookingConfirmedScreenProps {
  appointment: AppointmentDTO;
  business: BusinessProfile | null;
}

export function BookingConfirmedScreen({ appointment, business }: BookingConfirmedScreenProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#111418] dark:text-white">
            {t("booking.confirmed.header")}
          </p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <MaterialIcon name="check_circle" className="text-4xl text-green-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111418] dark:text-white">
            {t("booking.confirmed.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("booking.confirmed.subtitle")}
          </p>
        </div>
        <Card className="p-5 w-full text-left space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{t("booking.confirmed.confirmationCode")}</span>
            <span className="font-mono font-medium text-[#111418] dark:text-white text-xs">
              {appointment.confirmationCode}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{t("booking.confirmed.business")}</span>
            <span className="font-medium text-[#111418] dark:text-white">
              {appointment.businessName}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{t("booking.confirmed.service")}</span>
            <span className="font-medium text-[#111418] dark:text-white">
              {appointment.serviceName}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{t("booking.confirmed.date")}</span>
            <span className="font-medium text-[#111418] dark:text-white">
              {new Date(appointment.startDateTime).toLocaleDateString(i18n.language, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{t("booking.confirmed.time")}</span>
            <span className="font-medium text-[#111418] dark:text-white">
              {formatTime(appointment.startDateTime, business?.timezone ?? undefined)} – {formatTime(appointment.endDateTime, business?.timezone ?? undefined)}
            </span>
          </div>
          {appointment.servicePrice != null && (
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold">{t("booking.confirmed.total")}</span>
              <span className="font-bold text-primary">
                ${appointment.servicePrice.toFixed(2)}
              </span>
            </div>
          )}
        </Card>
        <div className="flex flex-col gap-3 w-full">
          <AddToCalendarButton
            appointment={{
              id: appointment.id,
              title: `${appointment.serviceName} at ${appointment.businessName}`,
              startDateTime: appointment.startDateTime,
              durationMinutes: appointment.serviceDuration,
              businessName: appointment.businessName,
              businessAddress: appointment.businessAddress,
              serviceName: appointment.serviceName,
            }}
            className="self-center"
          />
          <Button variant="primary" onClick={() => navigate("/dashboard/customer")}>
            {t("booking.confirmed.viewAppointments")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/business/${business?.slug ?? appointment.businessId}`)}
          >
            {t("booking.confirmed.backToBusiness")}
          </Button>
        </div>
      </div>
    </div>
  );
}
