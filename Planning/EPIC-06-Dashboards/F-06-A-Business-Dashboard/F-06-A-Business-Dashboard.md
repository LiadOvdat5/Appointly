# F-06-A: Business Dashboard

**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-06-A-01-Upcoming-Appointments\|US-06-A-01]] | See upcoming appointments | ✅ Done |
| [[US-06-A-02-Stats-Overview\|US-06-A-02]] | See stats overview (total bookings, revenue) | ✅ Done |
| [[US-06-A-03-Cancel-from-Dashboard\|US-06-A-03]] | Cancel an appointment from the dashboard | ✅ Done |
| [[US-06-A-04-Edit-Business-Link\|US-06-A-04]] | Navigate to business page editor | ✅ Done |
| [[US-06-A-05-Manage-Schedule\|US-06-A-05]] | Manage schedule from the dashboard | ✅ Done |

---

## Enhancement notes

**Completed appointments preview (2026-04-11):** `DashboardCompletedSection` now shows only the 3 most recent completed appointments. A "View all" link in the section header and a "+N more — View all" inline link (when list exceeds 3) both navigate to `/business/:slug/schedule` (appointments & slots view). The `viewAllHref` prop keeps the destination configurable without changing the component.

**Services & Hours card UX (2026-04-11):** The service card in `ServiceSelectionPage` was refactored from a single large clickable area into two explicit icon buttons — `edit_calendar` (availability & working hours → `/schedule/:businessId/:serviceId`) and `edit` (service details → `/dashboard/:slug/services/:id/edit`) — making the two distinct actions unambiguous.
