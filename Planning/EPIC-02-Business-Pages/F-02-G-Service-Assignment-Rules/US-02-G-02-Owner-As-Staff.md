# US-02-G-02: Owner Visible and Assignable in Staff Management

**Feature:** [[F-02-G-Service-Assignment-Rules|F-02-G: Service Assignment Rules & Parallel Booking]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **see myself listed in the Staff Management page under a dedicated "Owner" section and be able to assign or unassign myself from services** so that **my own schedule is tracked consistently alongside the rest of the team**.

## Context
Currently the owner is not shown on the Staff Management page — they only manage others. This story surfaces the owner as a first-class assignable person. The owner's management permissions (editing services, schedules, etc.) are never affected by assignment status; assignment only controls whether the owner appears as the responsible person for that service when slots are generated and bookings are made.

## Tasks

### Backend
- `[BE]` Update `GET /businesses/{businessId}/staff` to include the business owner in the response, with a flag `isOwner: true`
- `[BE]` The existing `PUT /businesses/{businessId}/services/{serviceId}/assignment` endpoint (from US-02-G-01) already accepts any valid userId; ensure the owner's userId is accepted without requiring a `BusinessPartner` record

### Frontend
- `[FE]` On the Staff Management page, add a visually distinct **"Owner" section** above (or separate from) the staff list, showing the owner's name, avatar, and role badge
- `[FE]` The owner card is clickable and opens the same detail/assignment panel as a staff card
- `[FE]` In the assignment panel for the owner, show all services with a single-select assignment toggle (same as US-02-G-01 UI, re-used)
- `[FE]` The owner section cannot be removed or have the owner "removed from the business" — hide the Remove action for the owner card
- `[FE]` In any staff picker (service assignment dropdowns, etc.) include the owner as a selectable option labelled "Owner name (Owner)"

## Acceptance Criteria
- [ ] The Staff Management page shows the owner in a dedicated "Owner" section
- [ ] The owner can be assigned to or unassigned from any service via the same UI as staff
- [ ] Assigning the owner to a service follows the same one-staff-per-service rule (US-02-G-01)
- [ ] The owner's full management permissions are unaffected by their assignment status
- [ ] The owner is included in staff picker dropdowns throughout the app
- [ ] There is no "Remove" option available for the owner entry
