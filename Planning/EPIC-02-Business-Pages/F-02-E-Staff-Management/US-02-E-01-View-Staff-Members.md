# US-02-E-01: View Staff Members

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **see a list of all my current staff members** so that **I can manage my team from one place**.

## Tasks
- `[BE]` Add `GET /businesses/{businessId}/staff` endpoint returning all `BusinessPartner` records with status `Accepted` for that business
- `[BE]` Response DTO includes: `userId`, `name`, `email`, `joinedAt`, list of assigned service names
- `[FE]` Create `/dashboard/:businessId/staff` route and `StaffPage` component
- `[FE]` Display each staff member as a card: avatar/initials, name, email, joined date, assigned services count
- `[FE]` Add "Staff" link in the owner's business dashboard sidebar

## Acceptance Criteria
- [ ] Owner sees all accepted staff members for their business
- [ ] Each member shows their name, email, join date, and how many services they're assigned to
- [ ] Only the business owner can access this page (403 for others)
- [ ] Empty state is shown when there are no staff members besides the owner
