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
  const startDate = new Date(year, month, 1);
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
 * Returns available slots for a single date (time-slot picker).
 */
export const getAvailableSlotsForDate = async (
  serviceId: string,
  date: Date,
): Promise<SlotDTO[]> => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  return getAvailableSlotsForService(serviceId, startDate, endDate);
};
