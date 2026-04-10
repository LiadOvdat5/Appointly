# US-15-C-02: Today's Appointments Preview

**Feature:** [[F-15-C-Logged-In-Owner-Home|F-15-C: Logged-In Business Owner Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **logged-in business owner**, I want to **see today's appointments at a glance on my home screen** so that **I can prepare for my day without going into the full dashboard**.

## Tasks
- `[BE]` Confirm `GET /appointments?businessId={id}&date={today}` (or equivalent) returns today's appointments sorted by time — verify or add date filter support to `AppointmentController`
- `[FE]` Show a "Today" widget listing up to 5 upcoming appointments for today: customer name, service, time
- `[FE]` Show total count if more than 5 (e.g. "+3 more")
- `[FE]` "View full schedule" link navigates to `/dashboard/{businessId}`
- `[FE]` Empty state: "No appointments today. [Manage schedule →]"

## Acceptance Criteria
- [x] Only today's confirmed/upcoming appointments are shown
- [x] Each row shows customer name, service name, and appointment time
- [x] Overflow count is shown when there are more than 5
- [x] Empty state is shown when there are no appointments today
- [x] "View full schedule" links to the correct dashboard route
