# US-04-A-01: Select Service

**Feature:** [[F-04-A-Book-Appointment|F-04-A: Book Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **select a service to start the booking process** so that **the booking flow is pre-configured with the correct service details**.

## Tasks
- `[FE]` "Book" button on each service card (on the public business page) opens the booking flow
- `[FE]` Pre-select the clicked service in the booking Redux state before navigating to `BookingPage.tsx`
- `[FE]` Redirect unauthenticated users to `/login` before proceeding

## Acceptance Criteria
- [ ] Clicking "Book" on a service card opens the booking flow with that service already selected
- [ ] Unauthenticated users are redirected to login; selected service context is preserved for after login
- [ ] The selected service name, price, and duration are shown in the booking flow header
