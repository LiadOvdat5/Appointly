# US-02-F-01: Invite Unregistered User via Email

**Feature:** [[F-02-F-Staff-Improvements|F-02-F: Staff Improvements]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** ✅ Done

---

## Story
As a **business owner**, I want to **invite someone to my staff by email even if they haven't registered on Appointly yet** so that **I can grow my team without needing them to sign up first**.

## Background
Current behavior: the invitation endpoint checks whether the email belongs to an existing user and fails if not. The invite should instead be stored as pending and the person should receive an email with a registration + acceptance link.

## Tasks
- `[BE]` When `POST /businesses/{id}/invitations` is called with an email that has no registered user:
  - Create the `BusinessInvitation` record with `Pending` status (no `UserId` yet)
  - Send an invitation email to the address with a unique token link: `/register?inviteToken=<token>`
- `[BE]` `GET /invitations/accept?token=<token>` endpoint:
  - If user is not registered: redirect to `/register?inviteToken=<token>` (token is preserved through registration)
  - If user is registered and logged in: accept the invitation directly
- `[BE]` On successful registration with `inviteToken`: auto-accept the invitation and link the new `UserId` to the `BusinessPartner` record
- `[BE]` Email service integration (SMTP or provider like SendGrid) — use the existing notification infrastructure if available
- `[FE]` No UI change needed on the invite modal — the backend handles unregistered users transparently
- `[FE]` After registration with invite token, redirect user to their staff home page (not the generic home)

## Acceptance Criteria
- [x] Inviting an unregistered email sends them an email with a sign-up link
- [x] Following the link takes them to the registration page with the token preserved
- [x] After registering, their invitation is automatically accepted and they become staff
- [x] The invitation appears as "Pending" on the owner's staff page until the person registers
- [x] Expired tokens show a clear error message on the registration page
