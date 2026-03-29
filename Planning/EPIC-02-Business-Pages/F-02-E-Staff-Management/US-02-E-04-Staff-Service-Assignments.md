# US-02-E-04: Manage Staff Service Assignments

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **click on a staff member and manage which services they are assigned to** so that **I can control who handles which appointments**.

## Tasks
- `[BE]` Add `GET /businesses/{businessId}/staff/{userId}/services` — returns services assigned to this staff member
- `[BE]` Add `PUT /businesses/{businessId}/staff/{userId}/services` — accepts a list of `serviceIds` to set assignments (replaces existing)
- `[FE]` Clicking a staff member card opens a detail panel/page
- `[FE]` Detail view shows a list of all business services with toggle/checkbox per service
- `[FE]` Owner can toggle service assignments and save

## Acceptance Criteria
- [x]Owner can view all services assigned to a specific staff member
- [x]Owner can add or remove service assignments with a single save action
- [x]Changes are reflected immediately after saving
- [x]A staff member can be assigned to zero or more services
