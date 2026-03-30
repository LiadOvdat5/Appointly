# US-08-C-01: Owner Views Reviews in Dashboard

**Feature:** [[F-08-C-Owner-Review-Management|F-08-C: Owner Review Management]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see all reviews for my business in my dashboard** so that **I can monitor customer feedback and reputation**.

## Tasks
- `[BE]` `GET /businesses/{businessId}/reviews` already serves this; ensure owner authentication is not required for the endpoint (it's public), but the dashboard view can use the same endpoint
- `[FE]` Add a "Reviews" section/tab in the business owner dashboard
- `[FE]` Display all reviews: star rating, comment, reviewer name, date, and flag status
- `[FE]` Show overall rating summary at the top (average + count + star distribution bar chart)
- `[FE]` Highlight any reviews that are flagged (pending admin review)

## Acceptance Criteria
- [x] Owner can see all reviews for their business in the dashboard
- [x] Rating summary (average, count, distribution) is shown at the top
- [x] Flagged reviews are visually distinguished from regular ones
- [x] Reviews are sorted newest first by default
