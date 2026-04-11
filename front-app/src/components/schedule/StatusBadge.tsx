import { useTranslation } from "react-i18next";
import { Badge } from "../UI/Badge";
import { AppointmentStatus } from "../../services/appointmentService";

export function StatusBadge({ status }: { status: number }) {
  const { t } = useTranslation();
  if (status === AppointmentStatus.Canceled)
    return <Badge variant="cancelled">{t("businessSchedule.canceled")}</Badge>;
  if (status === AppointmentStatus.Completed)
    return <Badge variant="confirmed">{t("businessSchedule.completed")}</Badge>;
  return <Badge variant="active">{t("businessSchedule.scheduled")}</Badge>;
}
