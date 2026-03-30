# US-08-C-02: Flag Inappropriate Review

**Feature:** [[F-08-C-Owner-Review-Management|F-08-C: Owner Review Management]]
**Epic:** [[EPIC-08-Reviews-and-Ratings|EPIC-08: Reviews & Ratings]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **flag a review as inappropriate** so that **an admin can review and potentially remove it if it violates policies**.

## Tasks
- `[DB]` Add `IsFlagged` (bool) and `FlagReason` (nullable string) columns to `Reviews` table
- `[BE]` `POST /businesses/{businessId}/reviews/{reviewId}/flag` — owner submits a reason; sets `IsFlagged = true`
- `[BE]` Only the business owner of that business can flag reviews on their business
- `[FE]` "Flag" button on each review in the owner dashboard view
- `[FE]` Small modal to enter a reason before flagging
- `[FE]` After flagging, show "Flagged — pending review" badge on the review

## Acceptance Criteria
- [x] Owner can flag any review on their business with a reason
- [x] Flagging does not immediately remove the review — it marks it for admin review
- [x] A review can only be flagged once (flag button is disabled after flagging)
- [x] Flagged reviews remain visible on the public page until an admin acts on them
