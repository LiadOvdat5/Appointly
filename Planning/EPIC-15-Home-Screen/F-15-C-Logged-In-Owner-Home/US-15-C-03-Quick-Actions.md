# US-15-C-03: Quick Action Links

**Feature:** [[F-15-C-Logged-In-Owner-Home|F-15-C: Logged-In Business Owner Home]]
**Epic:** [[EPIC-15-Home-Screen|EPIC-15: Home Screen Experience]]
**Status:** ✅ Done

---

## Story
As a **logged-in business owner**, I want to **access the most common management tasks from the home screen** so that **I can jump into my work immediately without navigating through menus**.

## Tasks
- `[FE]` Build a "Quick Actions" grid with icon + label tiles linking to:
  - **My Business Page** → `/business/{id}`
  - **Manage Services** → `/business/{id}` (edit mode / services tab)
  - **Manage Schedule** → `/businesses/{id}/schedule`
  - **View Dashboard** → `/dashboard/{businessId}`
- `[FE]` Hide this section entirely if the owner has no business yet

## Acceptance Criteria
- [x] Four quick-action tiles are shown for owners with an active business
- [x] Each tile has an icon and a clear label
- [x] Each tile navigates to the correct route
- [x] Section is hidden for owners who have not yet created a business
