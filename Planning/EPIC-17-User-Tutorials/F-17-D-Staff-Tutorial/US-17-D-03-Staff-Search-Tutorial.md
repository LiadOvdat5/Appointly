# US-17-D-03: Staff – Search Tutorial

**Feature:** [[F-17-D-Staff-Tutorial|F-17-D: Staff Member Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **staff member who is also a customer**, I want **a tutorial the first time I visit the search page** so that **I know how to find businesses and book appointments for myself**.

## Tasks
- `[FE]` Reuse the customer search tutorial (same `tutorialKey: "search"`) — staff members share the search tutorial with customers
- `[FE]` No extra development needed beyond US-17-B-01 if the Tutorial framework checks role independently

## Acceptance Criteria
- [x] Staff members see the search tutorial on first visit to `/search`, same as customers
