# US-09-B-02: Cancellation Notification

**Feature:** [[F-09-B-Appointment-Notifications|F-09-B: Appointment Notifications]]
**Epic:** [[EPIC-09-Notifications|EPIC-09: Notifications]]
**Status:** 🔲 Not Started

---

## Story
As a **customer or business owner**, I want to **receive a notification when the other party cancels an appointment** so that **I can plan accordingly**.

## Tasks
- `[BE]` In `AppointmentService.CancelAppointment`, determine who is cancelling (owner or customer)
- `[BE]` If owner cancels: create `AppointmentCancelled` notification for the customer — "Your appointment at {BusinessName} on {Date} was cancelled by the business"
- `[BE]` If customer cancels: create `AppointmentCancelled` notification for the owner — "{CustomerName} cancelled their {ServiceName} appointment on {Date}"

## Acceptance Criteria
- [ ] Customer is notified when the owner cancels their appointment
- [ ] Owner is notified when a customer cancels their appointment
- [ ] Notification links to the relevant appointment
- [ ] Cancelling your own appointment does not send a notification to yourself
