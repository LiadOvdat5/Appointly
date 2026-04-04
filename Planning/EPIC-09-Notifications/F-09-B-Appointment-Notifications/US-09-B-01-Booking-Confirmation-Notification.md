# US-09-B-01: Notification on Appointment Booked

**Feature:** [[F-09-B-Appointment-Notifications|F-09-B: Appointment Notifications]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **receive a notification when a customer books an appointment at my business** so that **I am always aware of new bookings**.

## Tasks
- `[BE]` In `AppointmentService.BookAppointment`, after successful booking call `NotificationService.CreateNotification` for the business owner
- `[BE]` Notification: type `AppointmentBooked`, title "New Appointment", body "{CustomerName} booked {ServiceName} on {Date}", `RelatedEntityId = appointmentId`
- `[BE]` Also notify the customer: type `AppointmentBooked`, title "Booking Confirmed", body "Your {ServiceName} appointment at {BusinessName} on {Date} is confirmed"

## Acceptance Criteria
- [x] Owner receives a notification immediately after a customer books
- [x] Customer receives a booking confirmation notification
- [x] Notifications link to the relevant appointment when clicked
