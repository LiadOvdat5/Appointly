import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { Card } from "../components/UI/Card";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { BookingConfirmedScreen } from "../components/booking/BookingConfirmedScreen";
import { BookingTimeSection } from "../components/booking/BookingTimeSection";
import { BookingSummaryCard } from "../components/booking/BookingSummaryCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(minutes: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (minutes < 60) return t("common.durationMin", { count: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m
    ? t("common.durationHourMin", { count: h, minutes: m })
    : t("common.durationHour", { count: h });
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
    return <BookingConfirmedScreen appointment={confirmedAppointment} business={business} />;
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
          <BookingTimeSection
            selectedDate={selectedDate}
            slots={slots}
            slotsLoading={slotsLoading}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            locale={i18n.language}
          />
        )}

        {/* Booking summary + CTA */}
        {selectedSlot && (
          <BookingSummaryCard
            service={service}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            bookingError={bookingError}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirmBooking}
            locale={i18n.language}
          />
        )}
      </div>
    </div>
  );
}
