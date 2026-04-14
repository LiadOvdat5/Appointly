# US-17-D-01: Staff – Home Page Tutorial

**Feature:** [[F-17-D-Staff-Tutorial|F-17-D: Staff Member Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **new staff member**, I want **a tutorial the first time I open my home page** so that **I understand how to view my upcoming appointments, my workplace, and my assigned services**.

## Tutorial Steps
1. **Welcome** — "Welcome to your staff portal! Here's a quick overview."
2. **Workplace card** — "This is your business — tap to view the business page."
3. **Assigned services** — "These are the services you're assigned to perform."
4. **Next appointment** — "Your next appointment is shown here at a glance."
5. **Quick stats** — "A summary of your upcoming workload is shown here."
6. **Schedule** — "Manage your own availability using the schedule editor."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="staff-home" steps={...} />` to `PartnerHomePage`
- `[FE]` Add i18n keys: `tutorials.staffHome.*`

## Acceptance Criteria
- [ ] Tutorial shows on first visit to the staff home page
- [ ] Steps reference the actual sections of the staff home UI
