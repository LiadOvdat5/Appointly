# US-02-E-06: Staff Portal — Restricted Dashboard Access

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **staff member (BusinessPartner)**, I want to **log in and access a restricted view of the business dashboard** so that **I can manage my assigned services and schedule without seeing other business settings**.

## Tasks
- `[BE]` Extend JWT claims or session context to include `businessPartnerId` and associated `businessId` when a partner logs in
- `[BE]` Ensure `/businesses/{id}/services/{id}/schedule` and `/availability` endpoints check that the caller is either the business owner OR an assigned partner for that service
- `[FE]` After login, if the user is a `BusinessPartner` (not owner), redirect them to a staff-scoped view of the business dashboard
- `[FE]` Staff dashboard shows only: their assigned services, the schedule editor for each service, and their upcoming appointments
- `[FE]` Hide all owner-only sections: business settings, staff management, invitations, analytics, theme
- `[FE]` Role-aware `RoleSidebar` — staff members see a minimal sidebar with only accessible items

## Acceptance Criteria
- [ ] A staff member who logs in sees only their assigned services and schedules
- [ ] Staff cannot access business settings, other staff members' data, or owner analytics
- [ ] Staff can edit the schedule of services they are assigned to
- [ ] Staff can view their own upcoming appointments
- [ ] Owner logging in to the same business sees the full dashboard (no restrictions)
