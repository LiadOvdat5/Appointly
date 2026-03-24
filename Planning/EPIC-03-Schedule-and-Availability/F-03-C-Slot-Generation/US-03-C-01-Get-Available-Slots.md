# US-03-C-01: Get Available Slots

**Feature:** [[F-03-C-Slot-Generation|F-03-C: Slot Generation]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ BE Done

---

## Story
As a **customer**, I want to **see available time slots for a specific service on a given date** so that **I can choose when to book my appointment**.

## Tasks
- `[BE]` Implement `GET /businesses/{businessId}/services/{serviceId}/availability?date=` returning `string[]` of available time slots
- `[BE]` `SlotGenerationService` applies: weekly working rules, break rules, date exceptions, and already-booked slots to compute free slots
- `[BE]` Slot duration is derived from the service's configured duration

## Acceptance Criteria
- [ ] Slots that are already booked are excluded from the response
- [ ] Slots during break times are excluded
- [ ] Slots on blocked dates return an empty array
- [ ] Slot duration matches the service's configured duration
