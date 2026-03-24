# US-06-B-01: Customer Upcoming Appointments

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **see my upcoming appointments on my dashboard** so that **I always know when my next bookings are**.

## Tasks
- `[BE]` `GET /appointments?clientId={id}` filtered to future, non-canceled appointments
- `[FE]` Build upcoming appointments list in `DashboardPage.tsx` (customer view)
- `[FE]` Show for each appointment: business name, service name, date, and time

## Acceptance Criteria
- [ ] Only future, non-canceled appointments are shown
- [ ] Appointments are sorted by date ascending (soonest first)
- [ ] Empty state message is shown if no upcoming appointments exist
- [ ] Each row shows business name, service, date, and time clearly
