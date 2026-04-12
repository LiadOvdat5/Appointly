import { apiClient } from "./apiClient";

// eslint-disable-next-line @typescript-eslint/no-namespace
export const NotificationType = {
  AppointmentBooked: 0,
  AppointmentCancelled: 1,
  AppointmentReminder: 2,
  ReviewPrompt: 3,
  InvitationReceived: 4,
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationDTO {
  id: string;
  /** i18n key for the title */
  title: string;
  /** i18n key for the body */
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  /** Frontend route to navigate to on click */
  targetPath?: string;
  /** Interpolation params for the i18n body key */
  bodyParams?: Record<string, string>;
}

export async function getNotifications(
  page = 1,
  pageSize = 20,
): Promise<NotificationDTO[]> {
  const response = await apiClient.get<NotificationDTO[]>(
    "/api/notification",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<number>("/api/notification/unread-count");
  return response.data;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.post(`/api/notification/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post("/api/notification/read-all");
}

export interface BusinessNotificationSettings {
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
}

export async function updateBusinessNotificationSettings(
  businessId: string,
  settings: Partial<BusinessNotificationSettings>,
): Promise<BusinessNotificationSettings> {
  const response = await apiClient.patch<BusinessNotificationSettings>(
    `/businesses/${businessId}/notification-settings`,
    settings,
  );
  return response.data;
}
