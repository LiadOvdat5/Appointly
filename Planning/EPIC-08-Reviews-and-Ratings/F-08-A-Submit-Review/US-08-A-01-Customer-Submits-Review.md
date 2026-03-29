# US-08-A-01: Customer Submits Review

**Feature:** [[F-08-A-Submit-Review|F-08-A: Submit Review]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** 🔲 Not Started

---

## Story
As a **customer**, I want to **leave a star rating and optional text comment on a business after a completed appointment** so that **I can share my experience with others**.

## Tasks
- `[DB]` Create `Reviews` table: `Id`, `BusinessId`, `CustomerId`, `AppointmentId`, `Rating` (1–5), `Comment` (nullable, max 500 chars), `CreatedAt`
- `[DB]` Migration to add `Reviews` table
- `[BE]` Add `Review` model and `ReviewRepository`
- `[BE]` Add `ReviewService` with `CreateReview`, `GetReviewsForBusiness`
- `[BE]` `POST /businesses/{businessId}/reviews` — accepts `CreateReviewDTO { AppointmentId, Rating, Comment }`
- `[BE]` Validate: caller must be the customer who had the appointment, appointment must be `Completed`, appointment must belong to the given business
- `[BE]` After creating a review, recalculate and update `Business.AverageRating` and `Business.ReviewCount`
- `[FE]` Add a "Leave a Review" button on past completed appointments in the customer dashboard
- `[FE]` Modal with star selector (1–5) and optional text area for the comment
- `[FE]` Show success state after submission; button changes to "Review Submitted"

## Acceptance Criteria
- [ ] Only customers can submit reviews (owners cannot review their own business)
- [ ] Review can only be submitted for a `Completed` appointment
- [ ] Star rating is required (1–5); comment is optional
- [ ] `AverageRating` and `ReviewCount` on the business are updated immediately after submission
- [ ] Submitting the same appointment review twice returns a 409 Conflict
