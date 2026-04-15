import { apiClient } from "./apiClient";

export interface StaffMember {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
  assignedServiceNames: string[];
  assignedServicesCount: number;
}

export interface StaffInvitation {
  id: string;
  businessId: string;
  businessName: string;
  inviterId: string;
  workerId?: string;
  workerEmail: string;
  status: number;
  message?: string;
  invitedAt: string;
  respondedAt?: string;
  expirationDate: string;
}

export interface StaffReport {
  userId: string;
  name: string;
  totalAppointments: number;
  currentMonthAppointments: number;
  revenue: number;
  completionRate: number;
  averageRating?: number;
}

export const getStaff = async (businessId: string): Promise<StaffMember[]> => {
  const res = await apiClient.get<StaffMember[]>(`/businesses/${businessId}/staff`);
  return res.data;
};

export const getPendingInvitations = async (businessId: string): Promise<StaffInvitation[]> => {
  const res = await apiClient.get<StaffInvitation[]>(`/businesses/${businessId}/invitations`);
  return res.data;
};

export const inviteStaff = async (
  businessId: string,
  workerEmail: string,
  message?: string,
): Promise<StaffInvitation> => {
  const res = await apiClient.post<StaffInvitation>(`/businesses/${businessId}/invite`, {
    workerEmail,
    message,
  });
  return res.data;
};

export const cancelInvitation = async (businessId: string, invitationId: string): Promise<void> => {
  await apiClient.delete(`/businesses/${businessId}/invitations/${invitationId}`);
};

export const removeStaff = async (businessId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/businesses/${businessId}/staff/${userId}`);
};

export const getStaffServices = async (businessId: string, userId: string): Promise<string[]> => {
  const res = await apiClient.get<string[]>(`/businesses/${businessId}/staff/${userId}/services`);
  return res.data;
};

export const updateStaffServices = async (
  businessId: string,
  userId: string,
  serviceIds: string[],
): Promise<void> => {
  await apiClient.put(`/businesses/${businessId}/staff/${userId}/services`, serviceIds);
};

export interface PartnerNextAppointment {
  appointmentId: string;
  startDateTime: string;
  customerName: string;
  serviceName: string;
  durationMinutes: number;
}

export interface PartnerAssignedService {
  serviceId: string;
  name: string;
  durationMinutes: number;
  price?: number;
}

export interface PartnerWorkplace {
  businessId: string;
  name: string;
  logoUrl?: string;
  slug?: string;
}

export interface PartnerStats {
  nextAppointment?: PartnerNextAppointment;
  todayCount: number;
  weekCount: number;
  assignedServices: PartnerAssignedService[];
  business?: PartnerWorkplace;
}

export const getPartnerStats = async (): Promise<PartnerStats> => {
  const res = await apiClient.get<PartnerStats>("/partners/me/stats");
  return res.data;
};

export const InactiveStaffEntryType = {
  RemovedStaff: 0,
  DeclinedInvitation: 1,
  ExpiredInvitation: 2,
} as const;

export type InactiveStaffEntryType = typeof InactiveStaffEntryType[keyof typeof InactiveStaffEntryType];

export interface InactiveStaffEntry {
  entryType: InactiveStaffEntryType;
  userId?: string;
  name?: string;
  email: string;
  statusChangedAt: string;
}

export const getInactiveStaff = async (businessId: string): Promise<InactiveStaffEntry[]> => {
  const res = await apiClient.get<InactiveStaffEntry[]>(`/businesses/${businessId}/staff/inactive`);
  return res.data;
};

export const getStaffReport = async (
  businessId: string,
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<StaffReport> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await apiClient.get<StaffReport>(`/businesses/${businessId}/staff/${userId}/report`, {
    params,
  });
  return res.data;
};
