# EPIC-15: Home Screen Experience

**Goal:** Replace the generic landing pages with a smart home screen that adapts to the user's authentication state and role — a compelling marketing page for visitors and a personalised dashboard-preview for logged-in users.
**Status:** 🔄 In Progress (F-15-A ✅ Done, F-15-B 🔲 Not Started, F-15-C 🔲 Not Started)

← [[README|Planning Index]]

---

## Features

| # | Feature | Status |
|---|---------|--------|
| A | [[F-15-A-Logged-Out-Landing\|Feature A: Logged-Out Landing Page]] | ✅ Done |
| B | [[F-15-B-Logged-In-Customer-Home\|Feature B: Logged-In Customer Home]] | 🔲 Not Started |
| C | [[F-15-C-Logged-In-Owner-Home\|Feature C: Logged-In Business Owner Home]] | 🔲 Not Started |

---

## Notes

- Route `/` becomes the single home route; it renders different content based on `isAuthenticated` + `role`.
- The existing `SelectionPage`, `CustomerLandingPage`, and `BusinessOwnerLandingPage` are retired once this epic is complete.
- Logged-in views are lightweight previews (not full dashboards) — deep management stays in `/dashboard/*`.
