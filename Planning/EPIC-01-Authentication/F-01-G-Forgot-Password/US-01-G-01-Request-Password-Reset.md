# US-01-G-01: Request a Password Reset Email

**Feature:** [[F-01-G-Forgot-Password|F-01-G: Forgot Password]]
**Epic:** [[EPIC-01-Authentication|EPIC-01: Authentication & User Management]]
**Status:** ✅ Done

---

## Story
As a **user who forgot their password**, I want to **enter my email address and receive a reset link** so that **I can regain access to my account**.

## Tasks

### Backend
- `[DB]` Add `PasswordResetToken` (`nvarchar(512)`, nullable) and `PasswordResetTokenExpiry` (`datetime2`, nullable) columns to `Users` — add EF Core migration
- `[BE]` Create `IEmailService` / `EmailService` that sends transactional email via SMTP or SendGrid
- `[BE]` Add `POST /auth/forgot-password` endpoint — accepts `{ email: string }`
  - Look up user by email; if not found return **200 OK** anyway (do not reveal whether email exists)
  - Generate a cryptographically random token (`RandomNumberGenerator`), store its SHA-256 hash on the user row along with a 1-hour expiry
  - Send email containing `{frontendBaseUrl}/reset-password?token=<raw-token>`
- `[BE]` Register email service in DI; read SMTP / API key from `appsettings.json` (never hardcode)

### Frontend
- `[FE]` Add "Forgot password?" link on `LoginPage` that navigates to `/forgot-password`
- `[FE]` Create `ForgotPasswordPage` with a single email input and submit button
- `[FE]` On success show a confirmation message: "If an account exists for that email, a reset link has been sent"
- `[FE]` Add route `/forgot-password` → `ForgotPasswordPage` in `routes.tsx`

## Acceptance Criteria
- [ ] Submitting a registered email sends a reset email within a few seconds
- [ ] Submitting an unregistered email returns the same success message (no email enumeration)
- [ ] The reset link in the email is valid for 1 hour
- [ ] The raw token is never stored in the DB — only its hash
- [ ] Email credentials are never committed to source control
