# US-15-B-04: Pending Review Prompts

**Feature:** [[F-15-B-Logged-In-Customer-Home|F-15-B: Logged-In Customer Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **logged-in customer**, I want to **be prompted to leave a review for appointments I haven't reviewed yet** so that **I don't forget to share my experience**.

## Tasks
- `[BE]` Add `GET /appointments/pending-reviews` — return completed appointments where the customer has not yet submitted a review (join `Appointments` with `Reviews` on absence of a review row), limit 3
- `[FE]` Show a "Leave a Review" section listing up to 3 pending-review appointment cards
- `[FE]` Each card shows business name, service, and appointment date; tapping it opens the review form (inline modal or navigates to `/business/{id}#reviews`)
- `[FE]` Section is hidden entirely when there are no pending reviews

## Acceptance Criteria
- [x] Only appointments with `status = Completed` and no existing review are listed
- [x] Up to 3 prompts are shown at once
- [x] Tapping a prompt leads the user to the review submission UI
- [x] Section does not appear when there are no pending reviews
