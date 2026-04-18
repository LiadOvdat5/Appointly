# US-03-D-03: Surface Block Note in Appointments View

**Feature:** [[F-03-D-Block-Slots|F-03-D: Block Specific Slots]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see blocked slots and their notes alongside my appointments** so that **I have full context of my day without switching to the slot view**.

## Tasks
- `[BE]` Extend the appointments list endpoint (or add a separate endpoint) to include blocked slots for a given date range alongside booked appointments
- `[FE]` In the appointments/schedule day view, render blocked slots inline with the appointment list
- `[FE]` Blocked slot entries show the time range, a "Blocked" label, and the note if present
- `[FE]` Blocked slot entries have an "Unblock" quick action inline

## Acceptance Criteria
- [x] Blocked slots appear in the appointments view for the relevant date
- [x] Block note is visible at a glance without extra clicks
- [x] Unblocking from the appointments view works the same as from the slots view
