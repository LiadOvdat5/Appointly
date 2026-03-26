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
