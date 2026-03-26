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

// status enum mirrors backend AppointmentStatus
export const AppointmentStatus = {
  Scheduled: 0,
  Canceled: 1,
  Completed: 2,
} as const;

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

export async function getClientAppointments(
  page = 1,
  pageSize = 50,
): Promise<AppointmentDTO[]> {
  const response = await apiClient.get<AppointmentDTO[]>(
    "/api/appointment/client",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function getBusinessAppointments(
  businessId: string,
  page = 1,
  pageSize = 50,
): Promise<AppointmentDTO[]> {
  const response = await apiClient.get<AppointmentDTO[]>(
    `/api/appointment/business/${businessId}`,
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function getBusinessAppointmentsByRange(
  businessId: string,
  startDate: Date,
  endDate: Date,
): Promise<AppointmentDTO[]> {
  const response = await apiClient.get<AppointmentDTO[]>(
    `/api/appointment/business/${businessId}/range`,
    {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
  );
  return response.data;
}

export async function cancelAppointment(
  id: string,
  cancellationReason?: string,
): Promise<AppointmentDTO> {
  const response = await apiClient.patch<AppointmentDTO>(
    `/api/appointment/${id}/cancel`,
    cancellationReason ? { cancellationReason } : {},
  );
  return response.data;
}
