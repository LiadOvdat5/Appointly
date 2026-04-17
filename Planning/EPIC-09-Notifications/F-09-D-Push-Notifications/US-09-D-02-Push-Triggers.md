# US-09-D-02: Send Push on Appointment Events

**Feature:** [[F-09-D-Push-Notifications|F-09-D: Push Notifications (PWA)]]
**Status:** 🔲 Not Started

---

## User Story

As a **customer or business owner** with push notifications enabled,
I want to receive a native notification on my phone when key appointment events occur,
so that I stay informed even when the app is in the background or closed.

---

## Notification Events

| Event | Recipients | Title | Body |
|-------|-----------|-------|------|
| Appointment booked | Customer | "Booking Confirmed" | "Your {service} at {business} on {date} is confirmed." |
| Appointment booked | Business Owner | "New Booking" | "{customerName} booked {service} on {date}." |
| Appointment cancelled by customer | Business Owner | "Booking Cancelled" | "{customerName} cancelled their {service} on {date}." |
| Appointment cancelled by owner | Customer | "Appointment Cancelled" | "Your {service} at {business} on {date} was cancelled." |
| Reminder (24h before) | Customer | "Reminder" | "Your {service} at {business} is tomorrow at {time}." |
| Reminder (1h before) | Customer | "Reminder" | "Your {service} at {business} starts in 1 hour." |
| Review prompt (after appointment) | Customer | "How was it?" | "Leave a review for {business}." |

---

## Tasks

### [BE] PushNotificationService
- Create `IPushNotificationService` and `PushNotificationService`
- Inject `WebPushClient` (configured with VAPID keys)
- Method: `SendAsync(userId, title, body, url)` — fetches all active subscriptions for user, calls `WebPushClient.SendNotificationAsync(...)` for each
- Handle `WebPushException` with HTTP 410 Gone → delete stale subscription from DB (device uninstalled or revoked)
- Handle transient errors: log and continue (don't fail the parent operation)

### [BE] Wire push into appointment event points
- `AppointmentController.Book` / `AppointmentService.CreateAppointment`:
  - After DB save: call `PushNotificationService.SendAsync` for both customer and business owner
- `AppointmentController.Cancel` / `AppointmentService.CancelAppointment`:
  - After DB update: push to the non-cancelling party

### [BE] Reminder background job
- Add `ReminderPushJob` using `IHostedService` + a timer (or Hangfire if already present)
- Runs every 15 minutes; queries appointments where:
  - `Status = Confirmed`
  - `DateTime` is between `now + 23h45m` and `now + 24h15m` (24h reminder) OR between `now + 45m` and `now + 1h15m` (1h reminder)
  - `ReminderSent24h = false` / `ReminderSent1h = false`
- Sends push, sets flag to prevent duplicate sends
- Add `ReminderSent24h` (bit) + `ReminderSent1h` (bit) columns to `Appointments`

### [BE] Review prompt push
- Existing review-prompt logic (F-09-C) triggers after appointment end time
- Extend to also call `PushNotificationService.SendAsync` for the customer
- Deep link: `/business/{businessId}#reviews`

### [DB] Add reminder-sent flags to Appointments
- `ReminderSent24h` (bit, default 0)
- `ReminderSent1h` (bit, default 0)
- Migration: `AddAppointmentReminderFlags`

---

## Acceptance Criteria

- [ ] Customer receives push immediately after a booking is created
- [ ] Business owner receives push immediately when a customer books
- [ ] Correct party receives push when an appointment is cancelled
- [ ] Customer receives 24h reminder push; `ReminderSent24h` set to prevent duplicates
- [ ] Customer receives 1h reminder push; `ReminderSent1h` set to prevent duplicates
- [ ] Customer receives review-prompt push after appointment end time
- [ ] Stale subscriptions (HTTP 410) are automatically removed from DB
- [ ] Push failures are logged but do not fail the booking/cancellation response
- [ ] Tapping a push notification deep-links to the correct page in the PWA
