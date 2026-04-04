# US-09-A-01: Notification Model and API

**Feature:** [[F-09-A-In-App-Notifications|F-09-A: In-App Notification Center]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** ✅ Done

---

## Story
As the **system**, I want to **store and serve in-app notifications per user** so that **any feature can create a notification and the user can retrieve them**.

## Tasks
- `[DB]` Create `Notifications` table: `Id`, `UserId`, `Title`, `Body`, `Type` (enum: `AppointmentBooked`, `AppointmentCancelled`, `AppointmentReminder`, `ReviewPrompt`, `InvitationReceived`), `IsRead` (bool), `CreatedAt`, `RelatedEntityId` (nullable — e.g., AppointmentId)
- `[DB]` Migration to add `Notifications` table
- `[BE]` Add `Notification` model and `NotificationRepository`
- `[BE]` Add `NotificationService` with: `CreateNotification`, `GetUnreadCount`, `GetNotificationsForUser` (paginated), `MarkAsRead`, `MarkAllAsRead`
- `[BE]` `GET /notifications` — returns paginated notifications for the current user, newest first
- `[BE]` `GET /notifications/unread-count` — returns integer count of unread notifications
- `[BE]` `POST /notifications/{id}/read` — marks a single notification as read
- `[BE]` `POST /notifications/read-all` — marks all notifications as read

## Acceptance Criteria
- [x] Notifications are scoped to the authenticated user — users cannot see each other's notifications
- [x] Unread count endpoint is cheap (single COUNT query)
- [x] Marking as read is idempotent (no error if already read)
- [x] Notifications are returned newest first
