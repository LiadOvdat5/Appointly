# US-17-A-03: Per-Page Seen-State Tracking

**Feature:** [[F-17-A-Tutorial-Framework|F-17-A: Tutorial Framework]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **user**, I want **tutorials to show only the first time I visit a page** so that **I am not annoyed by repeated guidance on pages I already know**.

## Tasks
- `[FE]` Store seen-tutorial flags in `localStorage` under key `tutorials-seen` as a JSON object: `{ "search": true, "booking": true, ... }`
- `[BE]` Add `SeenTutorials` JSON column to `Users` table (or a separate `UserTutorialProgress` table)
- `[BE]` `PATCH /users/me/tutorials` endpoint accepts `{ tutorialKey: string }` and marks it seen for the authenticated user
- `[FE]` On app load with a logged-in user, sync `localStorage` flags from the backend (GET) and push unseen local flags (PATCH)
- `[FE]` Tutorial keys: `search`, `booking`, `owner-dashboard`, `business-edit`, `schedule-editor`, `staff-home`, `date-exceptions`
- `[DB]` Migration to add tutorial progress storage to Users

## Acceptance Criteria
- [ ] Tutorials do not repeat after being seen or skipped
- [ ] Seen state persists after page refresh
- [ ] Seen state syncs across devices for logged-in users
- [ ] Unauthenticated users' seen state is saved in localStorage only
