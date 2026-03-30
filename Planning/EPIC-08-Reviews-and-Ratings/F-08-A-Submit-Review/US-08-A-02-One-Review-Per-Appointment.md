# US-08-A-02: One Review Per Appointment

**Feature:** [[F-08-A-Submit-Review|F-08-A: Submit Review]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **ensure each appointment can only be reviewed once** so that **customers cannot inflate or spam ratings**.

## Tasks
- `[DB]` Add unique constraint on `Reviews(AppointmentId)` — one review per appointment
- `[BE]` In `ReviewService.CreateReview`, check for an existing review for that `AppointmentId` before inserting; return 409 if found
- `[FE]` After a review is submitted, hide the "Leave a Review" button and show "Reviewed" badge on that appointment

## Acceptance Criteria
- [x] Database enforces uniqueness at the constraint level (unique index on `AppointmentId`)
- [x] Backend returns 409 Conflict when a duplicate review is attempted
- [x] Frontend prevents re-submission by updating the UI state after a successful review
