# US-02-E-02: Invite Staff Member

**Feature:** [[F-02-E-Staff-Management|F-02-E: Staff Management]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **invite a new staff member by email** so that **they can join my business and be assigned to services**.

## Tasks
- `[BE]` `POST /businesses/{businessId}/invitations` already exists — verify it works correctly
- `[BE]` Invitation expires after 7 days (already modeled on `BusinessInvitation`)
- `[BE]` Invited user receives a `Pending` `BusinessPartner` record on invitation; moves to `Accepted` when they accept
- `[FE]` Add "Invite Staff" button on the Staff page
- `[FE]` Modal form with email input field
- `[FE]` Show pending invitations in a separate section below current staff (with expiry date)
- `[FE]` Allow owner to cancel a pending invitation

## Acceptance Criteria
- [x]Owner can open an invite modal and enter an email address
- [x]Submitting creates a `BusinessInvitation` with `Pending` status
- [x]Pending invitations are visible on the staff page, separate from accepted members
- [x]Owner can cancel a pending invitation before it is accepted
- [x]Inviting an already-active staff member shows a clear error message
