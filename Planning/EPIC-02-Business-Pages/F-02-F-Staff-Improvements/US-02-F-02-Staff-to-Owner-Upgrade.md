# US-02-F-02: Staff Member Becomes Business Owner

**Feature:** [[F-02-F-Staff-Improvements|F-02-F: Staff Improvements]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **staff member who starts their own business**, I want to **upgrade my account to a Business Owner** so that **I can create and manage my own business while still appearing as staff at my current workplace**.

## Background
Currently the `Role` field on `Users` is either `Customer` or `BusinessOwner`. A staff member is a `Customer` with a `BusinessPartner` record. If they want to become an owner, the role needs to change to `BusinessOwner`, but their existing `BusinessPartner` association must be preserved.

## Tasks
- `[BE]` Allow a `Customer`/staff-member to upgrade their role to `BusinessOwner`:
  - `PATCH /users/me/role` with `{ role: "BusinessOwner" }` — validates the user has no business yet (or allows multiple businesses per owner — decide this)
  - Updates `Users.Role` to `BusinessOwner`
  - Does **not** remove existing `BusinessPartner` records
- `[BE]` JWT re-issue: after role upgrade, issue a new JWT with the updated role claim (or instruct client to re-login)
- `[FE]` After upgrading, the JWT role changes — `authBootstrap` must handle the new role gracefully
- `[FE]` Sidebar for a user who is both `BusinessOwner` AND has `BusinessPartner` records:
  - Show **owner** navigation items (dashboard, my businesses, etc.)
  - Show a **"My Workplace"** section in the sidebar linking to the businesses where they are a staff member
- `[FE]` Add a "Become a Business Owner" CTA on the staff home page for staff members who haven't yet created a business
- `[FE]` After role upgrade, redirect user through the onboarding wizard to create their own business

## Acceptance Criteria
- [ ] A staff member can upgrade their account to Business Owner
- [ ] Their existing staff association at their workplace is preserved after upgrade
- [ ] The sidebar shows both owner navigation and a "My Workplace" link
- [ ] The new owner is guided through onboarding to create their own business
- [ ] Auth token is refreshed to reflect the new role without requiring manual re-login
