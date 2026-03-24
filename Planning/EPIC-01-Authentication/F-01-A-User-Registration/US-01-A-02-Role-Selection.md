# US-01-A-02: Role Selection

**Feature:** [[F-01-A-User-Registration|F-01-A: User Registration]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **new user**, I want to **choose my role (Customer or BusinessOwner) during registration** so that **I am directed to the correct experience after sign-up**.

## Tasks
- `[FE]` Build `SelectionPage` with role choice UI (Customer vs. BusinessOwner)
- `[FE]` Route user to correct onboarding flow based on selected role
- `[BE]` Accept and validate role field in `RegisterUserDTO`
- `[BE]` Store role on the User entity; reject unknown roles with 400

## Acceptance Criteria
- [ ] Role selection is required — registration cannot complete without it
- [ ] Invalid or missing role values are rejected by the API
- [ ] Customer role navigates to the customer landing/search page post-register
- [ ] BusinessOwner role navigates to the business setup flow post-register
