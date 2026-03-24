# US-02-B-03: Available Slots Preview

**Feature:** [[F-02-B-Public-Business-Page|F-02-B: Public Business Page]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 FE Pending

---

## Story
As a **customer**, I want to **see the business's next available booking slots on their public page** so that **I can quickly know when I can book without starting the full booking flow**.

## Tasks
- `[FE]` Fetch and display the next 3 available dates/time slots from the availability API
- `[FE]` Each slot preview links directly to the booking flow with date/time pre-selected
- `[FE]` Depends on [[EPIC-03-Schedule-and-Availability|EPIC-03]] slot generation being complete

## Acceptance Criteria
- [ ] Up to 3 upcoming available slots are shown on the public page
- [ ] Slots reflect real availability (respects booked slots, breaks, and exceptions)
- [ ] Fully-booked days are not shown in the preview
- [ ] Clicking a slot navigates to the booking flow with that date/time pre-filled
