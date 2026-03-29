# US-07-A-03: View Followed Businesses

**Feature:** [[F-07-A-Follow-Unfollow|F-07-A: Follow / Unfollow]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Story
As a **customer**, I want to **see all businesses I follow in my dashboard** so that **I have a convenient hub for my favourite businesses**.

## Tasks
- `[BE]` Implement `GET /follow/user/{id}` returning `BusinessDTO[]` for all businesses the user follows
- `[FE]` "Followed Businesses" section in the Customer Dashboard (see [[US-06-B-04-Followed-Businesses|US-06-B-04]])
- `[FE]` List updates immediately after a follow or unfollow action anywhere in the app

## Acceptance Criteria
- [x] All followed businesses are shown in the dashboard section
- [x] The list updates immediately when a business is followed or unfollowed
- [x] Empty state is shown if the customer follows no businesses
