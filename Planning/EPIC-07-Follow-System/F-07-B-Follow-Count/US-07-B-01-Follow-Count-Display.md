# US-07-B-01: Follow Count Display

**Feature:** [[F-07-B-Follow-Count|F-07-B: Follow Count]]
**Epic:** [[EPIC-07-Follow-System|EPIC-07: Follow System]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see how many customers follow my business** so that **I can gauge the interest and reach of my business page**.

## Tasks
- `[BE]` Include follower count in `BusinessDTO` or expose it via a dedicated endpoint
- `[FE]` Display follower count on the public business page (visible to everyone)
- `[FE]` Display follower count in the Business Dashboard (summary stat)

## Acceptance Criteria
- [x] Follower count is visible to all users on the public business page
- [x] Follower count is shown as a summary stat in the Business Dashboard
- [x] Count updates in real time (or near real time) after a follow/unfollow event
