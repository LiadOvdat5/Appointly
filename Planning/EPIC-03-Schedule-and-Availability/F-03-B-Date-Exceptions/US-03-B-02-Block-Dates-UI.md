# US-03-B-02: Block Dates — UI

**Feature:** [[F-03-B-Date-Exceptions|F-03-B: Date Exceptions]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **block specific dates through a calendar UI in my schedule settings** so that **I can manage exceptions visually without using raw API calls**.

## Tasks
- `[FE]` Build a calendar component in the schedule settings panel that allows clicking to block/unblock dates
- `[FE]` Blocked dates are shown with a distinct visual indicator (e.g., strikethrough or red highlight)
- `[FE]` Clicking a blocked date unblocks it; clicking an available future date blocks it

## Acceptance Criteria
- [x] Blocked dates are visually distinguished on the calendar
- [x] Blocked dates can be unblocked by clicking them again
- [x] Past dates cannot be blocked
- [x] Changes are persisted immediately via the API
