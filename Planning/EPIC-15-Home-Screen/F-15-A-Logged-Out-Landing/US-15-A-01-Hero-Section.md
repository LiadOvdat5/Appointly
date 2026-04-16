# US-15-A-01: Hero Welcome Section

**Feature:** [[F-15-A-Logged-Out-Landing|F-15-A: Logged-Out Landing Page]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **visitor**, I want to **immediately understand what Appointly is and how to get started** so that **I can decide whether to sign up as a customer or a business owner**.

## Tasks
- `[FE]` Create `HomePage.tsx` (replaces `SelectionPage`, `CustomerLandingPage`, `BusinessOwnerLandingPage`)
- `[FE]` Build hero section: headline, one-line description ("Book appointments with local businesses, effortlessly"), and two prominent CTAs — "Find a Business" (→ `/search`) and "List Your Business" (→ `/register?role=BusinessOwner`)
- `[FE]` Add a short "What is Appointly?" paragraph explaining the platform
- `[FE]` Update route `/` in `routes.tsx` to render `HomePage` with auth-state branching
- `[FE]` Retire `SelectionPage` route; redirect `/business-owner` and `/customer` to `/`

## Acceptance Criteria
- [x] Page renders at `/` for unauthenticated users
- [x] Headline and description are visible above the fold
- [x] Both CTAs are present and route to the correct pages
- [x] Authenticated users are NOT shown this section (they see the logged-in view)
