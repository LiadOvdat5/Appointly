import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTime } from "../utils/formatTime";
import {
  getPublicBusinessById,
  getPublicBusinessBySlug,
  getPublicServicesForBusiness,
} from "../services/businessManagementService";
import {
  getAvailableSlotsForDate,
  type SlotDTO,
} from "../services/scheduleService";
import {
  bookAppointment,
  type AppointmentDTO,
} from "../services/appointmentService";
import type { BusinessProfile, ServiceProfile } from "../types/business";
import { AvailableDatePicker } from "../components/UI/AvailableDatePicker";
import { TimeSlot } from "../components/UI/TimeSlot";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { MaterialIcon } from "../components/UI/MaterialIcon";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(minutes: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (minutes < 60) return t("common.durationMin", { count: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m
    ? t("common.durationHourMin", { count: h, minutes: m })
    : t("common.durationHour", { count: h });
}

function formatDateLong(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const { businessSlug, serviceId } = useParams<{
    businessSlug: string;
    serviceId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─ Meta
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [service, setService] = useState<ServiceProfile | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // ─ Date selection
  const slotDateParam = searchParams.get("slotDate");
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (slotDateParam) {
      const d = new Date(slotDateParam);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  });

  // ─ Time slot selection
  const [slots, setSlots] = useState<SlotDTO[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    searchParams.get("slotId"),
  );

  // ─ Booking submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<AppointmentDTO | null>(null);

  // Load business + service metadata
  useEffect(() => {
    if (!businessSlug || !serviceId) return;
    setMetaLoading(true);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessSlug);
    const bizPromise = isUUID ? getPublicBusinessById(businessSlug) : getPublicBusinessBySlug(businessSlug);
    bizPromise
      .then(async (biz) => {
        if (isUUID && biz.slug) {
          navigate(`/book/${biz.slug}/${serviceId}`, { replace: true });
          return;
        }
        const services = await getPublicServicesForBusiness(biz.id);
        setBusiness(biz);
        const svc = services.find((s) => s.id === serviceId) ?? null;
        setService(svc);
        if (!svc) setMetaError(t("booking.errorServiceNotFound"));
      })
      .catch(() => setMetaError(t("booking.errorLoadFailed")))
      .finally(() => setMetaLoading(false));
  }, [businessSlug, serviceId, t, navigate]);

  // Load time slots when a date is selected
  useEffect(() => {
    if (!serviceId || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlotId(null);
    getAvailableSlotsForDate(serviceId, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [serviceId, selectedDate]);

  // ─ Loading / error states
  if (metaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (metaError || !business || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-6">
        <MaterialIcon name="error_outline" className="text-5xl text-gray-300" />
        <p className="text-gray-500">
          {metaError ?? t("booking.errorSomethingWrong")}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary text-sm underline"
        >
          {t("booking.goBack")}
        </button>
      </div>
    );
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;

  async function handleConfirmBooking() {
    if (!selectedSlot || !serviceId) return;
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const appointment = await bookAppointment(serviceId, selectedSlot.id);
      setConfirmedAppointment(appointment);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        setBookingError(t("booking.slotTaken"));
        setSelectedSlotId(null);
        setSlots([]);
      } else {
        setBookingError(t("booking.errorTryAgain"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─ Success screen
  if (confirmedAppointment) {
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
            <MaterialIcon
              name="check_circle"
              className="text-4xl text-green-500"
            />
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
                {confirmedAppointment.confirmationCode}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{t("booking.confirmed.business")}</span>
              <span className="font-medium text-[#111418] dark:text-white">
                {confirmedAppointment.businessName}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{t("booking.confirmed.service")}</span>
              <span className="font-medium text-[#111418] dark:text-white">
                {confirmedAppointment.serviceName}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{t("booking.confirmed.date")}</span>
              <span className="font-medium text-[#111418] dark:text-white">
                {new Date(
                  confirmedAppointment.startDateTime,
                ).toLocaleDateString(i18n.language, {
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
                {formatTime(confirmedAppointment.startDateTime)} –{" "}
                {formatTime(confirmedAppointment.endDateTime)}
              </span>
            </div>
            {confirmedAppointment.servicePrice != null && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="font-semibold">
                  {t("booking.confirmed.total")}
                </span>
                <span className="font-bold text-primary">
                  ${confirmedAppointment.servicePrice.toFixed(2)}
                </span>
              </div>
            )}
          </Card>
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              onClick={() => navigate("/dashboard/customer")}
            >
              {t("booking.confirmed.viewAppointments")}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/business/${business?.slug ?? confirmedAppointment.businessId}`)
              }
            >
              {t("booking.confirmed.backToBusiness")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/business/${business?.slug ?? businessSlug}`)}
          className="flex size-11 shrink-0 -ml-1 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label={t("common.back")}
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#111418] dark:text-white truncate">
            {business.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{service.name}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Service summary */}
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MaterialIcon name="content_cut" className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#111418] dark:text-white text-sm">
              {service.name}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <MaterialIcon
                  name="schedule"
                  className="text-sm leading-none"
                />
                {formatDuration(service.duration, t)}
              </span>
              {service.price != null && (
                <span className="font-semibold text-primary">
                  ${service.price.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </Card>

        {/* Date picker */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#111418] dark:text-white text-sm mb-4">
            {t("booking.pickDate")}
          </h2>
          <AvailableDatePicker
            serviceId={serviceId!}
            selectedDate={selectedDate}
            onDateSelect={(d) => {
              setSelectedDate(d);
              setSelectedSlotId(null);
            }}
          />
        </Card>

        {/* Time slot picker */}
        {selectedDate && (
          <Card className="p-5">
            <h2 className="font-semibold text-[#111418] dark:text-white text-sm mb-1">
              {t("booking.availableTimes")}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {formatDateLong(selectedDate, i18n.language)}
            </p>

            {slotsLoading ? (
              <div className="flex justify-center py-4">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {t("booking.noSlots")}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <TimeSlot
                    key={slot.id}
                    selected={slot.id === selectedSlotId}
                    onClick={() =>
                      setSelectedSlotId(
                        slot.id === selectedSlotId ? null : slot.id,
                      )
                    }
                  >
                    {formatTime(slot.startDateTime)}
                  </TimeSlot>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Booking summary + CTA */}
        {selectedSlot && (
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-[#111418] dark:text-white text-sm">
              {t("booking.summary")}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t("booking.summaryService")}</span>
                <span className="font-medium text-[#111418] dark:text-white">
                  {service.name}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t("booking.summaryDate")}</span>
                <span className="font-medium text-[#111418] dark:text-white">
                  {selectedDate
                    ? selectedDate.toLocaleDateString(i18n.language, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t("booking.summaryTime")}</span>
                <span className="font-medium text-[#111418] dark:text-white">
                  {formatTime(selectedSlot.startDateTime)} –{" "}
                  {formatTime(selectedSlot.endDateTime)}
                </span>
              </div>
              {service.price != null && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-semibold">
                    {t("booking.summaryTotal")}
                  </span>
                  <span className="font-bold text-primary">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {bookingError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <MaterialIcon
                  name="error_outline"
                  className="text-red-500 text-base mt-0.5 shrink-0"
                />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {bookingError}
                </p>
              </div>
            )}
            <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
            >
              {isSubmitting
                ? t("booking.confirming")
                : t("booking.confirmButton")}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
