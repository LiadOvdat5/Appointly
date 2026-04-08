# US-15-B-01: Personalised Greeting

**Feature:** [[F-15-B-Logged-In-Customer-Home|F-15-B: Logged-In Customer Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** 🔲 Not Started

---

## Story
As a **logged-in customer**, I want to **see a personalised greeting when I open the app** so that **the home screen feels welcoming and relevant to me**.

## Tasks
- `[FE]` Display "Hello, {firstName}!" (or full name) at the top of the home screen using the `auth` Redux slice
- `[FE]` Add a short contextual sub-line based on state: "You have an upcoming appointment" / "No appointments yet — find a business to get started"
- `[FE]` Include a quick-search shortcut bar (links to `/search`) directly beneath the greeting

## Acceptance Criteria
- [ ] Greeting uses the user's first name from the auth slice
- [ ] Sub-line reflects whether the user has any upcoming appointments
- [ ] Quick-search bar is visible and navigates to `/search`
