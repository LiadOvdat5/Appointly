# US-14-C-02: Approve Flag — Remove the Review

**Feature:** [[F-14-C-Flagged-Review-Moderation|F-14-C: Flagged Review Moderation]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **approve a flagged review and remove it from the platform** so that **genuinely inappropriate reviews are taken down after human review**.

## Tasks
- `[DB]` Add `IsRemoved` (bool, default false) and `ResolvedAt` (DateTime?) and `ResolvedByAdminId` (Guid?) to `Reviews`
- `[DB]` Migration for these fields
- `[BE]` `POST /admin/reviews/{reviewId}/resolve` with body `{ action: "remove" | "dismiss" }` — sets `IsRemoved`, `ResolvedAt`, `ResolvedByAdminId`; moves review out of the moderation queue
- `[BE]` Update `GET /businesses/{businessId}/reviews` to exclude reviews where `IsRemoved = true` — removed reviews are no longer returned to the public
- `[BE]` Update business `AverageRating` / `ReviewCount` when a review is removed (re-calculate from remaining reviews)
- `[FE]` "Remove Review" button on each moderation queue entry (with a confirmation dialog)
- `[FE]` After removal, the review disappears from the queue and a success toast is shown
- `[FE]` The business's rating on the public page and search results updates to reflect the removal

## Acceptance Criteria
- [x] Removed reviews no longer appear on the public business page
- [x] The business's average rating and review count are recalculated after removal
- [x] The moderation action is recorded (who resolved it and when)
- [x] Only admins can call the resolve endpoint
