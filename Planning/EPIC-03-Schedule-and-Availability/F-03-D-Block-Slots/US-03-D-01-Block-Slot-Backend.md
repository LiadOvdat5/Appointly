# US-03-D-01: Block / Unblock Slot API

**Feature:** [[F-03-D-Block-Slots|F-03-D: Block Specific Slots]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Story
As a **business owner or assigned team member**, I want to **block or unblock a free time slot via the API** so that **customers cannot book it and the reason is optionally recorded**.

## Tasks
- `[DB]` Add `BlockNote` (nullable `nvarchar(500)`) to `AvailabilitySlots` table
- `[DB]` Migration for the new column
- `[BE]` `POST /businesses/{businessId}/services/{serviceId}/slots/{slotId}/block`
  - Body: `{ note?: string }`
  - Auth: requester must be the business owner OR a partner assigned to this service
  - Sets `Status = blocked`, sets `BlockNote` if provided
  - Returns `204 No Content`
- `[BE]` `DELETE /businesses/{businessId}/services/{serviceId}/slots/{slotId}/block`
  - Auth: same as above
  - Sets `Status = open`, clears `BlockNote`
  - Returns `204 No Content`
- `[BE]` Verify slot regeneration logic skips slots where `Status = blocked` — add guard if missing
- `[BE]` Add `BlockNote` to the slot DTO returned by the availability endpoints

## Acceptance Criteria
- [x] A free slot can be blocked by the owner or an assigned partner; no other user can block it
- [x] Blocking a `booked` slot returns `400 Bad Request`
- [x] Unblocking a slot that is not blocked is idempotent (no error)
- [x] `BlockNote` is returned in slot DTOs so the UI can display it
- [x] Regenerating slots does not overwrite or delete blocked slots
