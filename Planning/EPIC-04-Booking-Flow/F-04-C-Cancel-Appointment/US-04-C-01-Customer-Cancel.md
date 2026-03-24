# US-04-C-01: Customer Cancel

**Feature:** [[F-04-C-Cancel-Appointment|F-04-C: Cancel Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ BE Done / 🔲 FE Pending

---

## Story
As a **customer**, I want to **cancel an upcoming appointment** so that **the slot is freed and I'm no longer committed to that booking**.

## Tasks
- `[BE]` Implement `PUT /appointments/{id}/cancel` that sets appointment status to `canceled`
- `[FE]` Add a "Cancel" button to each upcoming appointment in the customer appointments list
- `[FE]` Show a confirmation dialog before submitting the cancellation
- `[FE]` Update the appointment status in the UI immediately after cancellation

## Acceptance Criteria
- [ ] Only future (upcoming) appointments can be canceled; past appointments cannot
- [ ] Canceled status is shown on the appointment entry after cancellation
- [ ] The freed time slot becomes available for other customers to book
- [ ] A confirmation dialog is shown before the cancellation is submitted
