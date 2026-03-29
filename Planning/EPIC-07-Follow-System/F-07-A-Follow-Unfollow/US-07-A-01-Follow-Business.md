# US-07-A-01: Follow Business

**Feature:** [[F-07-A-Follow-Unfollow|F-07-A: Follow / Unfollow]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **follow a business from their public page** so that **I can easily find and re-book them from my dashboard**.

## Tasks
- `[BE]` Implement `POST /follow` accepting `{ userId, businessId }` and creating a `Follow` record
- `[DB]` Follow table: `Id`, `UserId`, `BusinessId`
- `[FE]` Add a "Follow" button on the public business page
- `[FE]` Button toggles to "Following" state after a successful follow action

## Acceptance Criteria
- [x] Follow state persists after the page is refreshed
- [x] Revisiting a followed business page shows "Following" state on the button
- [x] A customer cannot follow the same business twice (duplicate follow is rejected)
- [x] Only authenticated customers can follow businesses
