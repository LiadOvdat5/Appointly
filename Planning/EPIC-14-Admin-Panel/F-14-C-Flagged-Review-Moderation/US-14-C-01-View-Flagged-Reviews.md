# US-14-C-01: View Flagged Reviews (Moderation Queue)

**Feature:** [[F-14-C-Flagged-Review-Moderation|F-14-C: Flagged Review Moderation]]
**Epic:** [[EPIC-14-Admin-Panel|EPIC-14: Admin Panel]]
**Status:** ✅ Done

---

## Story
As an **admin**, I want to **see a list of all flagged reviews with the owner's reason** so that **I can decide whether each one should be removed or left visible**.

## Tasks
- `[BE]` `GET /admin/reviews/flagged` — returns all reviews where `IsFlagged = true` and no resolution yet, ordered by flag date; includes: review content, star rating, customer name, business name, owner's flag reason, date flagged
- `[BE]` Add a `FlaggedAt` (DateTime?) column to `Reviews` — set when `IsFlagged` is set to `true`
- `[DB]` Migration for `FlaggedAt`
- `[FE]` Admin page at `/admin/reviews/flagged` shows the moderation queue
- `[FE]` Each entry shows: business name, reviewer name (anonymized), rating, comment, flag reason, date flagged
- `[FE]` Empty state when no reviews are pending moderation

## Acceptance Criteria
- [x] Only reviews that are flagged AND not yet resolved appear in the queue
- [x] Each entry clearly shows the owner's reason for flagging
- [x] The list is accessible only to admins
- [x] Empty queue shows a "No pending flags" message
