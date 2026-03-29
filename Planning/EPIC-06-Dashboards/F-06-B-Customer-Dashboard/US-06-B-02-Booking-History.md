# US-06-B-02: Booking History

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see my booking history including past appointments** so that **I can keep a record of services I've used**.

## Tasks
- `[BE]` `GET /appointments?clientId={id}` filtered to past dates
- `[FE]` Build a "History" section in the Customer Dashboard separate from upcoming appointments
- `[FE]` Display status badges (e.g., "Completed", "Canceled") on each history entry

## Notes
Implemented as a customer analytics section (date range filter + 6 toggleable metric cards) instead
of a raw history list — full history is accessible from My Appointments (`/dashboard/customer`).
Backend: `GET /api/reports/customer` returns totalBookings, completedBookings, canceledBookings,
totalSpent, favoriteBusinessName, favoriteServiceName.

## Acceptance Criteria
- [x] Past activity is surfaced via analytics metrics (completed, canceled counts, total spent)
- [x] Data is scoped to a configurable date range (defaults to current month)
- [x] Activity section is separate from the upcoming appointments preview
- [x] Full history with status badges is available via My Appointments link
