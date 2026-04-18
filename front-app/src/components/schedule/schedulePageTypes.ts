import type { AppointmentDTO } from "../../services/appointmentService";

export type RangePreset = "week" | "next-week" | "month";

export interface MergedSlot {
  key: string;
  slotId?: string;
  startISO: string;
  endISO: string;
  isBooked: boolean;
  isBlocked?: boolean;
  blockingServiceName?: string;
  blockNote?: string;
  appointment?: AppointmentDTO;
}
