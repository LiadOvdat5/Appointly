# US-01-F-01: Sign Up with Google

**Feature:** [[F-01-F-Google-OAuth|F-01-F: Google OAuth — Sign Up & Login]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **new user**, I want to **sign up using my Google account** so that **I can create an account without choosing a password**.

## Tasks

### Backend
- `[DB]` Make `passwordHash` column nullable in `Users` table — add EF Core migration
- `[DB]` Add `GoogleId` column (`nvarchar(255)`, nullable, unique index) to `Users`
- `[BE]` Add `POST /auth/google` endpoint — accepts `{ idToken: string, role: string }`
- `[BE]` Validate `idToken` by calling `https://oauth2.googleapis.com/tokeninfo?id_token=<token>`; verify `aud` matches the app's Google Client ID
- `[BE]` On success: look up user by `GoogleId` or `email`; if not found create a new `User` with the Google profile data (name, email, picture) and the chosen role
- `[BE]` Issue JWT HTTP-only cookie (same flow as credential login) and return `UserDTO`

### Frontend
- `[FE]` Install `@react-oauth/google`; wrap app with `<GoogleOAuthProvider clientId={...}>`
- `[FE]` Add "Continue with Google" button to `RegisterPage` using `<GoogleLogin>` component
- `[FE]` On Google callback: if no existing account, show role-selection step (Business Owner / Customer) before calling `POST /auth/google`
- `[FE]` After successful response dispatch `setUser` to Redux `auth` slice and redirect based on role

## Acceptance Criteria
- [x] Clicking "Continue with Google" opens the Google account picker popup
- [x] A new user is prompted to select a role (Owner / Customer) before the account is created
- [x] A `User` record is created with `GoogleId` set and `passwordHash` null
- [x] The same JWT cookie session is established as with email/password registration
- [x] Duplicate email (already registered with credentials) returns a clear error: "An account with this email already exists — please log in with your password"
