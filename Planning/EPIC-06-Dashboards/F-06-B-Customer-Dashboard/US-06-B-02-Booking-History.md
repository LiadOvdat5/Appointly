# US-06-B-02: Booking History

**Feature:** [[F-06-B-Customer-Dashboard|F-06-B: Customer Dashboard]]
**Epic:** [[EPIC-06-Dashboards|EPIC-06: Dashboards]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **see my booking history including past appointments** so that **I can keep a record of services I've used**.

## Tasks
- `[BE]` `GET /appointments?clientId={id}` filtered to past dates
- `[FE]` Build a "History" section in the Customer Dashboard separate from upcoming appointments
- `[FE]` Display status badges (e.g., "Completed", "Canceled") on each history entry

## Acceptance Criteria
- [ ] All past appointments are shown in the history section
- [ ] Each appointment shows its status with a visual badge (Completed / Canceled)
- [ ] History is separate from the upcoming appointments section
- [ ] Appointments are sorted by date descending (most recent first) in history
