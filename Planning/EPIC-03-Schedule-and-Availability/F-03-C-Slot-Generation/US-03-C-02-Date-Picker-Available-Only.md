# US-03-C-02: Date Picker — Available Dates Only

**Feature:** [[F-03-C-Slot-Generation|F-03-C: Slot Generation]]
**Epic:** [[EPIC-03-Schedule-and-Availability|EPIC-03: Schedule & Availability]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **use a date picker that only allows me to select dates with available slots** so that **I don't attempt to book on days where no appointments are possible**.

## Tasks
- `[FE]` Build or configure a date picker component that disables fully-booked and exception dates
- `[FE]` Load availability data per month when the user navigates the calendar
- `[FE]` Integrate this date picker into the booking flow (see [[EPIC-04-Booking-Flow|EPIC-04]])

## Acceptance Criteria
- [x] Fully-booked dates are visually disabled and not selectable
- [x] Exception / blocked dates are visually disabled
- [x] The picker fetches availability data per month when navigated
- [x] Past dates are always disabled
