# US-01-F-02: Log In with Google

**Feature:** [[F-01-F-Google-OAuth|F-01-F: Google OAuth — Sign Up & Login]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** 🔲 Not Started

---

## Story
As a **returning user who signed up with Google**, I want to **log in using my Google account** so that **I can access my account without typing a password**.

## Tasks

### Backend
- `[BE]` `POST /auth/google` (same endpoint as sign-up) — when `GoogleId` or email already exists, skip creation and proceed directly to JWT issuance
- `[BE]` Ensure a credential-registered user (no `GoogleId`) who tries to log in via Google receives a clear error rather than a silent account merge

### Frontend
- `[FE]` Add "Continue with Google" button to `LoginPage` using `<GoogleLogin>` component
- `[FE]` On Google callback call `POST /auth/google` (no role step needed for returning users)
- `[FE]` Dispatch `setUser` and redirect to the user's home screen on success
- `[FE]` Display API error messages inline (e.g., "No account found — please sign up first")

## Acceptance Criteria
- [ ] Returning Google-registered users can log in with one click — no password required
- [ ] Session and cookie are established identically to email/password login
- [ ] A user who registered with email/password and tries Google login receives a clear error (no silent account merge)
- [ ] After login, redirect follows the same role-based logic as credential login
