# US-14-C-03: Dismiss Flag — Restore the Review as Clean

**Feature:** [[F-14-C-Flagged-Review-Moderation|F-14-C: Flagged Review Moderation]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **dismiss a flag when the review does not violate policy** so that **legitimate reviews remain visible and the owner's flag is cleared**.

## Tasks
- `[BE]` `POST /admin/reviews/{reviewId}/resolve` with `{ action: "dismiss" }` — clears `IsFlagged`, `FlagReason`, sets `ResolvedAt` and `ResolvedByAdminId` (reuses the same endpoint as US-14-C-02)
- `[FE]` "Dismiss Flag" button on each moderation queue entry (no confirmation needed — non-destructive)
- `[FE]` After dismissal, the review disappears from the queue
- `[FE]` In the owner's dashboard review list, a dismissed-flag review shows no "Flagged" badge (the flag was cleared)

## Acceptance Criteria
- [x] Dismissed review is no longer `IsFlagged = true` — flag badge disappears everywhere
- [x] The review remains fully visible on the public business page
- [x] The review disappears from the admin moderation queue after dismissal
- [x] Owner's dashboard review list no longer shows the "Flagged" badge for the dismissed review
