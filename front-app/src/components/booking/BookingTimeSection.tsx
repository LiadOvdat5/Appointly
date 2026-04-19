import { useTranslation } from "react-i18next";
import { formatTime } from "../../utils/formatTime";
import type { SlotDTO } from "../../services/scheduleService";
import { Card } from "../UI/Card";
import { TimeSlot } from "../UI/TimeSlot";

interface BookingTimeSectionProps {
  selectedDate: Date;
  slots: SlotDTO[];
  slotsLoading: boolean;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  locale: string;
  timezone: string | undefined;
}

function formatDateLong(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BookingTimeSection({
  selectedDate,
  slots,
  slotsLoading,
  selectedSlotId,
  onSelectSlot,
  locale,
  timezone,
}: BookingTimeSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-[#111418] dark:text-white text-sm mb-1">
        {t("booking.availableTimes")}
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        {formatDateLong(selectedDate, locale)}
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
              onClick={() => onSelectSlot(slot.id === selectedSlotId ? null : slot.id)}
            >
              {formatTime(slot.startDateTime, timezone)}
            </TimeSlot>
          ))}
        </div>
      )}
    </Card>
  );
}
