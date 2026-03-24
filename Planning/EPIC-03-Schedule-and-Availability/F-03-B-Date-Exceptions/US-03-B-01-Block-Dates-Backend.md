# US-03-B-01: Block Dates — Backend

**Feature:** [[F-03-B-Date-Exceptions|F-03-B: Date Exceptions]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ BE Done

---

## Story
As a **business owner**, I want to **block off specific dates such as holidays or vacations** so that **no appointments can be booked on those days**.

## Tasks
- `[DB]` Create `DateException` model with fields: `Id`, `BusinessId`, `Date`, `Reason` (optional)
- `[BE]` Update slot generation logic to return no slots for dates that have a matching `DateException`
- `[BE]` Expose endpoints to create and delete date exceptions

## Acceptance Criteria
- [ ] Blocked dates return an empty slot list from the availability API
- [ ] Date exception can optionally include a reason (e.g., "Public Holiday")
- [ ] Multiple dates can be blocked independently
