# US-04-A-04: Booking Confirmation

**Feature:** [[F-04-A-Book-Appointment|F-04-A: Book Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **receive a confirmation screen after booking** so that **I have proof that my appointment was successfully created**.

## Tasks
- `[BE]` Implement `POST /appointments` accepting `CreateAppointmentDTO` and returning `AppointmentDTO`
- `[FE]` On successful API response, navigate to a booking success screen
- `[FE]` Success screen shows: appointment ID, business name, service, date/time
- `[FE]` Provide a "View in Dashboard" link

## Acceptance Criteria
- [ ] Appointment ID is displayed on the success screen
- [ ] All booking details (service, date/time, business) are shown
- [ ] A link to view the appointment in the customer dashboard is provided
- [ ] If the slot was taken between summary and confirm, a clear error message is shown and the user is returned to slot selection
