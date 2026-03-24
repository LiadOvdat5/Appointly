# US-01-A-01: Register with Credentials

**Feature:** [[F-01-A-User-Registration|F-01-A: User Registration]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **new user**, I want to **register with my name, email, and password** so that **I can create an account and access the platform**.

## Tasks
- `[BE]` Implement `POST /auth/register` endpoint accepting `RegisterUserDTO` and returning `UserDTO`
- `[BE]` Hash password using bcrypt before storing — never persist plain text
- `[FE]` Build registration form with fields: name, email, password, confirm password
- `[FE]` Add client-side validation (required fields, email format, password strength)

## Acceptance Criteria
- [ ] Form validates all required fields before submission
- [ ] API returns HTTP 201 with `UserDTO` on successful registration
- [ ] Password is never stored or returned in plain text
- [ ] Duplicate email registration returns a clear error message
