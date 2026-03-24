# US-01-B-01: Login

**Feature:** [[F-01-B-Login-Logout|F-01-B: Login & Logout]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **registered user**, I want to **log in with my email and password** so that **I can access my account and role-specific features**.

## Tasks
- `[BE]` Implement `POST /auth/login` endpoint; validate credentials and return a JWT stored in an HTTP-only cookie
- `[FE]` Build `LoginPage` with email/password form and inline error feedback
- `[FE]` On success, dispatch user info to Redux store and redirect to role-appropriate page

## Acceptance Criteria
- [ ] Wrong credentials display a clear error message without exposing which field is incorrect
- [ ] Successful login redirects BusinessOwner to dashboard and Customer to search/home
- [ ] JWT is stored in an HTTP-only cookie (not localStorage)
- [ ] Loading state is shown during API call
