# US-02-E-03: Remove Staff Member

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **remove a staff member from my business** so that **they no longer have access to my schedule or services**.

## Tasks
- `[BE]` Add `DELETE /businesses/{businessId}/staff/{userId}` endpoint
- `[BE]` Sets the `BusinessPartner` status to `Removed` (soft delete — preserve history)
- `[BE]` On removal, unlink the staff member from all services they were assigned to
- `[BE]` Only the business owner can call this endpoint (403 otherwise)
- `[FE]` "Remove" button on each staff member card (with confirmation dialog)
- `[FE]` Removed member disappears from the staff list immediately

## Acceptance Criteria
- [x]Owner can remove any staff member except themselves (owner cannot remove themselves)
- [x]Removal is a soft delete — `BusinessPartner.Status` is set to `Removed`, not deleted
- [x]Removed member is automatically unlinked from all assigned services
- [x]Confirmation dialog is shown before removal to prevent accidental deletes
- [x]Removed member immediately loses access to any staff-scoped dashboard views
