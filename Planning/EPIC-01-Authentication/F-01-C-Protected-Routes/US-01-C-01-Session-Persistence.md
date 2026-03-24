# US-01-C-01: Session Persistence

**Feature:** [[F-01-C-Protected-Routes|F-01-C: Protected Routes]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **user**, I want to **stay logged in when I refresh the page** so that **I don't have to re-authenticate every time I open the app**.

## Tasks
- `[FE]` Implement `authBootstrap` function that runs on app load to rehydrate Redux auth state from the cookie
- `[BE]` Validate JWT on each authenticated request and return user info from the cookie
- `[FE]` Show a loading spinner while the session is being rehydrated

## Acceptance Criteria
- [ ] User remains logged in after a full page refresh
- [ ] Expired or invalid JWT causes automatic redirect to `/login`
- [ ] Auth bootstrap runs before any protected route is rendered
