import { apiClient } from "./apiClient";

// Status is serialized as an integer by the backend (ScheduleStatus enum)
export const ScheduleStatus = {
  AVAILABLE: 0,
  BOOKED: 1,
  BLOCKED: 2,
} as const;

export interface SlotDTO {
  id: string;
  serviceId: string;
  startDateTime: string;
  endDateTime: string;
  status: number;
  blockingAppointmentId?: string;
  blockingServiceName?: string;
}

export const getAvailableSlotsForService = async (
  serviceId: string,
  startDate: Date,
  endDate: Date,
): Promise<SlotDTO[]> => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  const response = await apiClient.get<SlotDTO[]>(
    `/api/schedule/service/${serviceId}/slots/range?${params.toString()}`,
  );
  return response.data.filter((s) => s.status === ScheduleStatus.AVAILABLE);
};


/**
 * Returns the set of date strings ("YYYY-MM-DD") that have at least one
 * available slot for the given service within the specified month.
 */
export const getAvailableDatesForMonth = async (
  serviceId: string,
  year: number,
  month: number, // 0-indexed (JS Date convention)
): Promise<Set<string>> => {
  const monthStart = new Date(year, month, 1);
  const now = new Date();
  const startDate = monthStart < now ? now : monthStart;
  const endDate = new Date(year, month + 1, 0, 23, 59, 59); // last moment of the month
  const slots = await getAvailableSlotsForService(serviceId, startDate, endDate);
  const dates = new Set<string>();
  for (const slot of slots) {
    const d = new Date(slot.startDateTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dates.add(key);
  }
  return dates;
};

/**
 * Delete AVAILABLE (unbooked) slots for a service within a date/time window.
 * dayOfWeek: 0=Mon … 6=Sun (our rule convention)
 * startTime/endTime: "HH:mm" — only slots whose start falls in [start, end) are deleted
 * Returns the count of deleted slots.
 */
export const deleteAvailableSlotsInWindow = async (
  serviceId: string,
  fromDate: Date,
  toDate: Date,
  dayOfWeek?: number,
  startTime?: string,
  endTime?: string,
): Promise<number> => {
  const params: Record<string, string> = {
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
  };
  if (dayOfWeek !== undefined) params.dayOfWeek = String(dayOfWeek);
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;

  const response = await apiClient.delete<{ deletedCount: number }>(
    `/api/schedule/service/${serviceId}/slots/bulk-available`,
    { params },
  );
  return response.data.deletedCount;
};

/**
 * Returns BLOCKED slots for a service (due to parallel-booking conflict).
 * Owner-facing — includes BlockingServiceName to explain why the slot is blocked.
 */
export const getBlockedSlotsForService = async (
  serviceId: string,
  startDate: Date,
  endDate: Date,
): Promise<SlotDTO[]> => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    includeBlocked: "true",
  });
  const response = await apiClient.get<SlotDTO[]>(
    `/api/schedule/service/${serviceId}/slots/range?${params.toString()}`,
  );
  return response.data.filter((s) => s.status === ScheduleStatus.BLOCKED);
};

/**
 * Returns available slots for a single date (time-slot picker).
 */
export const getAvailableSlotsForDate = async (
  serviceId: string,
  date: Date,
): Promise<SlotDTO[]> => {
  const isToday = date.toDateString() === new Date().toDateString();
  const startDate = isToday
    ? new Date()
    : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  return getAvailableSlotsForService(serviceId, startDate, endDate);
};
