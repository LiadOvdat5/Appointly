# US-06-B-03: Customer Cancel (Dashboard)

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **cancel an upcoming appointment directly from my dashboard** so that **I can manage my bookings conveniently in one place**.

## Tasks
- `[BE]` Reuse `PUT /appointments/{id}/cancel` (see [[US-04-C-01-Customer-Cancel|US-04-C-01]])
- `[FE]` Add "Cancel" button to each upcoming appointment row in the Customer Dashboard
- `[FE]` Show a confirmation dialog before submitting
- `[FE]` Remove the canceled appointment from the upcoming list immediately on success

## Notes
Cancel functionality already exists on the My Appointments page (`/dashboard/customer`).
The customer dashboard (`/customer-dashboard`) does not duplicate it — instead the upcoming
preview links to My Appointments where cancel is available with confirmation dialog.

## Acceptance Criteria
- [x] Cancel is available on the My Appointments page (future appointments only)
- [x] Confirmation dialog is shown before submission
- [x] Canceled appointment is removed from the list and slot is freed
- [x] Dashboard upcoming preview links to My Appointments for management
