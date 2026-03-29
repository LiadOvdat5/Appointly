# US-07-A-02: Unfollow Business

**Feature:** [[F-07-A-Follow-Unfollow|F-07-A: Follow / Unfollow]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **unfollow a business** so that **I can remove it from my followed businesses list if I am no longer interested**.

## Tasks
- `[BE]` Implement `DELETE /follow/{id}` to remove the follow record
- `[FE]` "Following" button on the public business page toggles back to "Follow" on click (with confirmation or immediate action)
- `[FE]` Unfollow is also available from the followed businesses section of the Customer Dashboard

## Acceptance Criteria
- [x] Unfollowing removes the business from the customer's followed list immediately
- [x] The "Following" button reverts to "Follow" after unfollowing
- [x] Unfollow action is confirmed by the button state change (no separate confirmation dialog required)
