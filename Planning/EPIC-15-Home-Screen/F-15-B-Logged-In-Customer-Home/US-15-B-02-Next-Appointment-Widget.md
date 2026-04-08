# US-15-B-02: Next Appointment Widget

**Feature:** [[F-15-B-Logged-In-Customer-Home|F-15-B: Logged-In Customer Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** 🔲 Not Started

---

## Story
As a **logged-in customer**, I want to **see my next upcoming appointment at a glance** so that **I never miss a booking**.

## Tasks
- `[BE]` Confirm `GET /appointments?status=Confirmed` returns appointments sorted by date ascending (already exists — verify it includes business name and service name in the response)
- `[FE]` Fetch the customer's appointments on home screen load; display only the single soonest future confirmed appointment
- `[FE]` Card shows: business name, service name, date & time, business logo (if available)
- `[FE]` "View all appointments" link navigates to `/dashboard/customer`
- `[FE]` Empty state: "No upcoming appointments. [Find a business →]" linking to `/search`

## Acceptance Criteria
- [ ] Only the next (soonest) confirmed future appointment is shown
- [ ] Card displays business name, service, and formatted date/time
- [ ] Empty state is shown when there are no upcoming appointments
- [ ] "View all" link navigates correctly
