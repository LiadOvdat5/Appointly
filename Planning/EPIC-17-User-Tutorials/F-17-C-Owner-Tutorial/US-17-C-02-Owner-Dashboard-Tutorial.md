# US-17-C-02: Owner – Dashboard Tutorial

**Feature:** [[F-17-C-Owner-Tutorial|F-17-C: Business Owner Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** ✅ Done

---

## Story
As a **new business owner**, I want **a tutorial the first time I open my dashboard** so that **I understand the overview stats, appointment list, and quick actions**.

## Tutorial Steps
1. **Stats overview** — "Here's a snapshot of your business — total appointments, revenue, and more."
2. **Upcoming appointments** — "Manage today's and upcoming appointments from here."
3. **Edit business link** — "Go to your public business page to update services, photos, and info."
4. **Manage schedule** — "Set your working hours and availability rules here."
5. **Staff section** — "Invite and manage your team members from the Staff tab."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="owner-dashboard" steps={...} />` to `DashboardPage`
- `[FE]` Add i18n keys: `tutorials.ownerDashboard.*`

## Acceptance Criteria
- [ ] Tutorial shows on first visit to the owner dashboard
- [ ] Steps correctly reference the dashboard sections
