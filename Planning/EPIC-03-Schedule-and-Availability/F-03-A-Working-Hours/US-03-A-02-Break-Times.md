# US-03-A-02: Break Times

**Feature:** [[F-03-A-Working-Hours|F-03-A: Working Hours]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ BE Done

---

## Story
As a **business owner**, I want to **set break times within a working day** so that **slots during my breaks cannot be booked by customers**.

## Tasks
- `[DB]` Create `BreakRule` model linked to a schedule entry, with start time and end time fields
- `[BE]` Update slot generation logic to skip any time ranges covered by a `BreakRule`

## Acceptance Criteria
- [ ] Slots that fall within a break period are not offered to customers
- [ ] Multiple break periods per day are supported (e.g., lunch and afternoon break)
- [ ] Break rules are tied to the schedule entry and persist correctly
