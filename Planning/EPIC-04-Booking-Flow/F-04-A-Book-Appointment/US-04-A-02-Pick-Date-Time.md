# US-04-A-02: Pick Date & Time

**Feature:** [[F-04-A-Book-Appointment|F-04-A: Book Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **pick a date and see the available time slots for that date** so that **I can choose a convenient appointment time**.

## Tasks
- `[FE]` Integrate the availability-aware date picker from [[US-03-C-02-Date-Picker-Available-Only|US-03-C-02]]
- `[FE]` On date selection, call `GET /businesses/{id}/services/{serviceId}/availability?date=` and render a slot grid
- `[FE]` Show a loading state while slots are being fetched
- `[FE]` Display a "No slots available" message if the API returns an empty array

## Acceptance Criteria
- [ ] Slots load dynamically after a date is selected
- [ ] Loading spinner is shown during the fetch
- [ ] Friendly empty state is shown if no slots are available for the selected date
- [ ] Selecting a slot stores it in booking state and enables the next step
