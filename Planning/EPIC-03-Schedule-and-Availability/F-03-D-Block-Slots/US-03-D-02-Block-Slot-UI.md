# US-03-D-02: Block Slot from Slots View

**Feature:** [[F-03-D-Block-Slots|F-03-D: Block Specific Slots]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Story
As a **business owner or team member**, I want to **click a free slot in the schedule/slots view and block it with an optional note** so that **I can prevent bookings on that slot without leaving the page**.

## Tasks
- `[FE]` Free slots in the slots view are clickable (cursor pointer, hover highlight)
- `[FE]` Clicking a free slot opens a popover/modal with:
  - Title: "Block this slot?"
  - Slot time shown (e.g., "Mon 21 Apr · 10:00–10:30")
  - Optional note textarea (placeholder: "Reason (optional)")
  - "Block Slot" confirm button and "Cancel" button
- `[FE]` On confirm: call `POST .../slots/{slotId}/block`, show loading state, close popover on success, update slot visually to `blocked`
- `[FE]` Blocked slots render visually distinct — greyed out / striped, with a lock icon
- `[FE]` Hovering a blocked slot shows a tooltip with the block note (if present)
- `[FE]` Clicking a blocked slot opens an "Unblock" popover with the note displayed and an "Unblock Slot" action
- `[FE]` On unblock: call `DELETE .../slots/{slotId}/block`, slot reverts to free state

## Acceptance Criteria
- [x] Free slots are clearly clickable and blocked slots are visually distinct
- [x] The popover shows the correct slot time before confirming
- [x] Blocking and unblocking update the UI immediately without a full page reload
- [x] Error states are handled (e.g., slot was just booked by a customer) — show toast
- [x] Works on both desktop and mobile layout
