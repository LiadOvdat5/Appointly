import { apiClient } from "./apiClient";

export interface MyInvitation {
  id: string;
  businessId: string;
  businessName: string;
  inviterId: string;
  workerId?: string;
  workerEmail: string;
  status: number; // 0=Pending, 1=Accepted, 2=Declined, 3=Expired, 4=Cancelled
  message?: string;
  invitedAt: string;
  respondedAt?: string;
  expirationDate: string;
}

export const InvitationStatus = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Expired: 3,
  Cancelled: 4,
} as const;

export const getMyInvitations = async (): Promise<MyInvitation[]> => {
  const res = await apiClient.get<MyInvitation[]>("/invitations/my");
  return res.data;
};

export const respondToInvitation = async (
  invitationId: string,
  accept: boolean,
): Promise<MyInvitation> => {
  const res = await apiClient.post<MyInvitation>(
    `/invitations/${invitationId}/respond`,
    accept,
  );
  return res.data;
};
