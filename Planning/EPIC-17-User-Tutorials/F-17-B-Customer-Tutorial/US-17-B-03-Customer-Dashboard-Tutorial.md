# US-17-B-03: Customer – Dashboard Tutorial

**Feature:** [[F-17-B-Customer-Tutorial|F-17-B: Customer Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **new customer**, I want **a tutorial the first time I open my dashboard** so that **I know where to find my upcoming appointments, history, and followed businesses**.

## Tutorial Steps
1. **Upcoming appointments** — "Your next appointments are listed here."
2. **Booking history** — "View all your past appointments here."
3. **Followed businesses** — "Businesses you follow appear here for quick access."
4. **Cancel appointment** — "You can cancel an upcoming appointment from this list."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="customer-dashboard" steps={...} />` to customer `DashboardPage`
- `[FE]` Add i18n keys: `tutorials.customerDashboard.*`

## Acceptance Criteria
- [x] Tutorial shows on first visit to the customer dashboard
- [x] Steps highlight the correct dashboard sections
