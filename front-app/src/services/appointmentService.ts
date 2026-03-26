import { apiClient } from "./apiClient";

export interface AppointmentDTO {
  id: string;
  confirmationCode: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  partnerId: string;
  partnerName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice?: number;
  businessId: string;
  businessName: string;
  businessAddress?: string;
  serviceScheduleId: string;
  startDateTime: string;
  endDateTime: string;
  notes?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export async function bookAppointment(
  serviceId: string,
  slotId: string,
  notes?: string,
): Promise<AppointmentDTO> {
  const response = await apiClient.post<AppointmentDTO>("/api/appointment", {
    serviceId,
    serviceScheduleId: slotId,
    notes,
  });
  return response.data;
}
