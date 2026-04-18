import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";
import { PriceDisplay } from "../UI/PriceDisplay";
import { formatTime } from "../../utils/formatTime";
import type { ServiceProfile } from "../../types/business";
import type { SlotDTO } from "../../services/scheduleService";
import type { CurrencyCode } from "../../hooks/useCurrency";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatSlotDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

interface ServiceCardProps {
  service: ServiceProfile;
  businessSlug: string;
  businessCurrency: CurrencyCode;
  slots: SlotDTO[];
  slotsLoading: boolean;
  isAuthenticated: boolean;
  isEditing: boolean;
  isBeingEdited: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageSchedule: () => void;
}

export function ServiceCard({
  service,
  businessSlug,
  businessCurrency,
  slots,
  slotsLoading,
  isAuthenticated,
  isEditing,
  isBeingEdited,
  onEdit,
  onDelete,
  onManageSchedule,
}: ServiceCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const bookingPath = `/book/${businessSlug}/${service.id}`;
  const loginRedirect = `/login?from=/business/${businessSlug}`;

  function handleBook(extra = "") {
    if (!isAuthenticated) {
      navigate(loginRedirect);
    } else {
      navigate(extra ? `${bookingPath}${extra}` : bookingPath);
    }
  }

  const previewSlots = slots.slice(0, 3);

  return (
    <Card className={`p-5 flex flex-col gap-4 transition-opacity ${isBeingEdited ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-[#111418] dark:text-white text-base">{service.name}</p>
          {service.description && (
            <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
          )}
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1 shrink-0">
            {service.price != null && (
              <PriceDisplay
                amount={service.price}
                businessCurrency={businessCurrency}
                className="text-[#111418] dark:text-white text-base"
              />
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MaterialIcon name="schedule" className="text-sm leading-none" />
              {formatDuration(service.duration)}
            </span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={onManageSchedule}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={t("publicBusiness.manageSchedule")}
              >
                <MaterialIcon name="calendar_month" className="text-base" />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={t("publicBusiness.editServiceAriaLabel")}
              >
                <MaterialIcon name="edit" className="text-base" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                aria-label={t("publicBusiness.deleteServiceAriaLabel")}
              >
                <MaterialIcon name="delete" className="text-base" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div>
            {slotsLoading ? (
              <p className="text-xs text-gray-400">{t("publicBusiness.checkingAvailability")}</p>
            ) : previewSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleBook(`?slotId=${slot.id}&slotDate=${encodeURIComponent(slot.startDateTime)}`)}
                    className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-[#111418] dark:text-white hover:bg-primary/20 active:scale-95 transition-all"
                  >
                    {formatSlotDate(slot.startDateTime)}{" "}
                    <span className="font-bold">{formatTime(slot.startDateTime)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">{t("publicBusiness.noUpcomingSlots")}</p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={() => handleBook()}>
            {t("publicBusiness.book")}
          </Button>
        </>
      )}
    </Card>
  );
}
