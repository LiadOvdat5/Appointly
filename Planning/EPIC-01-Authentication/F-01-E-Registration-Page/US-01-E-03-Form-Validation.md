# US-01-E-03: Confirm-Password Field and Per-Field Validation

**Feature:** [[F-01-E-Registration-Page|F-01-E: Sign-Up Page — Role Selection & Post-Registration Flow]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **user filling in the sign-up form**, I want to **see validation errors next to the field that is wrong**, so that **I know exactly what to fix without guessing**.

## Context

The current form shows a single global `<Alert>` for any error. There is no confirm-password field. The "Or continue with" divider text is hardcoded in English (not using i18n).

## Tasks

- `[FE]` Add a **Confirm Password** field below the password field in `RegisterPage.tsx`
- `[FE]` Add client-side validation before the API call:
  - All fields required
  - Valid email format
  - Password ≥ 6 characters (matches BE minimum)
  - Password and confirm-password must match
- `[FE]` Display per-field inline error messages (below each `<Input>`) in addition to keeping the global alert for server errors
- `[FE]` Add i18n keys for all new validation strings (under `register.validation.*`):
  - `nameRequired`, `emailInvalid`, `passwordTooShort`, `passwordMismatch`
- `[FE]` Replace the hardcoded `"Or continue with"` string with a new i18n key `register.orContinueWith`
- `[FE]` Add the same key to the Hebrew translation

## Acceptance Criteria
- [ ] Submitting with empty fields shows per-field errors without calling the API
- [ ] Submitting with mismatched passwords shows an error on the confirm-password field
- [ ] A password shorter than 6 characters shows an inline error
- [ ] Server errors (duplicate email, etc.) still appear in the global `<Alert>`
- [ ] All strings are translated via i18n — no hardcoded English
