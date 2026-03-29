# US-09-B-03: Appointment Reminder Notification

**Feature:** [[F-09-B-Appointment-Notifications|F-09-B: Appointment Notifications]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **receive a reminder notification 24 hours before my appointment** so that **I don't miss it**.

## Tasks
- `[BE]` Add a background job (e.g., `IHostedService` or Hangfire) that runs every hour
- `[BE]` Query upcoming appointments where `DateTime` is between now+23h and now+25h and no reminder has been sent yet
- `[DB]` Add `ReminderSentAt` (nullable DateTime) to `Appointments` table to track whether reminder was sent
- `[BE]` For each matched appointment, create `AppointmentReminder` notification for the customer
- `[BE]` Set `ReminderSentAt = now` to prevent duplicate reminders

## Acceptance Criteria
- [ ] Customer receives exactly one reminder notification per appointment (no duplicates)
- [ ] Reminder is sent approximately 24 hours before the appointment time
- [ ] Cancelled appointments do not trigger reminders
- [ ] The background job is resilient — if it fails once, it retries on the next run without double-sending
