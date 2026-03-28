# US-06-A-01: Upcoming Appointments (Business)

**Feature:** [[F-06-A-Business-Dashboard|F-06-A: Business Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see a list of upcoming appointments for my business on my dashboard** so that **I can prepare for my day and manage my schedule**.

## Tasks
- `[BE]` `GET /appointments?businessId={id}` filtered to future, non-canceled appointments
- `[FE]` Build appointment list or calendar view in `DashboardPage.tsx`
- `[FE]` Show for each appointment: customer name, service name, date, and time

## Acceptance Criteria
- [x] Only future, non-canceled appointments are shown
- [x] Appointments are sorted by date ascending (soonest first)
- [x] Empty state message is shown when no upcoming appointments exist
- [x] Customer name, service, date, and time are all displayed per row
