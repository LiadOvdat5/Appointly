# US-06-B-03: Customer Cancel (Dashboard)

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **cancel an upcoming appointment directly from my dashboard** so that **I can manage my bookings conveniently in one place**.

## Tasks
- `[BE]` Reuse `PUT /appointments/{id}/cancel` (see [[US-04-C-01-Customer-Cancel|US-04-C-01]])
- `[FE]` Add "Cancel" button to each upcoming appointment row in the Customer Dashboard
- `[FE]` Show a confirmation dialog before submitting
- `[FE]` Remove the canceled appointment from the upcoming list immediately on success

## Acceptance Criteria
- [ ] Only future appointments have a cancel button (past appointments do not)
- [ ] Confirmation dialog is shown before the cancellation is submitted
- [ ] Canceled appointment is removed from the upcoming list and the slot is freed for re-booking
