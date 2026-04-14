# US-17-C-05: Owner – Staff Management Tutorial

**Feature:** [[F-17-C-Owner-Tutorial|F-17-C: Business Owner Tutorials]]
**Epic:** [[EPIC-17-User-Tutorials|EPIC-17: User Onboarding Tutorials]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want **a tutorial the first time I open the staff management tab** so that **I know how to invite team members, assign them to services, and manage them**.

## Tutorial Steps
1. **Staff list** — "Your current team members are listed here."
2. **Invite** — "Invite a new staff member by email. They'll receive a link to join."
3. **Pending invitations** — "Invitations you've sent appear here until accepted or expired."
4. **Service assignment** — "Assign staff members to the services they perform."
5. **Remove** — "You can remove a staff member at any time."

## Tasks
- `[FE]` Add `<Tutorial tutorialKey="staff-management" steps={...} />` to the staff management tab
- `[FE]` Add i18n keys: `tutorials.staffManagement.*`

## Acceptance Criteria
- [ ] Tutorial shows on first visit to the staff tab
- [ ] Covers invite, pending, and assignment sections
