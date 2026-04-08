# US-01-E-02: Redirect to the Right Destination After Sign-Up

**Feature:** [[F-01-E-Registration-Page|F-01-E: Sign-Up Page — Role Selection & Post-Registration Flow]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **newly registered user**, I want to **be taken to the right page automatically after signing up**, so that **I can start using the platform without any extra steps**.

## Context

`RegisterPage.tsx` registers the user and logs them in, but navigation is marked with a `TODO` comment and never executes. The session is stored in Redux but the user stays on `/register`.

`LoginPage.tsx` already has the correct role-to-route mapping for reference:
- `admin` → `/admin`
- `partner` → `/staff-dashboard/:businessId`
- `owner` → `/dashboard`
- `client` → `/customer-dashboard`

After registration, new owners should go to `/onboarding` (not `/dashboard`) since they have no business yet.

## Tasks

- `[FE]` Import `useNavigate` in `RegisterPage.tsx`
- `[FE]` After the register + auto-login sequence succeeds, navigate based on role:
  - `owner` → `/onboarding`
  - `client` → `/customer-dashboard`
- `[FE]` Remove the `TODO` comment

## Acceptance Criteria
- [ ] A new Customer is redirected to `/customer-dashboard` after signing up
- [ ] A new Business Owner is redirected to `/onboarding` after signing up
- [ ] The redirect happens automatically — no extra user action required
- [ ] If registration fails the user stays on `/register` with the error shown
