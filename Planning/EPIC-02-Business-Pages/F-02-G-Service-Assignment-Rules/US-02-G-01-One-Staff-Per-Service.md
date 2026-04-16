# US-02-G-01: Enforce One-Staff-Per-Service Assignment

**Feature:** [[F-02-G-Service-Assignment-Rules|F-02-G: Service Assignment Rules & Parallel Booking]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want **each service to have at most one assigned staff member** so that **responsibility for each service is clear and scheduling conflicts are minimized**.

## Context
Currently a service can be linked to multiple staff members. This story changes the cardinality to 1-to-1: one staff per service (but a staff member can still hold multiple services). This is a data model change and must be enforced at the API and UI layers.

## Tasks

### Database
- `[DB]` Add a nullable `AssignedStaffId` (FK → `Users.Id`) column to the `Services` table
- `[DB]` Remove the many-to-many `StaffServiceAssignments` join table entries — migrate existing data: if a service currently has multiple staff assigned, keep the first (oldest) assignment and discard the rest; log discarded rows
- `[DB]` Create EF Core migration

### Backend
- `[BE]` Update `Service` entity — add `AssignedStaffId` (nullable FK), remove old many-to-many navigation if now unused
- `[BE]` Add `GET /businesses/{businessId}/services/{serviceId}/assignment` — returns `{ staffId, staffName }` or `null`
- `[BE]` Add `PUT /businesses/{businessId}/services/{serviceId}/assignment` — body `{ staffId: string | null }` — sets or clears the assignment; validates staff belongs to the business or is the owner
- `[BE]` Enforce uniqueness: if `staffId` is being assigned and that staff already has a different service, still allow it (staff → many services is fine). If the service already has a different staff assigned, the old one is replaced (no error, just replaced)
- `[BE]` Update service-related DTOs to include `assignedStaff: { id, name } | null`

### Frontend
- `[FE]` Update service assignment UI: replace multi-select with a single-select staff picker (or "Unassigned" option)
- `[FE]` Reflect the new single-assignment model throughout the Staff Management and Services & Hours pages

## Acceptance Criteria
- [ ] Each service has at most one assigned staff member in the database
- [ ] Assigning a new staff member to a service automatically replaces the previous assignment
- [ ] A staff member can still be assigned to multiple services
- [ ] `GET /businesses/{id}/services/{id}/assignment` returns the current single assignee or null
- [ ] The UI presents a single-select staff picker (not a multi-select)
- [ ] Existing data is migrated without data loss to service records
