# F-03-D: Block Specific Slots

**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Goal
Allow a business owner or assigned team member to manually block any free time slot — with an optional note — directly from the slots view. Blocked slots are hidden from customers and survive slot regeneration.

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-03-D-01-Block-Slot-Backend\|US-03-D-01]] | Block / unblock slot API | ✅ Done |
| [[US-03-D-02-Block-Slot-UI\|US-03-D-02]] | Block slot from slots view (click → popover) | ✅ Done |
| [[US-03-D-03-Block-Slot-Surface-Note\|US-03-D-03]] | Surface block note in appointments view | ✅ Done |

## Dependencies
- EPIC-03 F-03-C (slot generation) must be done ✅
- EPIC-06 dashboard slots view must be accessible

## Notes
- `AvailabilitySlot.Status = blocked` already exists in the model — the BE work is additive (new fields + endpoint).
- Slot regeneration must skip slots where `Status = blocked` — verify this before shipping.
- Team member authorization: a partner may only block slots for services they are assigned to.
- v1: note field only. v2 could add a linked customer (e.g., "blocked for @John").
