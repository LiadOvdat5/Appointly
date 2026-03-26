# US-04-A-03: Booking Summary

**Feature:** [[F-04-A-Book-Appointment|F-04-A: Book Appointment]]
**Epic:** [[EPIC-04-Booking-Flow|EPIC-04: Booking Flow]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **review a summary of my booking before confirming** so that **I can verify all details are correct before the appointment is created**.

## Tasks
- `[FE]` Build a summary step displaying: business name, service name, selected date/time, and price
- `[FE]` "Confirm Booking" button submits the booking to the API
- `[FE]` "Back" button returns to the date/time selection step without losing state

## Acceptance Criteria
- [ ] All booking details are displayed correctly before confirmation
- [ ] Price is clearly shown so the customer knows what to expect
- [ ] "Back" button is available and returns to the previous step
- [ ] "Confirm Booking" is disabled while a submission is in progress
