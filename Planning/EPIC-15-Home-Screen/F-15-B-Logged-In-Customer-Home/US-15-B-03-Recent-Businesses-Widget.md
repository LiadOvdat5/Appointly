# US-15-B-03: Recently Booked Businesses Widget

**Feature:** [[F-15-B-Logged-In-Customer-Home|F-15-B: Logged-In Customer Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **logged-in customer**, I want to **see businesses I've recently booked** so that **I can quickly rebook without having to search again**.

## Tasks
- `[BE]` Add `GET /appointments/recent-businesses` (or reuse appointment history) — return distinct businesses from the customer's past appointments, ordered by most recent appointment date, limit 5
- `[FE]` Show a horizontal scroll row of business cards (logo, name, category) derived from past appointments
- `[FE]` Each card links to `/business/{id}`
- `[FE]` Empty state: "You haven't booked with anyone yet. [Explore businesses →]" linking to `/search`

## Acceptance Criteria
- [x] Up to 5 distinct businesses are shown, ordered by most recent booking
- [x] Each card shows at minimum the business name and category
- [x] Clicking a card navigates to the correct business page
- [x] Empty state message and CTA are shown when there are no past bookings
