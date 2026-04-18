import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import type { SlotDTO } from "../../services/scheduleService";
import type { ServiceProfile } from "../../types/business";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";
import { PriceDisplay } from "../UI/PriceDisplay";
import type { CurrencyCode } from "../../hooks/useCurrency";

interface BookingSummaryCardProps {
  service: ServiceProfile;
  selectedDate: Date | null;
  selectedSlot: SlotDTO;
  bookingError: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  locale: string;
  businessCurrency: CurrencyCode;
  timezone: string;
}

export function BookingSummaryCard({
  service,
  selectedDate,
  selectedSlot,
  bookingError,
  isSubmitting,
  onConfirm,
  locale,
  businessCurrency,
  timezone,
}: BookingSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-5 space-y-4">
      <h2 className="font-semibold text-[#111418] dark:text-white text-sm">
        {t("booking.summary")}
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{t("booking.summaryService")}</span>
          <span className="font-medium text-[#111418] dark:text-white">{service.name}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{t("booking.summaryDate")}</span>
          <span className="font-medium text-[#111418] dark:text-white">
            {selectedDate
              ? selectedDate.toLocaleDateString(locale, {
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
            {formatTime(selectedSlot.startDateTime, timezone)} – {formatTime(selectedSlot.endDateTime, timezone)}
          </span>
        </div>
        {service.price != null && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="font-semibold">{t("booking.summaryTotal")}</span>
            <PriceDisplay amount={service.price} businessCurrency={businessCurrency} className="text-primary" />
          </div>
        )}
      </div>

      {bookingError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
          <MaterialIcon name="error_outline" className="text-red-500 text-base mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{bookingError}</p>
        </div>
      )}
      <Button variant="primary" disabled={isSubmitting} onClick={onConfirm}>
        {isSubmitting ? t("booking.confirming") : t("booking.confirmButton")}
      </Button>
    </Card>
  );
}
