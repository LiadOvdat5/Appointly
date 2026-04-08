# F-01-E: Sign-Up Page — Role Selection & Post-Registration Flow

**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Context

`RegisterPage.tsx` and `POST /auth/register` exist but are incomplete:
- Role is always hardcoded to `client` on the backend; users cannot choose their role.
- After a successful registration the page does nothing (there is a `TODO` comment where the redirect should be).
- The form has no confirm-password field and no per-field validation — only a global error alert.

This feature closes those gaps so the sign-up flow is fully functional end-to-end.

---

## User Stories

| ID | Title | Status |
|----|-------|--------|
| [[US-01-E-01-Role-Selection\|US-01-E-01]] | Choose role during registration | ✅ Done |
| [[US-01-E-02-Post-Registration-Redirect\|US-01-E-02]] | Redirect to the right destination after sign-up | ✅ Done |
| [[US-01-E-03-Form-Validation\|US-01-E-03]] | Confirm-password field and per-field validation | ✅ Done |
