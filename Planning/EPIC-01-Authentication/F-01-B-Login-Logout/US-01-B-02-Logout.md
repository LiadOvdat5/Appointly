# US-01-B-02: Logout

**Feature:** [[F-01-B-Login-Logout|F-01-B: Login & Logout]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **logged-in user**, I want to **log out** so that **my session is ended and my account is secure**.

## Tasks
- `[BE]` Implement `POST /auth/logout` to invalidate the session / clear the cookie
- `[FE]` Trigger logout action that clears Redux auth state and removes the auth cookie
- `[FE]` Redirect user to the login page after logout

## Acceptance Criteria
- [ ] After logout, navigating to any protected route redirects to `/login`
- [ ] Auth cookie is cleared on the client after logout
- [ ] Redux auth state is reset to unauthenticated
- [ ] Logout button is accessible from the main navigation
