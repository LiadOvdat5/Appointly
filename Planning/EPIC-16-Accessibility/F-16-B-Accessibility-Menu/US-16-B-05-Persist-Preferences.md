# US-16-B-05: Persist Accessibility Preferences

**Feature:** [[F-16-B-Accessibility-Menu|F-16-B: Accessibility Menu Widget]]
**Epic:** [[EPIC-16-Accessibility|EPIC-16: Accessibility]]
**Status:** ✅ Done

---

## Story
As a **user with a disability**, I want **my accessibility settings to be remembered between sessions** so that **I do not have to reconfigure them every time I visit the app**.

## Tasks
- `[FE]` Save accessibility preferences (font size, high contrast, reduce motion) to `localStorage` under key `a11y-prefs`
- `[FE]` On app load (`main.tsx` / `App.tsx`), read preferences from `localStorage` and apply classes to `<html>` before first render to avoid flash
- `[FE]` If user is logged in, optionally sync preferences to their user profile via `PATCH /users/me` (low priority — localStorage is sufficient for MVP)

## Acceptance Criteria
- [x] Preferences persist after page refresh
- [x] Preferences persist after closing and reopening the browser
- [x] Applied before first paint (no flash of unstyled content)
